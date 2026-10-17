import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order } from '../types/cafe';

type OrderUpdateCallback = (order: Order) => void;
type QueueUpdateCallback = () => void;

class RealtimeHub {
  private broadcastChannel: BroadcastChannel | null = null;
  private orderListeners: Set<OrderUpdateCallback> = new Set();
  private queueListeners: Set<QueueUpdateCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
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
    }

    if (isSupabaseConfigured && supabase) {
      // Connect to Supabase Realtime channel
      const channel = supabase.channel('public:orders');
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            this.notifyQueueChanged();
          }
        )
        .subscribe();
    }
  }

  public notifyOrderUpdated(order: Order) {
    this.orderListeners.forEach(cb => cb(order));
    this.queueListeners.forEach(cb => cb());
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'ORDER_UPDATED', payload: order });
    }
  }

  public notifyQueueChanged() {
    this.queueListeners.forEach(cb => cb());
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'QUEUE_UPDATED' });
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
