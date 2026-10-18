import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { QueueCard, Order, ReceiptSnapshot } from '../types/cafe';
import { realtimeHub } from './realtimeService';

const QUEUE_CARDS_STORAGE_KEY = 'aight_cafe_20_queue_cards_v1';

export interface CardActiveOrderResult {
  active: boolean;
  cardNumber: number;
  cardId: string;
  order?: {
    id: string;
    requestReference: string;
    queueNumber: string;
    customerName: string;
    status: Order['status'];
    paymentStatus: Order['paymentStatus'];
    paymentMethod: Order['paymentMethod'];
    items: Order['items'];
    subtotal: number;
    totalAmount: number;
    createdAt: string;
    receiptSnapshot?: ReceiptSnapshot | null;
  };
  message?: string;
}

class QueueCardService {
  /**
   * Initializes the default 20 physical cards (1 through 20)
   */
  private getDefaultCards(): QueueCard[] {
    const cards: QueueCard[] = [];
    for (let i = 1; i <= 20; i++) {
      const padded = i < 10 ? `0${i}` : `${i}`;
      cards.push({
        id: `card_uuid_${i}`,
        cardNumber: i,
        cardId: `card_${padded}`,
        status: 'available',
        currentOrderId: null,
      });
    }
    return cards;
  }

