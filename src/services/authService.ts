import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StaffUser, CustomerUser } from '../types/cafe';

const STAFF_STORAGE_KEY = 'aight_cafe_staff_auth';
const CUSTOMER_STORAGE_KEY = 'aight_cafe_customer_auth';

class AuthService {
  public async getStaffSession(): Promise<StaffUser | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roleData } = await supabase
            .from('staff_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (roleData) {
            return {
              id: user.id,
              email: user.email || '',
              fullName: user.user_metadata?.full_name || 'Staff Member',
              role: roleData.role,
            };
          }
        }
      } catch {
        // fallback
      }
    }

    try {
      const saved = localStorage.getItem(STAFF_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }

    return null;
  }

  public async signInStaff(pinOrPass: string): Promise<StaffUser> {
    // Default staff pin from Figma is 4 digits or any test pass
    if (pinOrPass === '1234' || pinOrPass.length >= 4) {
      const staffUser: StaffUser = {
        id: 'staff_operator_1',
        email: 'mia@aightcafe.ph',
        fullName: 'Mia',
        role: 'barista',
      };
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffUser));
      return staffUser;
    }
    throw new Error('Invalid staff access credentials.');
  }

  public async signOutStaff(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(STAFF_STORAGE_KEY);
  }

  public async getCustomerSession(): Promise<CustomerUser | null> {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  }

  public async signInCustomer(email: string): Promise<CustomerUser> {
    const user: CustomerUser = {
      id: 'cust_' + Math.random().toString(36).substring(2, 8),
      email,
      fullName: email.split('@')[0],
    };
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  public async signOutCustomer(): Promise<void> {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  }
}

export const authService = new AuthService();
