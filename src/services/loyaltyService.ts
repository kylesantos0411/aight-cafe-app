import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface RewardVoucher {
  id: string;
  voucherCode: string;
  title: string;
  description?: string;
  discountAmount: number;
  status: 'available' | 'redeemed' | 'expired';
  earnedAt: string;
  redeemedAt?: string | null;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'reward_issued' | 'adjustment';
  stampsDelta: number;
  description: string;
  createdAt: string;
}

export interface LoyaltySummary {
  stampsBalance: number;
  totalStampsEarned: number;
  totalRewardsClaimed: number;
  stampsRequired: number;
  rewardTitle: string;
  rewardDescription: string;
  minOrderAmount: number;
  vouchers: RewardVoucher[];
  transactions: LoyaltyTransaction[];
}

const DEFAULT_SETTINGS = {
  stampsRequired: 8,
  minOrderAmount: 100,
  rewardTitle: 'Free Coffee of your choice',
  rewardDescription: 'Enjoy any handcrafted beverage up to ₱180 on us',
  rewardDiscountAmount: 180,
};

class LoyaltyService {
  private getLocalKey(customerId: string): string {
    return `aight_loyalty_${customerId}`;
  }

  /**
   * Fetch customer loyalty summary (stamps balance, active vouchers, history)
   */
  public async getCustomerLoyaltySummary(customerId: string): Promise<LoyaltySummary> {
    if (isSupabaseConfigured && supabase && /^[0-9a-f-]{36}$/i.test(customerId)) {
      try {
        const { data, error } = await supabase.rpc('fn_get_customer_loyalty_summary', {
          p_customer_id: customerId,
        });

        if (!error && data) {
          return {
            stampsBalance: data.stamps_balance || 0,
            totalStampsEarned: data.total_stamps_earned || 0,
            totalRewardsClaimed: data.total_rewards_claimed || 0,
            stampsRequired: data.stamps_required || DEFAULT_SETTINGS.stampsRequired,
            rewardTitle: data.reward_title || DEFAULT_SETTINGS.rewardTitle,
            rewardDescription: data.reward_description || DEFAULT_SETTINGS.rewardDescription,
            minOrderAmount: parseFloat(data.min_order_amount) || DEFAULT_SETTINGS.minOrderAmount,
            vouchers: (data.vouchers || []).map((v: any) => ({
              id: v.id,
              voucherCode: v.voucher_code,
              title: v.title,
              description: v.description,
              discountAmount: parseFloat(v.discount_amount),
              status: v.status,
              earnedAt: v.earned_at,
              redeemedAt: v.redeemed_at,
            })),
            transactions: (data.transactions || []).map((t: any) => ({
              id: t.id,
              type: t.type,
              stampsDelta: t.stamps_delta,
              description: t.description,
              createdAt: t.created_at,
            })),
          };
        }
      } catch (err) {
        console.warn('Supabase loyalty summary RPC failed, checking table directly:', err);
      }

      // Direct table query fallback
      try {
        const { data: balanceData } = await supabase
          .from('customer_loyalty')
          .select('*')
          .eq('customer_id', customerId)
          .single();

        const { data: vouchersData } = await supabase
          .from('reward_vouchers')
          .select('*')
          .eq('customer_id', customerId)
          .order('earned_at', { ascending: false });

        const { data: txData } = await supabase
          .from('loyalty_transactions')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (balanceData || vouchersData || txData) {
          return {
            stampsBalance: balanceData?.stamps_balance || 0,
            totalStampsEarned: balanceData?.total_stamps_earned || 0,
            totalRewardsClaimed: balanceData?.total_rewards_claimed || 0,
            stampsRequired: DEFAULT_SETTINGS.stampsRequired,
            rewardTitle: DEFAULT_SETTINGS.rewardTitle,
            rewardDescription: DEFAULT_SETTINGS.rewardDescription,
            minOrderAmount: DEFAULT_SETTINGS.minOrderAmount,
            vouchers: (vouchersData || []).map((v: any) => ({
              id: v.id,
              voucherCode: v.voucher_code,
              title: v.title,
              description: v.description,
              discountAmount: parseFloat(v.discount_amount || '180'),
              status: v.status,
              earnedAt: v.earned_at,
              redeemedAt: v.redeemed_at,
            })),
            transactions: (txData || []).map((t: any) => ({
              id: t.id,
              type: t.type,
              stampsDelta: t.stamps_delta,
              description: t.description,
              createdAt: t.created_at,
            })),
          };
        }
      } catch {
        // fallback to localStorage
      }
    }

    // LocalStorage fallback for offline / mock sessions
    try {
      const stored = localStorage.getItem(this.getLocalKey(customerId));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // Default clean initial customer loyalty state (NO fake points)
    const initial: LoyaltySummary = {
      stampsBalance: 0,
      totalStampsEarned: 0,
      totalRewardsClaimed: 0,
      stampsRequired: DEFAULT_SETTINGS.stampsRequired,
      rewardTitle: DEFAULT_SETTINGS.rewardTitle,
      rewardDescription: DEFAULT_SETTINGS.rewardDescription,
      minOrderAmount: DEFAULT_SETTINGS.minOrderAmount,
      vouchers: [],
      transactions: [],
    };
    return initial;
  }

  /**
   * Server-authoritative stamp crediting when an order completes.
   * Strictly enforces: Completed status, verified cash payment, min ₱100 spend, registered customer account.
   * Completely idempotent: 1 order = 1 stamp maximum.
   */
  public async awardLoyaltyForOrder(orderId: string): Promise<any> {
    if (isSupabaseConfigured && supabase && /^[0-9a-f-]{36}$/i.test(orderId)) {
      try {
        const { data, error } = await supabase.rpc('fn_award_order_loyalty', {
          p_order_id: orderId,
        });
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('fn_award_order_loyalty failed or table not migrated yet:', err);
      }
    }

    return { success: false, reason: 'Database RPC pending or not configured' };
  }

  /**
   * Redeem a customer reward voucher (Staff or Checkout operation)
   */
  public async redeemVoucher(voucherId: string, customerId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase && /^[0-9a-f-]{36}$/i.test(voucherId)) {
      try {
        const { error } = await supabase
          .from('reward_vouchers')
          .update({
            status: 'redeemed',
            redeemed_at: new Date().toISOString(),
          })
          .eq('id', voucherId)
          .eq('customer_id', customerId)
          .eq('status', 'available');

        return !error;
      } catch {
        // ignore
      }
    }

    // Local fallback
    try {
      const key = this.getLocalKey(customerId);
      const stored = localStorage.getItem(key);
      if (stored) {
        const data: LoyaltySummary = JSON.parse(stored);
        const voucher = data.vouchers.find(v => v.id === voucherId && v.status === 'available');
        if (voucher) {
          voucher.status = 'redeemed';
          voucher.redeemedAt = new Date().toISOString();
          localStorage.setItem(key, JSON.stringify(data));
          return true;
        }
      }
    } catch {
      // ignore
    }

    return false;
  }
}

export const loyaltyService = new LoyaltyService();
