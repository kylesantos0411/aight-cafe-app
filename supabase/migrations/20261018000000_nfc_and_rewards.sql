-- =====================================================================
-- AIGHT CAFE — NFC CONVENIENCE FEATURES & REWARDS SYSTEM SCHEMA
-- Migration: 20261018000000_nfc_and_rewards.sql
-- =====================================================================

-- 1. LOYALTY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.loyalty_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stamps_required INT NOT NULL DEFAULT 8 CHECK (stamps_required > 0),
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 100.00 CHECK (min_order_amount >= 0),
  reward_title TEXT NOT NULL DEFAULT 'Free Coffee of your choice',
  reward_description TEXT NOT NULL DEFAULT 'Enjoy any handcrafted beverage up to ₱180',
  reward_discount_amount NUMERIC(10,2) NOT NULL DEFAULT 180.00 CHECK (reward_discount_amount > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default settings if empty
INSERT INTO public.loyalty_settings (stamps_required, min_order_amount, reward_title, reward_description, reward_discount_amount, is_active)
SELECT 8, 100.00, 'Free Coffee of your choice', 'Enjoy any handcrafted beverage up to ₱180 on us', 180.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.loyalty_settings);

-- 2. CUSTOMER LOYALTY BALANCE
CREATE TABLE IF NOT EXISTS public.customer_loyalty (
  customer_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stamps_balance INT NOT NULL DEFAULT 0 CHECK (stamps_balance >= 0),
  total_stamps_earned INT NOT NULL DEFAULT 0 CHECK (total_stamps_earned >= 0),
  total_rewards_claimed INT NOT NULL DEFAULT 0 CHECK (total_rewards_claimed >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AUDITABLE LOYALTY TRANSACTIONS
-- UNIQUE(order_id) strictly prevents duplicate stamps for the same order
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'reward_issued', 'adjustment')),
  stamps_delta INT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. REWARD VOUCHERS
CREATE TABLE IF NOT EXISTS public.reward_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 180.00 CHECK (discount_amount > 0),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'redeemed', 'expired')),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMPTZ,
  redeemed_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL
);

-- 5. NFC & QR TAPS ANALYTICS
CREATE TABLE IF NOT EXISTS public.nfc_taps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id TEXT NOT NULL CHECK (tag_id IN ('order', 'reorder', 'track', 'rewards')),
  source TEXT NOT NULL DEFAULT 'nfc' CHECK (source IN ('nfc', 'qr', 'direct')),
  path TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON public.loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_reward_vouchers_customer ON public.reward_vouchers(customer_id);
CREATE INDEX IF NOT EXISTS idx_nfc_taps_tag ON public.nfc_taps(tag_id, created_at);

-- Enable RLS
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_taps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-run
DROP POLICY IF EXISTS "Public read loyalty settings" ON public.loyalty_settings;
DROP POLICY IF EXISTS "Customer read own loyalty" ON public.customer_loyalty;
DROP POLICY IF EXISTS "Customer read own transactions" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "Customer read own vouchers" ON public.reward_vouchers;
DROP POLICY IF EXISTS "Public insert nfc taps" ON public.nfc_taps;
DROP POLICY IF EXISTS "Staff read nfc taps" ON public.nfc_taps;

-- Policies
CREATE POLICY "Public read loyalty settings" ON public.loyalty_settings FOR SELECT USING (true);

CREATE POLICY "Customer read own loyalty" ON public.customer_loyalty 
FOR SELECT USING (auth.uid() = customer_id OR public.fn_is_staff(auth.uid()));

CREATE POLICY "Customer read own transactions" ON public.loyalty_transactions 
FOR SELECT USING (auth.uid() = customer_id OR public.fn_is_staff(auth.uid()));

CREATE POLICY "Customer read own vouchers" ON public.reward_vouchers 
FOR SELECT USING (auth.uid() = customer_id OR public.fn_is_staff(auth.uid()));

CREATE POLICY "Public insert nfc taps" ON public.nfc_taps FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read nfc taps" ON public.nfc_taps FOR SELECT USING (public.fn_is_staff(auth.uid()));

-- =====================================================================
-- DATABASE FUNCTIONS & RPCs
-- =====================================================================

