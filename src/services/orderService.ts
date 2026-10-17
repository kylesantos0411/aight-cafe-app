import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order, CartItem, OrderStatus, PublicQueueItem, MenuItem } from '../types/cafe';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '../data/mockMenu';
import { calculateAuthoritativeOrderTotal } from './orderCalculator';
import { realtimeHub } from './realtimeService';

const STORAGE_ORDERS_KEY = 'aight_cafe_orders_v2';
const STORAGE_QUEUE_SEQ_KEY = 'aight_cafe_queue_seq';

// In-memory/localStorage persistent store for seamless local execution and fallback
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
    // 1. Authoritative price recalculation on service
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
      queueNumber: null,      // Queue number assigned only upon acceptance
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
        const { data, error } = await supabase
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

        if (error) throw error;
        if (data) {
          newOrder.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase insert failed, saving to local state:', err);
      }
    }

    const orders = this.getStoredOrders();
    this.saveOrders([newOrder, ...orders]);
    realtimeHub.notifyOrderUpdated(newOrder);
    return newOrder;
  }

  public async acceptOrder(orderId: string, _staffId: string = 'staff_operator'): Promise<Order> {
    const orders = this.getStoredOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId || o.code === orderId || o.requestReference === orderId);

    if (orderIndex === -1) {
      throw new Error(`Order ${orderId} not found.`);
    }

    const order = orders[orderIndex];
    if (order.status !== 'pending') {
      throw new Error(`Order ${order.code} has already been processed.`);
    }

    // Atomically assign queue number like A042
    const queueNumber = order.queueNumber || this.getNextQueueNumber();

    const updatedOrder: Order = {
      ...order,
      status: 'confirmed',
      queueNumber,
      code: queueNumber, // Now shows official pickup number
      acceptedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.rpc('fn_accept_order', {
          p_order_id: order.id,
          p_staff_id: _staffId,
        });
      } catch (err) {
        console.warn('Supabase fn_accept_order call failed:', err);
      }
    }

    orders[orderIndex] = updatedOrder;
    this.saveOrders(orders);
    realtimeHub.notifyOrderUpdated(updatedOrder);
    return updatedOrder;
  }

  public async verifyCashPayment(orderId: string, _staffId: string = 'staff_operator'): Promise<Order> {
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
          p_staff_id: _staffId,
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

  public async updateOrderStatus(
    orderId: string,
    nextStatus: OrderStatus,
    reason?: string,
    _staffId: string = 'staff_operator'
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
          p_staff_id: _staffId,
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

  public async getOrderByPrivateToken(token: string): Promise<Order | null> {
    const orders = this.getStoredOrders();
    return orders.find(o => o.privateToken === token) || null;
  }

  public async getAllOrders(): Promise<Order[]> {
    return this.getStoredOrders();
  }

  /**
   * ZERO PII Public Queue.
   * Only returns queue number, status, and last update timestamp.
   * Absolutely never reveals customer name, items, or notes.
   */
  public async getPublicQueue(): Promise<PublicQueueItem[]> {
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
