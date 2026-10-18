import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RefundRecord } from '../types/cafe';

const REFUNDS_LOCAL_KEY = 'aight_cafe_refund_records_v1';

class RefundService {
  public getStoredRefunds(): RefundRecord[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(REFUNDS_LOCAL_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return [];
  }

  public saveStoredRefunds(refunds: RefundRecord[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(REFUNDS_LOCAL_KEY, JSON.stringify(refunds));
      }
    } catch {
      // ignore
    }
  }

  /**
   * Records an authorized refund for an order
   */
  public async recordRefund(params: {
    orderId: string;
    cardNumber?: number;
    amount: number;
    refundMethod: 'cash' | 'gcash' | 'original_method';
    authorizingManagerId?: string;
    authorizingManagerName?: string;
    authorizedBy?: string;
    reason: string;
    notes?: string;
  }): Promise<RefundRecord> {
    const managerName = params.authorizingManagerName || params.authorizedBy || 'Store Manager';
    const record: RefundRecord = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderId: params.orderId,
      cardNumber: params.cardNumber,
      amount: params.amount,
      refundMethod: params.refundMethod,
      refundStatus: 'refunded',
      status: 'completed',
      authorizingManagerId: params.authorizingManagerId,
      authorizingManagerName: managerName,
      authorizedBy: managerName,
      reason: params.reason,
      notes: params.notes,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('refund_records').insert({
          id: record.id.startsWith('ref_') ? undefined : record.id,
          order_id: record.orderId,
          card_number: record.cardNumber,
          amount: record.amount,
          refund_method: record.refundMethod,
          refund_status: record.refundStatus,
          authorizing_manager_name: record.authorizingManagerName,
          authorizing_manager_id: record.authorizingManagerId && /^[0-9a-f-]{36}$/i.test(record.authorizingManagerId) ? record.authorizingManagerId : null,
          reason: record.reason,
          notes: record.notes,
          processed_at: record.processedAt,
        });
      } catch (err) {
        console.warn('Supabase refund_records notice:', err);
      }
    }

    const current = this.getStoredRefunds();
    this.saveStoredRefunds([record, ...current]);
    return record;
  }

  public async getRefundsForOrder(orderId: string): Promise<RefundRecord[]> {
    const all = this.getStoredRefunds();
    return all.filter(r => r.orderId === orderId);
  }
}

export const refundService = new RefundService();