-- RPC: Award Loyalty Stamps for Completed Order (Server-authoritative & Idempotent)
CREATE OR REPLACE FUNCTION public.fn_award_order_loyalty(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_settings RECORD;
  v_new_balance INT;
  v_stamps_req INT;
  v_voucher_code TEXT;
  v_voucher_id UUID;
BEGIN
  -- 1. Fetch order details
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Order not found');
  END IF;

  -- 2. Must have registered customer account
  IF v_order.customer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Guest order - no customer account linked');
  END IF;

  -- 3. Order must be completed and paid
  IF v_order.status <> 'completed' OR v_order.payment_status <> 'verified' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Order not completed or payment unverified');
  END IF;

  -- 4. Idempotency check: Already awarded?
  IF EXISTS (SELECT 1 FROM public.loyalty_transactions WHERE order_id = p_order_id AND type = 'earn') THEN
    RETURN jsonb_build_object('success', true, 'already_awarded', true);
  END IF;

  -- 5. Check loyalty settings
  SELECT * INTO v_settings FROM public.loyalty_settings WHERE is_active = true LIMIT 1;
  v_stamps_req := COALESCE(v_settings.stamps_required, 8);

  IF v_order.total_amount < COALESCE(v_settings.min_order_amount, 100.00) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Order amount below minimum spend for loyalty stamp');
  END IF;

  -- 6. Insert Earn Transaction
  INSERT INTO public.loyalty_transactions (
    customer_id, order_id, type, stamps_delta, description
  ) VALUES (
    v_order.customer_id,
    p_order_id,
    'earn',
    1,
    'Earned 1 stamp from order #' || COALESCE(v_order.pickup_number, v_order.request_reference)
  );

  -- 7. Upsert Customer Loyalty Balance
  INSERT INTO public.customer_loyalty (
    customer_id, stamps_balance, total_stamps_earned, total_rewards_claimed
  ) VALUES (
    v_order.customer_id, 1, 1, 0
  )
  ON CONFLICT (customer_id) DO UPDATE SET
    stamps_balance = public.customer_loyalty.stamps_balance + 1,
    total_stamps_earned = public.customer_loyalty.total_stamps_earned + 1,
    updated_at = now()
  RETURNING stamps_balance INTO v_new_balance;

  -- 8. Did they reach reward threshold?
  IF v_new_balance >= v_stamps_req THEN
    -- Generate unique voucher code
    v_voucher_code := 'AIGHT-FREE-' || UPPER(SUBSTRING(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 6));
    
    INSERT INTO public.reward_vouchers (
      customer_id, voucher_code, title, description, discount_amount, status
    ) VALUES (
      v_order.customer_id,
      v_voucher_code,
      COALESCE(v_settings.reward_title, 'Free Coffee of your choice'),
      COALESCE(v_settings.reward_description, 'Enjoy any handcrafted beverage up to ₱180'),
      COALESCE(v_settings.reward_discount_amount, 180.00),
      'available'
    ) RETURNING id INTO v_voucher_id;

    -- Deduct required stamps and increment claimed rewards
    UPDATE public.customer_loyalty SET
      stamps_balance = stamps_balance - v_stamps_req,
      total_rewards_claimed = total_rewards_claimed + 1,
      updated_at = now()
    WHERE customer_id = v_order.customer_id;

    -- Record reward issued transaction
    INSERT INTO public.loyalty_transactions (
      customer_id, order_id, type, stamps_delta, description
    ) VALUES (
      v_order.customer_id,
      p_order_id,
      'reward_issued',
      -v_stamps_req,
      'Unlocked: ' || COALESCE(v_settings.reward_title, 'Free Coffee') || ' (' || v_voucher_code || ')'
    );

    RETURN jsonb_build_object(
      'success', true,
      'stamps_awarded', 1,
      'reward_unlocked', true,
      'voucher_code', v_voucher_code
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'stamps_awarded', 1,
    'stamps_balance', v_new_balance,
    'stamps_required', v_stamps_req
  );
END;
$$;

-- RPC: Fetch Customer Loyalty Summary
CREATE OR REPLACE FUNCTION public.fn_get_customer_loyalty_summary(p_customer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_loyalty RECORD;
  v_settings RECORD;
  v_vouchers JSONB;
  v_transactions JSONB;
BEGIN
  -- Verify caller is the customer or staff
  IF auth.uid() <> p_customer_id AND NOT public.fn_is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized to view customer loyalty data';
  END IF;

  SELECT * INTO v_settings FROM public.loyalty_settings WHERE is_active = true LIMIT 1;
  SELECT * INTO v_loyalty FROM public.customer_loyalty WHERE customer_id = p_customer_id;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'voucher_code', voucher_code,
      'title', title,
      'description', description,
      'discount_amount', discount_amount,
      'status', status,
      'earned_at', earned_at,
      'redeemed_at', redeemed_at
    ) ORDER BY earned_at DESC
  ) INTO v_vouchers
  FROM public.reward_vouchers
  WHERE customer_id = p_customer_id;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'type', type,
      'stamps_delta', stamps_delta,
      'description', description,
      'created_at', created_at
    ) ORDER BY created_at DESC
  ) INTO v_transactions
  FROM public.loyalty_transactions
  WHERE customer_id = p_customer_id;

  RETURN jsonb_build_object(
    'stamps_balance', COALESCE(v_loyalty.stamps_balance, 0),
    'total_stamps_earned', COALESCE(v_loyalty.total_stamps_earned, 0),
    'total_rewards_claimed', COALESCE(v_loyalty.total_rewards_claimed, 0),
    'stamps_required', COALESCE(v_settings.stamps_required, 8),
    'reward_title', COALESCE(v_settings.reward_title, 'Free Coffee of your choice'),
    'reward_description', COALESCE(v_settings.reward_description, 'Enjoy any handcrafted beverage up to ₱180'),
    'min_order_amount', COALESCE(v_settings.min_order_amount, 100.00),
    'vouchers', COALESCE(v_vouchers, '[]'::jsonb),
    'transactions', COALESCE(v_transactions, '[]'::jsonb)
  );
END;
$$;