  /**
   * Reads cards from localStorage or returns default 20
   */
  public getStoredCards(): QueueCard[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(QUEUE_CARDS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length === 20) {
            return parsed;
          }
        }
      }
    } catch {
      // ignore
    }
    const defaults = this.getDefaultCards();
    this.saveStoredCards(defaults);
    return defaults;
  }

  public saveStoredCards(cards: QueueCard[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(QUEUE_CARDS_STORAGE_KEY, JSON.stringify(cards));
      }
    } catch {
      // ignore
    }
  }

  /**
   * Retrieves all 20 cards with remote sync if Supabase is active
   */
  public async getAllCards(): Promise<QueueCard[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('queue_cards')
          .select('*')
          .order('card_number', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: QueueCard[] = data.map(c => ({
            id: c.id,
            cardNumber: c.card_number,
            cardId: c.card_id,
            status: c.status,
            currentOrderId: c.current_order_id,
            allocatedAt: c.allocated_at,
            lastReleasedAt: c.last_released_at,
            lastReleasedBy: c.last_released_by,
            lastReleaseReason: c.last_release_reason,
          }));
          this.saveStoredCards(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase queue_cards fetch notice:', err);
      }
    }

    return this.getStoredCards();
  }

  /**
   * Parse card number from various string or number inputs:
   * e.g. "4", "04", "card_04", "card_4", 4
   */
  public parseCardNumber(input: string | number): number | null {
    if (typeof input === 'number') {
      return input >= 1 && input <= 20 ? input : null;
    }
    if (typeof input === 'string') {
      const match = input.trim().match(/^card_?0*([1-9]|1[0-9]|20)$/i) || input.trim().match(/^0*([1-9]|1[0-9]|20)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num >= 1 && num <= 20 ? num : null;
      }
    }
    return null;
  }

  /**
   * Finds the first available physical card (1 to 20)
   */
  public async findAvailableCard(): Promise<QueueCard | null> {
    const cards = await this.getAllCards();
    return cards.find(c => c.status === 'available') || null;
  }

  /**
   * Retrieves a physical card by its number (1 to 20)
   */
  public async getCardByNumber(cardNumber: number): Promise<QueueCard | null> {
    const cards = await this.getAllCards();
    return cards.find(c => c.cardNumber === cardNumber) || null;
  }

  /**
   * Atomically allocates an available card to an order upon payment confirmation
   */
  public async allocateCard(orderId: string, _staffId?: string): Promise<{ card: QueueCard; queueNumber: string }> {
    const cards = this.getStoredCards();
    const availableIndex = cards.findIndex(c => c.status === 'available');

    if (availableIndex === -1) {
      throw new Error('All 20 physical queue cards are currently occupied. Please wait for an active order to complete.');
    }

    const targetCard = cards[availableIndex];
    targetCard.status = 'occupied';
    targetCard.currentOrderId = orderId;
    targetCard.allocatedAt = new Date().toISOString();
    cards[availableIndex] = targetCard;
    this.saveStoredCards(cards);

    const queueNumber = `Card #${targetCard.cardNumber < 10 ? '0' : ''}${targetCard.cardNumber}`;

    // Remote sync
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('queue_cards')
          .update({
            status: 'occupied',
            current_order_id: orderId,
            allocated_at: new Date().toISOString(),
          })
          .eq('card_number', targetCard.cardNumber);
      } catch (err) {
        console.warn('Supabase card allocation notice:', err);
      }
    }

    realtimeHub.notifyQueueUpdated();
    return { card: targetCard, queueNumber };
  }

  /**
   * Normal Order Completion: Atomically releases the physical card back to 'available'
   */
  public async releaseCardOnCompletion(cardNumber: number, staffId?: string): Promise<QueueCard> {
    const cards = this.getStoredCards();
    const idx = cards.findIndex(c => c.cardNumber === cardNumber);
    if (idx === -1) throw new Error(`Card #${cardNumber} not found.`);

    const card = cards[idx];
    card.status = 'available';
    card.currentOrderId = null;
    card.lastReleasedAt = new Date().toISOString();
    card.lastReleasedBy = staffId || 'staff_cashier';
    card.lastReleaseReason = 'Order completed normally';
    cards[idx] = card;
    this.saveStoredCards(cards);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('queue_cards')
          .update({
            status: 'available',
            current_order_id: null,
            last_released_at: new Date().toISOString(),
            last_release_reason: 'Order completed normally',
          })
          .eq('card_number', cardNumber);
      } catch (err) {
        console.warn('Supabase releaseCardOnCompletion notice:', err);
      }
    }

    realtimeHub.notifyQueueUpdated();
    return card;
  }

  /**
   * Order Cancellation: Sets card to 'held_for_recovery' (Card is NOT automatically released)
   */
  public async holdCardOnCancellation(cardNumber: number, _reason: string, _staffId?: string): Promise<QueueCard> {
    const cards = this.getStoredCards();
    const idx = cards.findIndex(c => c.cardNumber === cardNumber);
    if (idx === -1) throw new Error(`Card #${cardNumber} not found.`);

    const card = cards[idx];
    card.status = 'held_for_recovery';
    cards[idx] = card;
    this.saveStoredCards(cards);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('queue_cards')
          .update({
            status: 'held_for_recovery',
          })
          .eq('card_number', cardNumber);
      } catch (err) {
        console.warn('Supabase holdCardOnCancellation notice:', err);
      }
    }

    realtimeHub.notifyQueueUpdated();
    return card;
  }

  /**
   * Explicit Manager Action: Releases a physically recovered card back to 'available'
   */
  public async releaseHeldCard(cardNumber: number, staffId?: string, reason?: string): Promise<QueueCard> {
    const cards = this.getStoredCards();
    const idx = cards.findIndex(c => c.cardNumber === cardNumber);
    if (idx === -1) throw new Error(`Card #${cardNumber} not found.`);

    const card = cards[idx];
    card.status = 'available';
    card.currentOrderId = null;
    card.lastReleasedAt = new Date().toISOString();
    card.lastReleasedBy = staffId || 'manager';
    card.lastReleaseReason = reason || 'Physically recovered by manager';
    cards[idx] = card;
    this.saveStoredCards(cards);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('queue_cards')
          .update({
            status: 'available',
            current_order_id: null,
            last_released_at: new Date().toISOString(),
            last_release_reason: reason || 'Physically recovered by manager',
          })
          .eq('card_number', cardNumber);
      } catch (err) {
        console.warn('Supabase releaseHeldCard notice:', err);
      }
    }

    realtimeHub.notifyQueueUpdated();
    return card;
  }

  /**
   * Resolves active order for a given card identifier (e.g. "4", "card_04")
   * Used when customer taps NFC or scans QR code on their physical card.
   * STRICT PRIVACY: Returns ONLY the currently active order.
   * If card is available or completed/cancelled, returns active: false.
   * Never leaks previous customers' data!
   */
  public async getCardActiveOrder(cardInput: string | number): Promise<CardActiveOrderResult> {
    const num = this.parseCardNumber(cardInput);
    if (!num) {
      return {
        active: false,
        cardNumber: 0,
        cardId: 'invalid',
        message: 'Invalid card identifier. Must be a registered physical card (1 to 20).',
      };
    }

    const padded = num < 10 ? `0${num}` : `${num}`;
    const cardId = `card_${padded}`;

    // Remote lookup first if Supabase is active
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('fn_get_card_active_order', {
          p_card_identifier: cardId,
        });

        if (!rpcErr && rpcRes) {
          if (rpcRes.active && rpcRes.orderId) {
            return {
              active: true,
              cardNumber: num,
              cardId,
              order: {
                id: rpcRes.orderId,
                requestReference: rpcRes.requestReference,
                queueNumber: rpcRes.queueNumber,
                customerName: 'Customer', // Minimize customer PII on public card screen
                status: rpcRes.orderStatus,
                paymentStatus: rpcRes.paymentStatus,
                paymentMethod: rpcRes.paymentMethod,
                items: rpcRes.items,
                subtotal: rpcRes.subtotal,
                totalAmount: rpcRes.totalAmount,
                createdAt: rpcRes.createdAt,
                receiptSnapshot: rpcRes.receiptSnapshot,
              },
            };
          } else {
            return {
              active: false,
              cardNumber: num,
              cardId,
              message: 'No active order currently linked to this card.',
            };
          }
        }
      } catch (err) {
        console.warn('Supabase fn_get_card_active_order notice:', err);
      }
    }

    // Local state fallback
    const cards = this.getStoredCards();
    const card = cards.find(c => c.cardNumber === num);

    if (!card || card.status === 'available' || !card.currentOrderId) {
      return {
        active: false,
        cardNumber: num,
        cardId,
        message: 'No active order currently linked to this card.',
      };
    }

    // Lookup linked order in local storage
    try {
      const ordersRaw = localStorage.getItem('aight_cafe_orders_v2');
      if (ordersRaw) {
        const orders: Order[] = JSON.parse(ordersRaw);
        const order = orders.find(o => o.id === card.currentOrderId);
        if (order && (order.status === 'preparing' || order.status === 'ready' || order.status === 'confirmed')) {
          return {
            active: true,
            cardNumber: num,
            cardId,
            order: {
              id: order.id,
              requestReference: order.requestReference,
              queueNumber: order.queueNumber || `Card #${padded}`,
              customerName: order.customerName,
              status: order.status,
              paymentStatus: order.paymentStatus,
              paymentMethod: order.paymentMethod,
              items: order.items,
              subtotal: order.subtotal,
              totalAmount: order.totalAmount,
              createdAt: order.createdAt,
              receiptSnapshot: order.receiptSnapshot,
            },
          };
        }
      }
    } catch {
      // ignore
    }

    return {
      active: false,
      cardNumber: num,
      cardId,
      message: 'No active order currently linked to this card.',
    };
  }
}

export const queueCardService = new QueueCardService();
