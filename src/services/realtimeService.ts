import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order } from '../types/cafe';

type OrderUpdateCallback = (order: Order) => void;
type QueueUpdateCallback = () => void;

class RealtimeHub {
  private broadcastChannel: BroadcastChannel | null = null;
  private supabaseChannel: any = null;
  private orderListeners: Set<OrderUpdateCallback> = new Set();
  private queueListeners: Set<QueueUpdateCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('aight_cafe_realtime');
        this.broadcastChannel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'ORDER_UPDATED' && payload) {
            this.orderListeners.forEach(cb => cb(payload));
            this.queueListeners.forEach(cb => cb());
          } else if (type === 'QUEUE_UPDATED') {
            this.queueListeners.forEach(cb => cb());
          }
        };
      } catch {
        // ignore
      }
    }

    const proc = (globalThis as unknown as { process?: { env?: Record<string, string> } }).process;
    const isTest = Boolean(proc?.env?.NODE_ENV === 'test' || proc?.env?.VITEST);
    if (!isTest && typeof window !== 'undefined' && isSupabaseConfigured && supabase) {
      try {
        this.supabaseChannel = supabase.channel('aight_room_orders', {
          config: { broadcast: { self: false } },
        });

        // 1. Listen for cross-device broadcast events
        this.supabaseChannel
          .on('broadcast', { event: 'ORDER_EVENT' }, (message: any) => {
            const { type, order } = message?.payload || {};
            if (type === 'ORDER_UPDATED' && order) {
              this.orderListeners.forEach(cb => cb(order));
              this.queueListeners.forEach(cb => cb());
            } else {
              this.queueListeners.forEach(cb => cb());
            }
          })
          // 2. Listen for Postgres change events on orders table
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => {
              this.notifyQueueChanged();
            }
          )
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.debug('Realtime connected: aight_room_orders');
            }
          });
      } catch (err) {
        console.warn('Realtime subscription initialization error:', err);
      }
    }
  }

  public notifyOrderUpdated(order: Order) {
    this.orderListeners.forEach(cb => cb(order));
    this.queueListeners.forEach(cb => cb());
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'ORDER_UPDATED', payload: order });
    }
    if (this.supabaseChannel) {
      this.supabaseChannel
        .send({
          type: 'broadcast',
          event: 'ORDER_EVENT',
          payload: { type: 'ORDER_UPDATED', order },
        })
        .catch(() => {});
    }
  }

  public notifyQueueChanged() {
    this.queueListeners.forEach(cb => cb());
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'QUEUE_UPDATED' });
    }
    if (this.supabaseChannel) {
      this.supabaseChannel
        .send({
          type: 'broadcast',
          event: 'ORDER_EVENT',
          payload: { type: 'QUEUE_UPDATED' },
        })
        .catch(() => {});
    }
  }

  public subscribeToOrders(callback: OrderUpdateCallback): () => void {
    this.orderListeners.add(callback);
    return () => {
      this.orderListeners.delete(callback);
    };
  }

  public subscribeToQueue(callback: QueueUpdateCallback): () => void {
    this.queueListeners.add(callback);
    return () => {
      this.queueListeners.delete(callback);
    };
  }
}

export const realtimeHub = new RealtimeHub();
