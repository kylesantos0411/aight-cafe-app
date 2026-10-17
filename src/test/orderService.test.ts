import { describe, it, expect, beforeEach } from 'vitest';
import { calculateAuthoritativeItemPrice, calculateAuthoritativeOrderTotal } from '../services/orderCalculator';
import { orderService } from '../services/orderService';
import { INITIAL_MENU_ITEMS } from '../data/mockMenu';
import type { CartItem, MenuItem } from '../types/cafe';

describe('Aight Cafe - Core Business & Security Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Authoritative Price Calculations', () => {
    it('calculates correct unit price matching Figma Screen 2 (₱140 base + ₱20 large + ₱20 oat milk = ₱180)', () => {
      const icedLatte = INITIAL_MENU_ITEMS.find(m => m.name === 'Iced latte')!;
      expect(icedLatte).toBeDefined();

      const result = calculateAuthoritativeItemPrice(icedLatte, {
        size: 'Large',
        milk: 'Oat milk',
        extraShot: false,
        quantity: 1,
      });

      expect(result.basePrice).toBe(140);
      expect(result.customizationTotal).toBe(40); // 20 large + 20 oat milk
      expect(result.unitPrice).toBe(180);
      expect(result.totalPrice).toBe(180);
    });

    it('calculates extra shot addon accurately (+₱30)', () => {
      const icedLatte = INITIAL_MENU_ITEMS.find(m => m.name === 'Iced latte')!;
      const result = calculateAuthoritativeItemPrice(icedLatte, {
        size: 'Large',
        milk: 'Oat milk',
        extraShot: true,
        quantity: 1,
      });

      expect(result.unitPrice).toBe(210); // 180 + 30
      expect(result.totalPrice).toBe(210);
    });

    it('recalculates authoritative total for cart matching Figma Screen 3 & 4 (Iced oat latte + Cookie = ₱265)', () => {
      const cartItems: CartItem[] = [
        {
          id: 'item_1',
          menuItemId: '1',
          name: 'Iced latte',
          price: 180,
          quantity: 1,
          image: '/figma-assets/iced-latte.jpg',
          size: 'Large',
          milk: 'Oat milk',
        },
        {
          id: 'item_2',
          menuItemId: '5',
          name: 'Brown butter cookie',
          price: 85,
          quantity: 1,
          image: '/figma-assets/brown-butter-cookie.jpg',
        },
      ];

      const { subtotal, totalAmount } = calculateAuthoritativeOrderTotal(cartItems, INITIAL_MENU_ITEMS);
      expect(subtotal).toBe(265);
      expect(totalAmount).toBe(265);
    });

    it('rejects order placement if an item is unavailable or out of stock', () => {
      const outOfStockCatalog: MenuItem[] = INITIAL_MENU_ITEMS.map(m =>
        m.name === 'Brown butter cookie' ? { ...m, isAvailable: false } : m
      );

      const cartItems: CartItem[] = [
        {
          id: 'item_cookie',
          menuItemId: '5',
          name: 'Brown butter cookie',
          price: 85,
          quantity: 1,
          image: '/figma-assets/brown-butter-cookie.jpg',
        },
      ];

      expect(() => {
        calculateAuthoritativeOrderTotal(cartItems, outOfStockCatalog);
      }).toThrow(/sold out/i);
    });
  });

  describe('2. Order Lifecycle & Atomic Queue Assignment', () => {
    it('creates an order in pending status with unguessable token and no queue number yet', async () => {
      const cartItems: CartItem[] = [
        {
          id: 'c1',
          menuItemId: '1',
          name: 'Iced latte',
          price: 180,
          quantity: 1,
          image: '/figma-assets/iced-latte.jpg',
          size: 'Large',
          milk: 'Oat milk',
        },
      ];

      const order = await orderService.createOrder(cartItems, {
        customerName: 'Alex',
        orderType: 'takeout',
      });

      expect(order.status).toBe('pending');
      expect(order.requestReference).toMatch(/^R-[0-9A-F]{3}$/);
      expect(order.queueNumber).toBeNull();
      expect(order.privateToken).toBeDefined();
      expect(order.privateToken.length).toBeGreaterThan(10);
      expect(order.paymentMethod).toBe('cash_at_pickup');
      expect(order.paymentStatus).toBe('unpaid');
    });

    it('allocates queue number (e.g. A042) only upon staff acceptance', async () => {
      const cartItems: CartItem[] = [
        {
          id: 'c1',
          menuItemId: '1',
          name: 'Iced latte',
          price: 180,
          quantity: 1,
          image: '/figma-assets/iced-latte.jpg',
        },
      ];

      const order = await orderService.createOrder(cartItems, { customerName: 'Alex' });
      expect(order.queueNumber).toBeNull();

      const accepted = await orderService.acceptOrder(order.id, 'staff_mia');
      expect(accepted.status).toBe('confirmed');
      expect(accepted.queueNumber).toMatch(/^A\d{3}$/);
      expect(accepted.code).toBe(accepted.queueNumber);
    });
  });

  describe('3. Security Gate: Cash Verification Before Completion', () => {
    it('blocks order completion if cash has not been verified', async () => {
      const cartItems: CartItem[] = [
        {
          id: 'c1',
          menuItemId: '1',
          name: 'Iced latte',
          price: 180,
          quantity: 1,
          image: '/figma-assets/iced-latte.jpg',
        },
      ];

      const order = await orderService.createOrder(cartItems, { customerName: 'Alex' });
      await orderService.acceptOrder(order.id);
      await orderService.updateOrderStatus(order.id, 'preparing');
      await orderService.updateOrderStatus(order.id, 'ready');

      // Attempting to complete without cash payment verification must fail!
      await expect(orderService.updateOrderStatus(order.id, 'completed')).rejects.toThrow(
        /Cash payment must be verified before completing order/i
      );
    });

    it('allows completion once cash payment is verified by staff', async () => {
      const cartItems: CartItem[] = [
        {
          id: 'c1',
          menuItemId: '1',
          name: 'Iced latte',
          price: 180,
          quantity: 1,
          image: '/figma-assets/iced-latte.jpg',
        },
      ];

      const order = await orderService.createOrder(cartItems, { customerName: 'Alex' });
      await orderService.acceptOrder(order.id);
      await orderService.updateOrderStatus(order.id, 'preparing');
      await orderService.updateOrderStatus(order.id, 'ready');

      // Staff verifies cash
      const verified = await orderService.verifyCashPayment(order.id, 'staff_mia');
      expect(verified.paymentStatus).toBe('verified');

      // Now complete succeeds
      const completed = await orderService.updateOrderStatus(order.id, 'completed');
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();
    });
  });

  describe('4. Privacy: Zero-PII Public Stall Queue Display', () => {
    it('ensures public queue feed contains strictly queueNumber, status, and timestamp — NO PII', async () => {
      const cartItems: CartItem[] = [
        {
          id: 'c1',
          menuItemId: '1',
          name: 'Iced latte',
          price: 180,
          quantity: 1,
          image: '/figma-assets/iced-latte.jpg',
        },
      ];

      const order = await orderService.createOrder(cartItems, {
        customerName: 'Secret VIP Customer',
        phone: '+63 917 123 4567',
        notes: 'Extra secret note',
      });

      await orderService.acceptOrder(order.id);
      await orderService.updateOrderStatus(order.id, 'preparing');

      const publicQueue = await orderService.getPublicQueue();
      expect(publicQueue.length).toBeGreaterThan(0);

      // Verify no item in public queue exposes personal data
      for (const item of publicQueue) {
        expect(item.queueNumber).toBeDefined();
        expect(item.status).toMatch(/preparing|ready/);
        expect(item.updatedAt).toBeDefined();

        // Strict assertions on absence of PII
        expect((item as any).customerName).toBeUndefined();
        expect((item as any).customer_name).toBeUndefined();
        expect((item as any).phone).toBeUndefined();
        expect((item as any).notes).toBeUndefined();
        expect((item as any).items).toBeUndefined();
        expect((item as any).privateToken).toBeUndefined();
      }
    });
  });
});
