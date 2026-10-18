import { describe, it, expect, beforeEach } from 'vitest';
import { orderService } from '../services/orderService';
import { dailyCloseService } from '../services/dailyCloseService';
import type { CartItem, Order } from '../types/cafe';

describe('Aight Cafe — Voiding & End-of-Day Daily Close', () => {
  const sampleCartItem: CartItem = {
    id: 'test_item_1',
    menuItemId: '1',
    name: 'Iced oat latte',
    price: 180,
    basePrice: 140,
    quantity: 2,
    size: 'Large',
    milk: 'Oat milk',
    image: '/figma-assets/iced-latte.jpg',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Voiding Workflow', () => {
    it('successfully voids an active order with reason and sets payment to voided', async () => {
      // Create pending order
      const order = await orderService.createOrder([sampleCartItem], {
        customerName: 'Customer To Void',
      });

      expect(order.status).toBe('pending');
      expect(order.paymentStatus).toBe('unpaid');

      // Staff voids the order
      const voidedOrder = await orderService.updateOrderStatus(
        order.id,
        'cancelled',
        'Customer requested cancellation'
      );

      expect(voidedOrder.status).toBe('cancelled');
      expect(voidedOrder.paymentStatus).toBe('voided');
      expect(voidedOrder.cancellationReason).toBe('Customer requested cancellation');

      // Verify it is not present in public queue
      const queue = await orderService.getPublicQueue();
      const inQueue = queue.some(q => q.queueNumber === voidedOrder.queueNumber);
      expect(inQueue).toBe(false);
    });
  });

  describe('2. Daily Close & Next Day Reset Workflow', () => {
    it('accurately computes daily totals and items sold summary', () => {
      const mockOrders: Order[] = [
        {
          id: 'ord_1',
          code: 'A001',
          queueNumber: 'A001',
          requestReference: 'R-001',
          privateToken: 'token-1',
          customerName: 'Customer One',
          orderType: 'takeout',
          items: [
            {
              id: 'it_1',
              menuItemId: '1',
              name: 'Iced oat latte',
              price: 180,
              basePrice: 140,
              quantity: 2,
              image: '/figma-assets/iced-latte.jpg',
            },
          ],
          subtotal: 360,
          totalAmount: 360,
          paymentMethod: 'cash_at_pickup',
          paymentStatus: 'verified',
          status: 'completed',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'ord_2',
          code: 'A002',
          queueNumber: 'A002',
          requestReference: 'R-002',
          privateToken: 'token-2',
          customerName: 'Customer Two',
          orderType: 'takeout',
          items: [
            {
              id: 'it_2',
              menuItemId: '5',
              name: 'Brown butter cookie',
              price: 85,
              basePrice: 85,
              quantity: 1,
              image: '/figma-assets/brown-butter-cookie.jpg',
            },
          ],
          subtotal: 85,
          totalAmount: 85,
          paymentMethod: 'cash_at_pickup',
          paymentStatus: 'voided',
          status: 'cancelled',
          cancellationReason: 'Out of stock',
          createdAt: new Date().toISOString(),
        },
      ];

      const summary = dailyCloseService.computeCurrentDaySummary(
        mockOrders,
        'Silangan, San Mateo, Rizal',
        'Kyle Santos'
      );

      expect(summary.totalRevenue).toBe(360);
      expect(summary.totalOrders).toBe(2);
      expect(summary.completedOrders).toBe(1);
      expect(summary.cancelledOrders).toBe(1);
      expect(summary.pendingOrActiveOrders).toBe(0);
      expect(summary.stallLocation).toBe('Silangan, San Mateo, Rizal');
      expect(summary.closedByName).toBe('Kyle Santos');

      // Items breakdown
      expect(summary.itemsSold).toHaveLength(1);
      expect(summary.itemsSold[0].name).toBe('Iced oat latte');
      expect(summary.itemsSold[0].quantity).toBe(2);
      expect(summary.itemsSold[0].revenue).toBe(360);
    });

    it('executes daily close, archives history, and resets queue for next day', async () => {
      const mockOrders: Order[] = [
        {
          id: 'ord_comp',
          code: 'A010',
          requestReference: 'R-010',
          privateToken: 'tok-10',
          customerName: 'Anna',
          orderType: 'takeout',
          items: [sampleCartItem],
          subtotal: 360,
          totalAmount: 360,
          paymentMethod: 'cash_at_pickup',
          paymentStatus: 'verified',
          status: 'completed',
          createdAt: new Date().toISOString(),
        },
      ];

      // Execute close
      const record = await dailyCloseService.executeDailyClose(
        mockOrders,
        'Silangan, San Mateo, Rizal',
        'Kyle Santos'
      );

      expect(record.totalRevenue).toBe(360);
      expect(record.completedOrders).toBe(1);

      // Verify saved in history
      const savedClosures = dailyCloseService.getDailyClosures();
      expect(savedClosures.length).toBeGreaterThanOrEqual(1);
      expect(savedClosures[0].closureDate).toBe(record.closureDate);

      // Verify queue reset back to 0
      const savedSeq = localStorage.getItem('aight_cafe_queue_seq');
      expect(savedSeq).toBe('0');
    });
  });
});
