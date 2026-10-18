import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order, CartItem, OrderStatus, PublicQueueItem, MenuItem } from '../types/cafe';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '../data/mockMenu';
import { calculateAuthoritativeOrderTotal } from './orderCalculator';
import { realtimeHub } from './realtimeService';
import { loyaltyService } from './loyaltyService';

const STORAGE_ORDERS_KEY = 'aight_cafe_orders_v2';
const STORAGE_QUEUE_SEQ_KEY = 'aight_cafe_queue_seq';

class OrderRepository {
  private getStoredOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  }

  private saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }

  private getNextQueueNumber(): string {
    let nextNum = 42;
    try {
      const saved = localStorage.getItem(STORAGE_QUEUE_SEQ_KEY);
      if (saved) {
        nextNum = parseInt(saved, 10) + 1;
      }
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_QUEUE_SEQ_KEY, nextNum.toString());
    return `A${nextNum.toString().padStart(3, '0')}`;
  }

  /**
   * Create a new order with authoritative backend price calculation.
   * Persists in Supabase PostgreSQL orders table.
   */
  public async createOrder(
    items: CartItem[],
    customerDetails: {
      customerName: string;
      phone?: string;
      orderType?: 'takeout' | 'dine-in';
      notes?: string;
      customerId?: string | null;
    },
    menuCatalog: MenuItem[] = INITIAL_MENU_ITEMS
  ): Promise<Order> {
    // 1. Authoritative price recalculation
    const { subtotal, totalAmount, verifiedItems } = calculateAuthoritativeOrderTotal(items, menuCatalog);

    // 2. Generate unguessable private token and short request reference
    const generateUUID = () => (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }));

    const privateToken = generateUUID();
    const orderId = generateUUID();
    
    // Request reference e.g. "R-8F2B"
    const hex = Math.floor(0x1000 + Math.random() * 0xEFFF).toString(16).toUpperCase();
    const requestReference = `R-${hex}`;

    const newOrder: Order = {
      id: orderId,
      requestReference,
      code: requestReference, // Initially shows request reference until staff accepts
      queueNumber: null,      // Queue number assigned ONLY upon staff acceptance
      privateToken,
      customerId: customerDetails.customerId || null,
      customerName: customerDetails.customerName.trim() || 'Alex',
      phone: customerDetails.phone,
      orderType: customerDetails.orderType || 'takeout',
      items: verifiedItems,
      subtotal,
      totalAmount,
      paymentMethod: 'cash_at_pickup',
      paymentStatus: 'unpaid',
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedMinutes: Math.max(8, items.length * 3),
      notes: customerDetails.notes,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            id: newOrder.id,
            request_reference: newOrder.requestReference,
            private_token: newOrder.privateToken,
            customer_name: newOrder.customerName,
            customer_id: newOrder.customerId && /^[0-9a-f-]{36}$/i.test(newOrder.customerId) ? newOrder.customerId : null,
            phone: newOrder.phone,
            order_type: newOrder.orderType,
            payment_method: 'cash_at_pickup',
            payment_status: 'unpaid',
            status: 'pending',
            subtotal: newOrder.subtotal,
            total_amount: newOrder.totalAmount,
            notes: newOrder.notes,
          });

        if (orderError) throw orderError;

        // Insert order items
        for (const it of verifiedItems) {
          const itemId = generateUUID();
          const { error: itemError } = await supabase
            .from('order_items')
            .insert({
              id: itemId,
              order_id: newOrder.id,
              product_id: it.menuItemId && /^[0-9a-f-]{36}$/i.test(it.menuItemId) ? it.menuItemId : null,
              product_name: it.name,
              unit_price: it.price,
              quantity: it.quantity,
              item_total: it.price * it.quantity,
              customization_summary: it.notes || (it.customizations ? it.customizations.map(c => `${c.groupName}: ${c.itemName}`).join(', ') : null),
            });

          if (!itemError && it.customizations) {
            for (const cust of it.customizations) {
              await supabase.from('order_item_customizations').insert({
                order_item_id: itemId,
                group_name: cust.groupName,
                option_name: cust.itemName,
                price_delta: cust.additionalPrice,
              });
            }
          }
        }
      } catch (err) {
        console.warn('Supabase order insert error, using local fallback:', err);
      }
    }

    const orders = this.getStoredOrders();
    this.saveOrders([newOrder, ...orders]);
    realtimeHub.notifyOrderUpdated(newOrder);
    return newOrder;
  }

  /**
   * Accept order (Staff operation).
   * Atomically assigns daily sequence queue number (e.g. A042) and marks confirmed.
   */
  public async acceptOrder(orderId: string, staffId: string = 'staff_operator'): Promise<Order> {
    const orders = this.getStoredOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId || o.code === orderId || o.requestReference === orderId);

    if (orderIndex === -1) {
      throw new Error(`Order ${orderId} not found.`);
    }

    const order = orders[orderIndex];
    if (order.status !== 'pending') {
      throw new Error(`Order ${order.code} has already been processed.`);
    }

    let queueNumber = this.getNextQueueNumber();

    if (isSupabaseConfigured && supabase && /^[0-9a-f-]{36}$/i.test(order.id) && /^[0-9a-f-]{36}$/i.test(staffId)) {
      try {
        const { data: rpcRes, error } = await supabase.rpc('fn_accept_order', {
          p_order_id: order.id,
          p_staff_id: staffId,
        });

        if (error) throw error;
        if (rpcRes && rpcRes.pickup_number) {
          queueNumber = rpcRes.pickup_number;
        }
      } catch (err) {
        console.warn('Supabase fn_accept_order call failed:', err);
      }
    }

    const updatedOrder: Order = {
      ...order,
      status: 'confirmed',
      queueNumber,
      code: queueNumber, // Official pickup number
      acceptedAt: new Date().toISOString(),
    };

    orders[orderIndex] = updatedOrder;
    this.saveOrders(orders);
    realtimeHub.notifyOrderUpdated(updatedOrder);
    return updatedOrder;
  }

  /**
   * Verify cash payment (Staff operation).
   */
  public async verifyCashPayment(orderId: string, staffId: string = 'staff_operator'): Promise<Order> {
    const orders = this.getStoredOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId || o.code === orderId);

    if (orderIndex === -1) {
      throw new Error(`Order ${orderId} not found.`);
    }

    const order = orders[orderIndex];
    const updatedOrder: Order = {
      ...order,
      paymentStatus: 'verified',
    };

    if (isSupabaseConfigured && supabase && /^[0-9a-f-]{36}$/i.test(order.id) && /^[0-9a-f-]{36}$/i.test(staffId)) {
      try {
        await supabase.rpc('fn_verify_cash_payment', {
          p_order_id: order.id,
          p_staff_id: staffId,
        });
      } catch (err) {
        console.warn('Supabase fn_verify_cash_payment failed:', err);
      }
    }

    orders[orderIndex] = updatedOrder;
    this.saveOrders(orders);
    realtimeHub.notifyOrderUpdated(updatedOrder);
    return updatedOrder;
  }

  /**
   * Transition order status through preparing -> ready -> completed / cancelled.
   * Strictly enforces cash payment verification before marking completed.
   */
  public async updateOrderStatus(
    orderId: string,
    nextStatus: OrderStatus,
    reason?: string,
    staffId: string = 'staff_operator'
  ): Promise<Order> {
    const orders = this.getStoredOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId || o.code === orderId);

    if (orderIndex === -1) {
      throw new Error(`Order ${orderId} not found.`);
    }

    const order = orders[orderIndex];

    // HARD SECURITY GATE: Order can NEVER be completed unless cash payment has been verified
    if (nextStatus === 'completed' && order.paymentStatus !== 'verified') {
      throw new Error('Cash payment must be verified before completing order.');
    }

    const updatedOrder: Order = {
      ...order,
      status: nextStatus,
      cancellationReason: reason || order.cancellationReason,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : order.completedAt,
    };

    if (isSupabaseConfigured && supabase && /^[0-9a-f-]{36}$/i.test(order.id) && /^[0-9a-f-]{36}$/i.test(staffId)) {
      try {
        await supabase.rpc('fn_update_order_status', {
          p_order_id: order.id,
          p_new_status: nextStatus,
          p_reason: reason || null,
          p_staff_id: staffId,
        });
      } catch (err) {
        console.warn('Supabase fn_update_order_status failed:', err);
      }
    }

    orders[orderIndex] = updatedOrder;
    this.saveOrders(orders);
    realtimeHub.notifyOrderUpdated(updatedOrder);

    // Credit loyalty stamps to registered customer if completed & verified
    if (nextStatus === 'completed' && order.customerId) {
      loyaltyService.awardLoyaltyForOrder(order.id).catch(err => {
        console.debug('Loyalty stamp award notice:', err);
      });
    }

    return updatedOrder;
  }

  /**
   * Fetch all orders placed by an authenticated customer.
   */
  public async getCustomerOrders(customerId: string): Promise<Order[]> {
    const all = await this.getAllOrders();
    return all.filter(o => o.customerId === customerId);
  }

  /**
   * Fetch most recent active in-progress order for a customer.
   */
  public async getActiveCustomerOrder(customerId: string): Promise<Order | null> {
    const orders = await this.getCustomerOrders(customerId);
    const active = orders.find((o: Order) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
    return active || null;
  }

  /**
   * Lookup order by token, request reference (e.g. R-8F2B), or pickup number (e.g. A042).
   */
  public async findOrderForTracking(query: string): Promise<Order | null> {
    const trimmed = query.trim();
    if (!trimmed) return null;

    // 1. If UUID, direct token lookup
    if (/^[0-9a-f-]{36}$/i.test(trimmed)) {
      return this.getOrderByPrivateToken(trimmed);
    }

    // 2. Check stored orders by requestReference or code or queueNumber
    const all = await this.getAllOrders();
    const found = all.find(
      o =>
        o.privateToken === trimmed ||
        o.requestReference.toLowerCase() === trimmed.toLowerCase() ||
        o.code.toLowerCase() === trimmed.toLowerCase() ||
        (o.queueNumber && o.queueNumber.toLowerCase() === trimmed.toLowerCase())
    );
    return found || null;
  }

  /**
   * Fetch customer order using unguessable private token (UUID).
   */
  public async getOrderByPrivateToken(token: string): Promise<Order | null> {
    if (isSupabaseConfigured && supabase && /^[0-9a-f-]{36}$/i.test(token)) {
      try {
        const { data, error } = await supabase.rpc('fn_get_order_by_token', {
          p_private_token: token,
        });

        if (!error && data) {
          return {
            id: data.id,
            requestReference: data.request_reference,
            code: data.pickup_number || data.request_reference,
            queueNumber: data.pickup_number || null,
            privateToken: data.private_token,
            customerId: data.customer_id,
            customerName: data.customer_name,
            phone: data.phone,
            orderType: data.order_type || 'takeout',
            items: (data.items || []).map((it: any) => ({
              id: it.id,
              menuItemId: '1',
              name: it.product_name,
              price: parseFloat(it.unit_price),
              basePrice: parseFloat(it.unit_price),
              quantity: it.quantity,
              image: '/figma-assets/iced-latte.jpg',
              notes: it.customization_summary,
            })),
            subtotal: parseFloat(data.subtotal),
            totalAmount: parseFloat(data.total_amount),
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status,
            status: data.status,
            createdAt: data.created_at,
            acceptedAt: data.accepted_at,
            completedAt: data.completed_at,
            estimatedMinutes: 10,
            cancellationReason: data.cancellation_reason,
            notes: data.notes,
          };
        }
      } catch (err) {
        console.warn('Supabase getOrderByPrivateToken query error:', err);
      }
    }

    const orders = this.getStoredOrders();
    return orders.find(o => o.privateToken === token) || null;
  }

  /**
   * Fetch all staff orders.
   */
  public async getAllOrders(): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              product_name,
              unit_price,
              quantity,
              item_total,
              customization_summary
            )
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            requestReference: d.request_reference,
            code: d.pickup_number || d.request_reference,
            queueNumber: d.pickup_number || null,
            privateToken: d.private_token,
            customerId: d.customer_id,
            customerName: d.customer_name,
            phone: d.phone,
            orderType: d.order_type,
            items: (d.order_items || []).map((it: any) => ({
              id: it.id,
              menuItemId: '1',
              name: it.product_name,
              price: parseFloat(it.unit_price),
              basePrice: parseFloat(it.unit_price),
              quantity: it.quantity,
              image: '/figma-assets/iced-latte.jpg',
              notes: it.customization_summary,
            })),
            subtotal: parseFloat(d.subtotal),
            totalAmount: parseFloat(d.total_amount),
            paymentMethod: d.payment_method,
            paymentStatus: d.payment_status,
            status: d.status,
            createdAt: d.created_at,
            acceptedAt: d.accepted_at,
            completedAt: d.completed_at,
            estimatedMinutes: d.estimated_minutes,
            cancellationReason: d.cancellation_reason,
            notes: d.notes,
          }));
        }
      } catch (err) {
        console.warn('Supabase getAllOrders query error:', err);
      }
    }

    return this.getStoredOrders();
  }

  /**
   * ZERO-PII Public Queue Feed.
   * Never exposes customer name, items, or totals.
   */
  public async getPublicQueue(): Promise<PublicQueueItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('fn_get_public_queue');
        if (!error && data) {
          const list: PublicQueueItem[] = [];
          if (Array.isArray(data.ready)) {
            data.ready.forEach((r: any) => {
              list.push({
                queueNumber: r.pickup_number,
                status: 'ready',
                updatedAt: r.ready_at,
              });
            });
          }
          if (Array.isArray(data.preparing)) {
            data.preparing.forEach((p: any) => {
              list.push({
                queueNumber: p.pickup_number,
                status: 'preparing',
                updatedAt: p.started_at,
              });
            });
          }
          if (list.length > 0) {
            return list;
          }
        }
      } catch (err) {
        console.warn('Supabase fn_get_public_queue error:', err);
      }
    }

    const orders = this.getStoredOrders();
    return orders
      .filter(o => o.queueNumber && (o.status === 'preparing' || o.status === 'ready'))
      .map(o => ({
        queueNumber: o.queueNumber!,
        status: o.status as 'preparing' | 'ready',
        updatedAt: o.acceptedAt || o.createdAt,
      }));
  }
}

export const orderService = new OrderRepository();
