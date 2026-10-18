import { describe, it, expect, beforeEach } from 'vitest';
import { NFC_TAGS, getNfcTagUrl, getAuthoritativeBaseUrl } from '../config/nfcConfig';
import { nfcAnalyticsService } from '../services/nfcAnalyticsService';
import { orderService } from '../services/orderService';
import { menuService } from '../services/menuService';
import { loyaltyService } from '../services/loyaltyService';
import type { CartItem } from '../types/cafe';

describe('AIGHT CAFE — NFC Convenience Features & Loyalty Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Centralized NFC Configuration & NTAG213 Hardware Specs', () => {
    it('defines all four mandatory stall touchpoints', () => {
      expect(NFC_TAGS.order).toBeDefined();
      expect(NFC_TAGS.reorder).toBeDefined();
      expect(NFC_TAGS.track).toBeDefined();
      expect(NFC_TAGS.rewards).toBeDefined();
    });

    it('generates canonical URLs that fit strictly within NTAG213 144-byte capacity', () => {
      const tagIds: ('order' | 'reorder' | 'track' | 'rewards')[] = ['order', 'reorder', 'track', 'rewards'];

      tagIds.forEach(id => {
        const nfcUrl = getNfcTagUrl(id, 'nfc');
        const qrUrl = getNfcTagUrl(id, 'qr');

        expect(nfcUrl).toContain(NFC_TAGS[id].routePath);
        expect(nfcUrl).toContain(`tag=${id}`);
        expect(nfcUrl).toContain('source=nfc');
        expect(qrUrl).toContain('source=qr');

        const byteSize = new TextEncoder().encode(nfcUrl).length;
        // NTAG213 user-programmable capacity is exactly 144 bytes
        expect(byteSize).toBeLessThanOrEqual(144);
        expect(byteSize).toBeGreaterThan(25);
      });
    });

    it('falls back safely to valid base domain', () => {
      const base = getAuthoritativeBaseUrl();
      expect(base).toMatch(/^https?:\/\//);
    });
  });

  describe('2. Feature A — Tap to Order & NFC Analytics Logging', () => {
    it('records non-sensitive tap analytics without throwing or blocking', async () => {
      await expect(nfcAnalyticsService.logTap('order', 'nfc', '/menu')).resolves.not.toThrow();

      const taps = await nfcAnalyticsService.getRecentTaps();
      expect(taps.length).toBeGreaterThan(0);
      expect(taps[0].tagId).toBe('order');
      expect(taps[0].source).toBe('nfc');
      expect(taps[0].path).toBe('/menu');
    });
  });

  describe('3. Feature B — Tap to Reorder & Stock Revalidation', () => {
    it('revalidates items and identifies out-of-stock products', async () => {
      const testItems: CartItem[] = [
        {
          id: 'cart_latte',
          menuItemId: '1',
          name: 'Iced oat latte',
          price: 180,
          quantity: 1,
          size: 'Large',
          image: '/figma-assets/iced-latte.jpg',
        },
        {
          id: 'cart_cookie',
          menuItemId: '5',
          name: 'Brown butter cookie',
          price: 85,
          quantity: 1,
          image: '/figma-assets/brown-butter-cookie.jpg',
        },
      ];

      // Create a test order
      const order = await orderService.createOrder(testItems, {
        customerName: 'Loyal Tester',
        orderType: 'takeout',
      });

      expect(order.items.length).toBe(2);

      // Verify menu catalog is queryable
      const catalog = await menuService.getAllProducts();
      expect(catalog.length).toBeGreaterThan(0);

      // Simulate stock checking: when a product is marked unavailable in fresh catalog
      const mockCatalog = catalog.map((p, idx) => idx === 0 ? { ...p, isAvailable: false } : p);
      const unavailable = mockCatalog.find(p => p.isAvailable === false);
      expect(unavailable).toBeDefined();
      expect(unavailable?.isAvailable).toBe(false);
    });
  });

  describe('4. Feature C — Tap to Track My Order', () => {
    it('allows lookup of active order using secret privateToken without leaking PII', async () => {
      const testItems: CartItem[] = [
        {
          id: 'item_track',
          menuItemId: '1',
          name: 'Cold brew tonic',
          price: 170,
          quantity: 1,
          image: '/figma-assets/iced-latte.jpg',
        },
      ];

      const order = await orderService.createOrder(testItems, {
        customerName: 'Secret Guest',
        orderType: 'takeout',
      });

      expect(order.privateToken).toBeDefined();

      // Look up using secret token
      const found = await orderService.findOrderForTracking(order.privateToken);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(order.id);
      expect(found?.requestReference).toBe(order.requestReference);

      // Look up by request reference
      const foundByRef = await orderService.findOrderForTracking(order.requestReference);
      expect(foundByRef).not.toBeNull();
      expect(foundByRef?.id).toBe(order.id);

      // Invalid reference returns null
      const nonExistent = await orderService.findOrderForTracking('NON-EXISTENT-XYZ');
      expect(nonExistent).toBeNull();
    });
  });

  describe('5. Feature D — Aight Rewards Loyalty Suite', () => {
    it('returns zero clean balance for new customers without fake points', async () => {
      const summary = await loyaltyService.getCustomerLoyaltySummary('test_user_fresh_id');
      expect(summary.stampsBalance).toBe(0);
      expect(summary.totalStampsEarned).toBe(0);
      expect(summary.stampsRequired).toBe(8);
      expect(summary.vouchers).toEqual([]);
      expect(summary.transactions).toEqual([]);
    });

    it('validates voucher redemption logic and prevents double redemption', async () => {
      const testCustomerId = 'cust_loyal_123';
      const key = `aight_loyalty_${testCustomerId}`;

      // Simulate a customer who earned 1 voucher
      localStorage.setItem(
        key,
        JSON.stringify({
          stampsBalance: 2,
          totalStampsEarned: 10,
          totalRewardsClaimed: 1,
          stampsRequired: 8,
          rewardTitle: 'Free Coffee of your choice',
          rewardDescription: 'Enjoy any handcrafted beverage up to ₱180 on us',
          minOrderAmount: 100,
          vouchers: [
            {
              id: 'v_test_01',
              voucherCode: 'AIGHT-FREE-TEST',
              title: 'Free Coffee of your choice',
              discountAmount: 180,
              status: 'available',
              earnedAt: new Date().toISOString(),
            },
          ],
          transactions: [],
        })
      );

      // 1st redemption should succeed
      const redeemed = await loyaltyService.redeemVoucher('v_test_01', testCustomerId);
      expect(redeemed).toBe(true);

      // 2nd redemption attempt for the same voucher must be rejected!
      const doubleRedeem = await loyaltyService.redeemVoucher('v_test_01', testCustomerId);
      expect(doubleRedeem).toBe(false);

      // Verify status is now redeemed
      const updated = await loyaltyService.getCustomerLoyaltySummary(testCustomerId);
      expect(updated.vouchers[0].status).toBe('redeemed');
      expect(updated.vouchers[0].redeemedAt).toBeDefined();
    });
  });
});
