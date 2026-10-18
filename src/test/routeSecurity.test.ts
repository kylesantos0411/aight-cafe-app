import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/authService';
import { menuService } from '../services/menuService';

describe('Aight Cafe - Separate Routes & Security Role-Based Access', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Role Authorization Gates', () => {
    it('returns null for staff session when no staff is logged in', async () => {
      const session = await authService.getStaffSession();
      expect(session).toBeNull();
    });

    it('rejects invalid or blank credentials for staff sign-in', async () => {
      await expect(authService.signInStaff('', '')).rejects.toThrow();
    });

    it('verifies that a customer session does NOT grant staff privileges', async () => {
      const customer = await authService.signInCustomer('customer@gmail.com');
      expect(customer).toBeDefined();
      expect(customer.email).toBe('customer@gmail.com');

      // Attempting to retrieve staff session must still return null!
      const staffSession = await authService.getStaffSession();
      expect(staffSession).toBeNull();
    });
  });

  describe('2. Staff Product Availability Management', () => {
    it('allows staff to query full product list and toggle product availability', async () => {
      const products = await menuService.getAllProducts();
      expect(products.length).toBeGreaterThan(0);

      const target = products[0];
      const initialAvailability = target.isAvailable !== false;

      // Toggle availability
      const toggled = await menuService.toggleProductAvailability(target.id, !initialAvailability);
      expect(toggled).toBe(true);

      // Revert back
      const reverted = await menuService.toggleProductAvailability(target.id, initialAvailability);
      expect(reverted).toBe(true);
    });
  });
});
