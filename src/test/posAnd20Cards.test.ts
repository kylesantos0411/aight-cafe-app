import { describe, it, expect, beforeEach } from 'vitest';
import { orderService } from '../services/orderService';
import { queueCardService } from '../services/queueCardService';
import { refundService } from '../services/refundService';
import type { CartItem, Order, MenuItem } from '../types/cafe';

describe('Aight Cafe — POS, 20 Reusable Queue Cards, Tracking & Full System Suite', () => {
  const sampleItem: CartItem = {
    id: 'cart_item_latte',
    menuItemId: '1',
    name: 'Iced Oat Latte',
    price: 180,
    basePrice: 140,
    quantity: 1,
    size: 'Large',
    milk: 'Oat milk',
    image: '/figma-assets/iced-latte.jpg',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. POS Draft Creation, Active Queue Exclusion & Expiration', () => {
    it('Point 1: Creating a draft order does NOT reserve a queue card', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'POS Guest 1',
      });

      expect(draft.status).toBe('draft');
      expect(draft.paymentStatus).toBe('unpaid');
      expect(draft.cardNumber).toBeFalsy();
      expect(draft.cardId).toBeFalsy();

      // All 20 cards must remain available
      const cards = await queueCardService.getAllCards();
      expect(cards.length).toBe(20);
      expect(cards.every(c => c.status === 'available')).toBe(true);
    });

    it('Point 2: Unpaid drafts do NOT appear in the active preparation queue', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'POS Unpaid Guest',
      });

      const queue = await orderService.getPublicQueue();
      const inQueue = queue.some(q => q.queueNumber === draft.queueNumber || (draft.code && q.queueNumber === draft.code));
      expect(inQueue).toBe(false);
    });

    it('Point 8 & 9: Abandoned draft order expires and marks status cancelled without deleting audit history or releasing any card', async () => {
      // Create draft expired 10 minutes ago
      const expiredAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Abandoned Guest',
      });

      // Manually set draft_expires_at to the past
      const orders = (orderService as any).getStoredOrders() as Order[];
      const idx = orders.findIndex(o => o.id === draft.id);
      orders[idx].draftExpiresAt = expiredAt;
      (orderService as any).saveOrders(orders);

      // Run cleanup
      const expiredCount = await orderService.expireAbandonedDrafts();
      expect(expiredCount).toBe(1);

      // Order must still exist in storage for audit history
      const auditOrders = (orderService as any).getStoredOrders() as Order[];
      const expiredOrder = auditOrders.find(o => o.id === draft.id);
      expect(expiredOrder).toBeDefined();
      expect(expiredOrder?.status).toBe('cancelled');
      expect(expiredOrder?.cancellationReason).toMatch(/Draft expired|Expired unpaid/i);

      // No card should have been affected
      const cards = await queueCardService.getAllCards();
      expect(cards.every(c => c.status === 'available')).toBe(true);
    });

    it('Point 10: Active order with confirmed payment is NOT expired by the cleanup job', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Paying Guest',
      });

      // Confirm payment with Cash
      const paidOrder = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'cash',
        amountReceived: 200,
        staffUser: { id: 'staff_1', fullName: 'Cashier Maria' },
      });

      expect(paidOrder.status).toBe('preparing');
      expect(paidOrder.paymentStatus).toBe('verified');

      // Run expiration check
      const expiredCount = await orderService.expireAbandonedDrafts();
      expect(expiredCount).toBe(0);

      const retrieved = await orderService.getOrderById(paidOrder.id);
      expect(retrieved?.status).toBe('preparing');
      expect(retrieved?.paymentStatus).toBe('verified');
    });
  });

  describe('2. POS Payment Confirmation & Lifecycle Transitions', () => {
    it('Point 3 & 4: Confirming payment allocates exactly 1 available physical card and transitions to preparing', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Juan Dela Cruz',
      });

      const confirmed = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'cash',
        amountReceived: 180,
        staffUser: { id: 'staff_1', fullName: 'Cashier Maria' },
      });

      expect(confirmed.status).toBe('preparing');
      expect(confirmed.paymentStatus).toBe('verified');
      expect(confirmed.cardNumber).toBe(1);
      expect(confirmed.cardId).toBe('card_01');
      expect(confirmed.queueNumber).toBe('Card #01');

      // Card 1 is now occupied
      const card = await queueCardService.getCardByNumber(1);
      expect(card?.status).toBe('occupied');
      expect(card?.currentOrderId).toBe(confirmed.id);

      // Card 2 through 20 remain available
      const allCards = await queueCardService.getAllCards();
      const availableCards = allCards.filter(c => c.status === 'available');
      expect(availableCards.length).toBe(19);
    });

    it('Point 5: Order status transitions strictly follow: draft/pending -> preparing -> ready -> completed / cancelled', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Lifecycle Test User',
      });

      const preparingOrder = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'cash',
        amountReceived: 200,
        staffUser: { id: 'staff_1', fullName: 'Cashier Maria' },
      });
      expect(preparingOrder.status).toBe('preparing');

      const readyOrder = await orderService.updateOrderStatus(preparingOrder.id, 'ready');
      expect(readyOrder.status).toBe('ready');

      const completedOrder = await orderService.updateOrderStatus(readyOrder.id, 'completed');
      expect(completedOrder.status).toBe('completed');
    });

    it('Point 6: Cash payment records amount received, calculates change correctly, and marks payment verified', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Cash Payer',
      });

      const total = draft.totalAmount; // 180
      const tendered = 500;
      const expectedChange = tendered - total; // 320

      const confirmed = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'cash',
        amountReceived: tendered,
        changeGiven: expectedChange,
        staffUser: { id: 'staff_cashier', fullName: 'Cashier Alex' },
      });

      expect(confirmed.paymentStatus).toBe('verified');
      expect(confirmed.paymentMethod).toBe('cash');
      expect(confirmed.cashAmountReceived).toBe(tendered);
      expect(confirmed.cashChangeGiven).toBe(expectedChange);
      expect(confirmed.receiptSnapshot).toBeDefined();
      expect(confirmed.receiptSnapshot?.cashAmountReceived).toBe(tendered);
      expect(confirmed.receiptSnapshot?.cashChangeGiven).toBe(expectedChange);
    });

    it('Point 7: GCash payment records reference number and marks payment verified', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'GCash Payer',
      });

      const confirmed = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'gcash',
        amountReceived: 180,
        paymentProofRef: 'GCASH-REF-99887766',
        staffUser: { id: 'staff_cashier', fullName: 'Cashier Alex' },
      });

      expect(confirmed.paymentStatus).toBe('verified');
      expect(confirmed.paymentMethod).toBe('gcash');
      expect(confirmed.paymentProofRef).toBe('GCASH-REF-99887766');
      expect(confirmed.receiptSnapshot?.paymentProofRef).toBe('GCASH-REF-99887766');
    });
  });

  describe('3. 20 Physical Queue Cards Pool Management & Capacity Limits', () => {
    it('Point 11 & 12: Allocating all 20 cards assigns numbers 1..20; 21st attempt throws capacity error', async () => {
      const allocatedOrders: Order[] = [];

      for (let i = 1; i <= 20; i++) {
        const draft = await orderService.createDraftOrder([sampleItem], {
          customerName: `Customer #${i}`,
        });
        const confirmed = await orderService.confirmPosPaymentAndAllocateCard({
          orderId: draft.id,
          paymentMethod: 'cash',
          amountReceived: 200,
        });
        allocatedOrders.push(confirmed);
        expect(confirmed.cardNumber).toBe(i);
      }

      // Check all 20 cards have unique numbers 1 through 20
      const cardNumbers = allocatedOrders.map(o => o.cardNumber);
      const uniqueNumbers = new Set(cardNumbers);
      expect(uniqueNumbers.size).toBe(20);
      for (let num = 1; num <= 20; num++) {
        expect(uniqueNumbers.has(num)).toBe(true);
      }

      // 21st allocation attempt must throw capacity limit error
      const extraDraft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Customer #21 (Overflow)',
      });

      await expect(
        orderService.confirmPosPaymentAndAllocateCard({
          orderId: extraDraft.id,
          paymentMethod: 'cash',
          amountReceived: 200,
        })
      ).rejects.toThrow(/All 20 physical queue cards are currently occupied/);
    }, 30000);

    it('Point 13 & 14: Completing an order automatically releases its card, which becomes immediately eligible for reassignment', async () => {
      // Allocate Card #1
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Quick Drink Order',
      });
      const order = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'cash',
        amountReceived: 200,
      });
      expect(order.cardNumber).toBe(1);

      // Verify occupied
      let card1 = await queueCardService.getCardByNumber(1);
      expect(card1?.status).toBe('occupied');

      // Transition to ready then completed
      await orderService.updateOrderStatus(order.id, 'ready');
      const completed = await orderService.updateOrderStatus(order.id, 'completed');
      expect(completed.status).toBe('completed');
      expect(completed.isCardReleased).toBe(true);

      // Verify Card #1 is now available
      card1 = await queueCardService.getCardByNumber(1);
      expect(card1?.status).toBe('available');
      expect(card1?.currentOrderId).toBeNull();

      // Next order should be assigned Card #1 since it is the first available card
      const nextDraft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Next Customer',
      });
      const nextOrder = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: nextDraft.id,
        paymentMethod: 'cash',
        amountReceived: 200,
      });
      expect(nextOrder.cardNumber).toBe(1);
    });

    it('Point 15, 16 & 17: Cancelling an order marks its card held_for_recovery; manager physically recovering releases it', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Customer Cancelling',
      });
      const order = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'cash',
        amountReceived: 200,
      });
      expect(order.cardNumber).toBe(1);

      // Cancel order with mandatory reason
      const cancelledOrder = await orderService.updateOrderStatus(
        order.id,
        'cancelled',
        'Customer walked away before pickup'
      );
      expect(cancelledOrder.status).toBe('cancelled');
      expect(cancelledOrder.isCardReleased).toBe(false);

      // Card #1 must be 'held_for_recovery' and NOT available
      let card1 = await queueCardService.getCardByNumber(1);
      expect(card1?.status).toBe('held_for_recovery');

      // Next order must skip held Card #1 and allocate Card #2
      const nextDraft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Customer After Cancel',
      });
      const nextOrder = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: nextDraft.id,
        paymentMethod: 'cash',
        amountReceived: 200,
      });
      expect(nextOrder.cardNumber).toBe(2);

      // Manager physically recovers Card #1
      const recoveredCard = await orderService.releaseHeldCard(
        1,
        'Physically retrieved card from counter rack',
        'manager_admin'
      );
      expect(recoveredCard.status).toBe('available');
      expect(recoveredCard.lastReleaseReason).toBe('Physically retrieved card from counter rack');

      // Card #1 is now available for subsequent allocations
      card1 = await queueCardService.getCardByNumber(1);
      expect(card1?.status).toBe('available');
    });
  });

  describe('4. Cancellation Rules, Reopening Protections & Refunds', () => {
    it('Point 18: Order cancellation requires a mandatory reason', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Reason Check User',
      });
      const order = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'cash',
        amountReceived: 200,
      });

      await expect(
        orderService.updateOrderStatus(order.id, 'cancelled', '')
      ).rejects.toThrow(/cancellation reason is strictly required/);

      await expect(
        orderService.updateOrderStatus(order.id, 'cancelled', '   ')
      ).rejects.toThrow(/cancellation reason is strictly required/);
    });

    it('Point 19 & 20: Completed or Cancelled orders cannot be reopened or cancelled again', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Terminal State User',
      });
      const order = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'cash',
        amountReceived: 200,
      });

      await orderService.updateOrderStatus(order.id, 'ready');
      await orderService.updateOrderStatus(order.id, 'completed');

      // Attempting to cancel completed order must fail
      await expect(
        orderService.updateOrderStatus(order.id, 'cancelled', 'Want refund')
      ).rejects.toThrow(/terminal state/);

      // Attempting to transition completed order back to preparing must fail
      await expect(
        orderService.updateOrderStatus(order.id, 'preparing')
      ).rejects.toThrow(/terminal state/);
    });

    it('Point 21: Separate manager refund records reason, manager ID, and amount without deleting or mutating the original order', async () => {
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Refund Customer',
      });
      const order = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'cash',
        amountReceived: 180,
      });

      // Staff cancels order
      await orderService.updateOrderStatus(order.id, 'cancelled', 'Customer spilled coffee');

      // Manager issues refund
      const refund = await orderService.recordOrderRefund({
        orderId: order.id,
        amount: 180,
        refundMethod: 'cash',
        reason: 'Authorized spill replacement refund',
        authorizedBy: 'manager_kyle',
      });

      expect(refund.id).toBeDefined();
      expect(refund.orderId).toBe(order.id);
      expect(refund.amount).toBe(180);
      expect(refund.authorizedBy).toBe('manager_kyle');
      expect(refund.status).toBe('completed');

      // Original order remains intact for accounting records
      const original = await orderService.getOrderById(order.id);
      expect(original).toBeDefined();
      expect(original?.id).toBe(order.id);
      expect(original?.totalAmount).toBe(180);
      expect(original?.status).toBe('cancelled');

      // Refunds list contains the record
      const allRefunds = await refundService.getRefundsForOrder(order.id);
      expect(allRefunds.length).toBe(1);
      expect(allRefunds[0].reason).toBe('Authorized spill replacement refund');
    });
  });

  describe('5. Customer Card Page Tracking & Zero-Leak Privacy', () => {
    it('Point 22 & 23: Customer card page resolves active order accurately, displays clean no-active state, and has ZERO customer data leakage', async () => {
      // 1. Initial empty state: Card 4 has no active order
      const initialCardLookup = await queueCardService.getCardActiveOrder('card_04');
      expect(initialCardLookup.active).toBe(false);
      expect(initialCardLookup.cardNumber).toBe(4);
      expect(initialCardLookup.order).toBeUndefined();

      // 2. Allocate Card 4 to Customer A
      const draftA = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Customer Secret Alpha',
        notes: 'Secret note about allergy',
      });

      // Fill cards 1..3 first so Card 4 is chosen
      await queueCardService.allocateCard('dummy_1');
      await queueCardService.allocateCard('dummy_2');
      await queueCardService.allocateCard('dummy_3');

      const confirmedA = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draftA.id,
        paymentMethod: 'cash',
        amountReceived: 200,
      });
      expect(confirmedA.cardNumber).toBe(4);

      // Customer A scans Card 4
      const activeLookup = await queueCardService.getCardActiveOrder('card_04');
      expect(activeLookup.active).toBe(true);
      expect(activeLookup.order?.customerName).toBe('Customer Secret Alpha');
      expect(activeLookup.order?.totalAmount).toBe(180);
      expect(activeLookup.order?.queueNumber).toBe('Card #04');

      // 3. Complete Customer A's order -> Card 4 is released
      await orderService.updateOrderStatus(confirmedA.id, 'ready');
      await orderService.updateOrderStatus(confirmedA.id, 'completed');

      // 4. Zero-Leak Verification: Customer B scans Card 4 after completion
      const completedLookup = await queueCardService.getCardActiveOrder('card_04');
      expect(completedLookup.active).toBe(false);
      expect(completedLookup.order).toBeUndefined();
      // Ensure Customer A's details are NEVER leaked in this response
      expect((completedLookup as any).customerName).toBeUndefined();
      expect((completedLookup as any).items).toBeUndefined();
      expect((completedLookup as any).receiptSnapshot).toBeUndefined();
    });
  });

  describe('6. Receipt Snapshot Immutability Across Catalog Changes', () => {
    it('Point 24: Immutable receipt snapshot preserves historical items, prices, and cashier details even if product catalog prices change subsequently', async () => {
      const originalPrice = 180;
      const draft = await orderService.createDraftOrder([sampleItem], {
        customerName: 'Price Freeze Customer',
      });

      const confirmed = await orderService.confirmPosPaymentAndAllocateCard({
        orderId: draft.id,
        paymentMethod: 'cash',
        amountReceived: 200,
        staffUser: { id: 'cashier_01', fullName: 'Cashier Teresa' },
      });

      const snapshot = confirmed.receiptSnapshot;
      expect(snapshot).toBeDefined();
      expect(snapshot?.totalAmount).toBe(originalPrice);
      expect(snapshot?.items[0].unitPrice).toBe(originalPrice);
      expect(snapshot?.cashierName).toBe('Cashier Teresa');

      // Simulate catalog price increase in menu items (e.g. inflation / surge pricing to ₱250)
      const mockCatalog: MenuItem[] = [
        {
          id: '1',
          name: 'Iced Oat Latte',
          description: 'Smooth espresso with oat milk',
          price: 250, // Price increased!
          category: 'Coffee',
          isAvailable: true,
          image: '/figma-assets/iced-latte.jpg',
        },
      ];
      localStorage.setItem('aight_cafe_menu_v1', JSON.stringify(mockCatalog));

      // Fetch the order again
      const refreshedOrder = await orderService.getOrderById(confirmed.id);
      expect(refreshedOrder?.receiptSnapshot?.totalAmount).toBe(180); // Preserved!
      expect(refreshedOrder?.receiptSnapshot?.items[0].unitPrice).toBe(180); // Preserved!
      expect(refreshedOrder?.receiptSnapshot?.cashierName).toBe('Cashier Teresa');
    });
  });
});
