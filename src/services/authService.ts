import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StaffUser, CustomerUser } from '../types/cafe';

const STAFF_LOCAL_KEY = 'aight_cafe_staff_auth';
const CUSTOMER_LOCAL_KEY = 'aight_cafe_customer_auth';

class AuthService {
  /**
   * Get currently authenticated staff member session.
   * In Supabase, checks auth.users and verifies existence in public.staff_roles.
   */
  public async getStaffSession(): Promise<StaffUser | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          localStorage.removeItem(STAFF_LOCAL_KEY);
          return null;
        }

        const { data: roleData, error: roleError } = await supabase
          .from('staff_roles')
          .select('role, display_name, active')
          .eq('user_id', user.id)
          .single();

        if (roleError || !roleData || !roleData.active) {
          localStorage.removeItem(STAFF_LOCAL_KEY);
          return null;
        }

        const staffUser: StaffUser = {
          id: user.id,
          email: user.email || '',
          fullName: roleData.display_name || user.user_metadata?.full_name || 'Staff Member',
          role: roleData.role,
        };
        localStorage.setItem(STAFF_LOCAL_KEY, JSON.stringify(staffUser));
        return staffUser;
      } catch (err) {
        console.warn('Error fetching Supabase staff session:', err);
        return null;
      }
    }

    try {
      const saved = localStorage.getItem(STAFF_LOCAL_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Real Supabase Sign-in for Staff using work email and password.
   */
  public async signInStaff(email: string, password: string): Promise<StaffUser> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user returned from Supabase Auth.');
      }

      // Verify staff role
      const { data: roleData, error: roleError } = await supabase
        .from('staff_roles')
        .select('role, display_name, active')
        .eq('user_id', data.user.id)
        .single();

      if (roleError || !roleData || !roleData.active) {
        await supabase.auth.signOut();
        throw new Error('Access denied: You do not have active staff privileges for Aight Cafe.');
      }

      const staffUser: StaffUser = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: roleData.display_name || 'Staff Operator',
        role: roleData.role,
      };

      localStorage.setItem(STAFF_LOCAL_KEY, JSON.stringify(staffUser));
      return staffUser;
    }

    // Local development fallback only when Supabase is not connected
    if (email.trim().length > 0 && password.length >= 4) {
      const staffUser: StaffUser = {
        id: 'staff_mia_courtyard',
        email,
        fullName: email.split('@')[0].toUpperCase(),
        role: 'barista',
      };
      localStorage.setItem(STAFF_LOCAL_KEY, JSON.stringify(staffUser));
      return staffUser;
    }

    throw new Error('Invalid email or password.');
  }

  public async signOutStaff(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(STAFF_LOCAL_KEY);
  }

  /**
   * Customer Authentication
   */
  public async getCustomerSession(): Promise<CustomerUser | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return {
            id: user.id,
            email: user.email || '',
            fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
          };
        }
      } catch {
        // fallback
      }
    }

    try {
      const saved = localStorage.getItem(CUSTOMER_LOCAL_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  }

  public async signInCustomer(email: string, password?: string): Promise<CustomerUser> {
    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Authentication failed.');

      const customer: CustomerUser = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: data.user.user_metadata?.full_name || email.split('@')[0],
      };
      localStorage.setItem(CUSTOMER_LOCAL_KEY, JSON.stringify(customer));
      return customer;
    }

    const customer: CustomerUser = {
      id: 'cust_' + Math.random().toString(36).substring(2, 8),
      email,
      fullName: email.split('@')[0],
    };
    localStorage.setItem(CUSTOMER_LOCAL_KEY, JSON.stringify(customer));
    return customer;
  }

  public async signUpCustomer(email: string, password: string, fullName: string): Promise<CustomerUser> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Sign up failed.');

      const customer: CustomerUser = {
        id: data.user.id,
        email,
        fullName,
      };
      localStorage.setItem(CUSTOMER_LOCAL_KEY, JSON.stringify(customer));
      return customer;
    }

    return this.signInCustomer(email, password);
  }

  public async resetPassword(email: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/account/reset-password',
      });
      if (error) throw new Error(error.message);
    }
  }

  public async signOutCustomer(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(CUSTOMER_LOCAL_KEY);
  }
}

export const authService = new AuthService();
