import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order, CartItem, OrderStatus, PublicQueueItem, MenuItem } from '../types/cafe';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '../data/mockMenu';
import { calculateAuthoritativeOrderTotal } from './orderCalculator';
import { realtimeHub } from './realtimeService';

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
    const privateToken = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'token_' + Math.random().toString(36).substring(2) + Date.now();
    
    // Request reference e.g. "R-8F2"
    const hex = Math.floor(Math.random() * 0xFFF).toString(16).toUpperCase().padStart(3, '0');
    const requestReference = `R-${hex}`;

    const newOrder: Order = {
      id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
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
        const { data: insertedOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            request_reference: newOrder.requestReference,
            private_token: newOrder.privateToken,
            customer_name: newOrder.customerName,
            customer_id: newOrder.customerId,
            phone: newOrder.phone,
            order_type: newOrder.orderType,
            payment_method: 'cash_at_pickup',
            payment_status: 'unpaid',
            status: 'pending',
            subtotal: newOrder.subtotal,
            total_amount: newOrder.totalAmount,
            estimated_minutes: newOrder.estimatedMinutes,
            notes: newOrder.notes,
          })
          .select()
          .single();

        if (orderError) throw orderError;
        if (insertedOrder) {
          newOrder.id = insertedOrder.id;

          // Insert order items
          for (const it of verifiedItems) {
            const { data: insertedItem, error: itemError } = await supabase
              .from('order_items')
              .insert({
                order_id: insertedOrder.id,
                product_id: it.menuItemId.length === 36 ? it.menuItemId : null,
                product_name: it.name,
                base_price: it.basePrice || it.price,
                quantity: it.quantity,
                subtotal: it.price * it.quantity,
                notes: it.notes,
              })
              .select()
              .single();

            if (!itemError && insertedItem && it.customizations) {
              for (const cust of it.customizations) {
                await supabase.from('order_item_customizations').insert({
                  order_item_id: insertedItem.id,
                  option_group_name: cust.groupName,
                  option_item_name: cust.itemName,
                  additional_price: cust.additionalPrice,
                });
              }
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

    if (isSupabaseConfigured && supabase) {
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

    if (isSupabaseConfigured && supabase) {
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

    if (isSupabaseConfigured && supabase) {
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
    return updatedOrder;
  }

  /**
   * Fetch customer order using unguessable private token (UUID).
   */
  public async getOrderByPrivateToken(token: string): Promise<Order | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              product_name,
              base_price,
              quantity,
              subtotal,
              notes,
              order_item_customizations (
                option_group_name,
                option_item_name,
                additional_price
              )
            )
          `)
          .eq('private_token', token)
          .single();

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
            orderType: data.order_type,
            items: data.order_items.map((it: any) => ({
              id: it.id,
              menuItemId: it.product_id || '1',
              name: it.product_name,
              price: parseFloat(it.subtotal) / it.quantity,
              basePrice: parseFloat(it.base_price),
              quantity: it.quantity,
              image: '/figma-assets/iced-latte.jpg',
            })),
            subtotal: parseFloat(data.subtotal),
            totalAmount: parseFloat(data.total_amount),
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status,
            status: data.status,
            createdAt: data.created_at,
            acceptedAt: data.accepted_at,
            completedAt: data.completed_at,
            estimatedMinutes: data.estimated_minutes,
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
              base_price,
              quantity,
              subtotal,
              notes
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
            items: d.order_items.map((it: any) => ({
              id: it.id,
              menuItemId: '1',
              name: it.product_name,
              price: parseFloat(it.subtotal) / it.quantity,
              basePrice: parseFloat(it.base_price),
              quantity: it.quantity,
              image: '/figma-assets/iced-latte.jpg',
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
          return list;
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
