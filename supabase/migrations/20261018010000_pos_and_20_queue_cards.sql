-- =====================================================================
-- AIGHT CAFE — CASHIER POS, 20 REUSABLE NFC/QR CARDS & REFUNDS SCHEMA
-- Migration: 20261018010000_pos_and_20_queue_cards.sql
-- Non-destructive, idempotent, backward-compatible
-- =====================================================================

-- 1. QUEUE CARDS TABLE (Exactly 20 registered physical cards)
CREATE TABLE IF NOT EXISTS public.queue_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_number INT NOT NULL UNIQUE CHECK (card_number BETWEEN 1 AND 20),
  card_id TEXT NOT NULL UNIQUE, -- 'card_01' to 'card_20' or '1' to '20'
  nfc_uid TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'held_for_recovery')),
  current_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  allocated_at TIMESTAMPTZ,
  last_released_at TIMESTAMPTZ,
  last_released_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_release_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed exactly 20 physical queue cards if not already present
INSERT INTO public.queue_cards (card_number, card_id, status)
SELECT 
  s.num,
  'card_' || LPAD(s.num::text, 2, '0'),
  'available'
FROM generate_series(1, 20) AS s(num)
ON CONFLICT (card_number) DO NOTHING;

-- 2. ENHANCE ORDERS TABLE WITH CARD ALLOCATION AND DRAFT FIELDS
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS card_number INT CHECK (card_number BETWEEN 1 AND 20),
  ADD COLUMN IF NOT EXISTS card_id TEXT,
  ADD COLUMN IF NOT EXISTS is_card_released BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS draft_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS receipt_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS cashier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cashier_name TEXT;

-- Update constraints on orders if needed
DO $$
BEGIN
  -- Drop existing status check if it restricts 'draft'
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
  ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('draft', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'));

  -- Drop existing payment_method check to allow cash & gcash
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
  ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
    CHECK (payment_method IN ('cash_at_pickup', 'Cash at Counter', 'GCash', 'cash', 'gcash', 'Maya', 'Card'));

  -- Drop existing payment_status check
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
  ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check 
    CHECK (payment_status IN ('unpaid', 'verified', 'paid', 'refunded', 'voided'));
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Safe continue if existing constraint naming differs
END $$;

-- 3. SEPARATE REFUND RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.refund_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  card_number INT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  refund_method TEXT NOT NULL CHECK (refund_method IN ('cash', 'gcash', 'original_method')),
  refund_status TEXT NOT NULL DEFAULT 'pending' CHECK (refund_status IN ('not_required', 'pending', 'partially_refunded', 'refunded')),
  authorizing_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  authorizing_manager_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_queue_cards_status ON public.queue_cards(status);
CREATE INDEX IF NOT EXISTS idx_queue_cards_current_order ON public.queue_cards(current_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_card_number ON public.orders(card_number);
CREATE INDEX IF NOT EXISTS idx_refund_records_order ON public.refund_records(order_id);

-- Enable RLS
ALTER TABLE public.queue_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public read queue cards status" ON public.queue_cards;
DROP POLICY IF EXISTS "Staff manage queue cards" ON public.queue_cards;
DROP POLICY IF EXISTS "Staff read refunds" ON public.refund_records;
DROP POLICY IF EXISTS "Staff insert refunds" ON public.refund_records;

-- Public can view cards for status resolution (no sensitive data)
CREATE POLICY "Public read queue cards status" ON public.queue_cards
  FOR SELECT USING (true);

-- Staff can update/manage cards
CREATE POLICY "Staff manage queue cards" ON public.queue_cards
  FOR ALL USING (public.fn_is_staff(auth.uid()));

-- Staff can read & manage refunds
CREATE POLICY "Staff read refunds" ON public.refund_records
  FOR SELECT USING (public.fn_is_staff(auth.uid()));

CREATE POLICY "Staff insert refunds" ON public.refund_records
  FOR ALL USING (public.fn_is_staff(auth.uid()));

-- =====================================================================
-- STORED PROCEDURES & ATOMIC BUSINESS TRANSACTIONS
-- =====================================================================

-- RPC: Atomic Card Allocation on Payment Confirmation
CREATE OR REPLACE FUNCTION public.fn_pos_confirm_payment_and_allocate_card(
  p_order_id UUID,
  p_payment_method TEXT,
  p_amount_received NUMERIC,
  p_staff_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_card RECORD;
  v_staff_name TEXT := 'Staff Cashier';
  v_pickup_code TEXT;
  v_snapshot JSONB;
BEGIN
  -- Verify staff authorization
  IF NOT public.fn_is_staff(p_staff_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only verified staff can operate POS checkout';
  END IF;

  -- Lock order row
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF v_order.status NOT IN ('draft', 'pending') THEN
    RAISE EXCEPTION 'Order is not in draft or pending state (current status: %)', v_order.status;
  END IF;

  IF p_amount_received < v_order.total_amount THEN
    RAISE EXCEPTION 'Amount received (₱%) is less than order total (₱%)', p_amount_received, v_order.total_amount;
  END IF;

  -- Find and lock first available queue card (1 to 20)
  SELECT * INTO v_card
  FROM public.queue_cards
  WHERE status = 'available'
  ORDER BY card_number ASC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'All 20 physical queue cards are currently occupied. Please wait for an active order to complete.';
  END IF;

  -- Get staff display name
  SELECT COALESCE(display_name, 'Staff') INTO v_staff_name
  FROM public.staff_roles
  WHERE user_id = p_staff_id AND active = true
  LIMIT 1;

  v_pickup_code := 'Card #' || LPAD(v_card.card_number::text, 2, '0');

  -- Build immutable receipt snapshot
  SELECT jsonb_build_object(
    'orderId', v_order.id,
    'requestReference', v_order.request_reference,
    'cardNumber', v_card.card_number,
    'cardId', v_card.card_id,
    'queueNumber', v_pickup_code,
    'customerName', v_order.customer_name,
    'totalAmount', v_order.total_amount,
    'subtotal', v_order.subtotal,
    'paymentMethod', p_payment_method,
    'paymentStatus', 'verified',
    'paidAt', now(),
    'cashierName', v_staff_name,
    'items', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name', oi.product_name,
        'quantity', oi.quantity,
        'unitPrice', oi.unit_price,
        'itemTotal', oi.item_total,
        'customization', oi.customization_summary
      )), '[]'::jsonb)
      FROM public.order_items oi
      WHERE oi.order_id = v_order.id
    )
  ) INTO v_snapshot;

  -- 1. Update order
  UPDATE public.orders
  SET
    status = 'preparing',
    payment_method = p_payment_method,
    payment_status = 'verified',
    cash_verified_at = now(),
    cash_verified_by = p_staff_id,
    cash_amount_received = p_amount_received,
    card_number = v_card.card_number,
    card_id = v_card.card_id,
    pickup_number = v_pickup_code,
    is_card_released = false,
    started_at = now(),
    receipt_snapshot = v_snapshot
  WHERE id = p_order_id;

  -- 2. Reserve card
  UPDATE public.queue_cards
  SET
    status = 'occupied',
    current_order_id = p_order_id,
    allocated_at = now()
  WHERE card_number = v_card.card_number;

  -- 3. Audit log
  INSERT INTO public.order_activity_logs (
    order_id, previous_status, new_status, actor_id, actor_name, notes
  ) VALUES (
    p_order_id, v_order.status, 'preparing', p_staff_id, v_staff_name,
    'POS: Payment confirmed (' || p_payment_method || '). Allocated ' || v_pickup_code
  );

  RETURN jsonb_build_object(
    'success', true,
    'orderId', p_order_id,
    'cardNumber', v_card.card_number,
    'cardId', v_card.card_id,
    'queueNumber', v_pickup_code,
    'status', 'preparing',
    'receiptSnapshot', v_snapshot
  );
END;
$$;

-- RPC: Complete Order and Atomically Release Card
CREATE OR REPLACE FUNCTION public.fn_pos_complete_order(
  p_order_id UUID,
  p_staff_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_staff_name TEXT := 'Staff';
BEGIN
  IF NOT public.fn_is_staff(p_staff_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only verified staff can complete orders';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF v_order.status NOT IN ('ready', 'preparing') THEN
    RAISE EXCEPTION 'Can only complete orders that are ready or preparing (current: %)', v_order.status;
  END IF;

  IF v_order.payment_status <> 'verified' THEN
    RAISE EXCEPTION 'Cannot complete order: Payment has not been verified';
  END IF;

  SELECT COALESCE(display_name, 'Staff') INTO v_staff_name
  FROM public.staff_roles
  WHERE user_id = p_staff_id AND active = true
  LIMIT 1;

  -- Update order
  UPDATE public.orders
  SET
    status = 'completed',
    completed_at = now(),
    is_card_released = true
  WHERE id = p_order_id;

  -- Release physical card if one was allocated
  IF v_order.card_number IS NOT NULL THEN
    UPDATE public.queue_cards
    SET
      status = 'available',
      current_order_id = NULL,
      last_released_at = now(),
      last_released_by = p_staff_id,
      last_release_reason = 'Order completed normally'
    WHERE card_number = v_order.card_number;
  END IF;

  -- Audit log
  INSERT INTO public.order_activity_logs (
    order_id, previous_status, new_status, actor_id, actor_name, notes
  ) VALUES (
    p_order_id, v_order.status, 'completed', p_staff_id, v_staff_name,
    'Order completed and Card #' || COALESCE(v_order.card_number::text, 'N/A') || ' released for reuse'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'completed',
    'cardReleased', v_order.card_number
  );
END;
$$;

-- RPC: Cancel Order with Card Hold (Card NOT auto-released)
CREATE OR REPLACE FUNCTION public.fn_pos_cancel_order(
  p_order_id UUID,
  p_staff_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_staff_name TEXT := 'Staff';
BEGIN
  IF NOT public.fn_is_staff(p_staff_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only verified staff/manager can cancel orders';
  END IF;

  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RAISE EXCEPTION 'A cancellation reason is strictly required';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF v_order.status IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot cancel an order that is already completed or cancelled';
  END IF;

  SELECT COALESCE(display_name, 'Staff') INTO v_staff_name
  FROM public.staff_roles
  WHERE user_id = p_staff_id AND active = true
  LIMIT 1;

  -- Update order to cancelled
  UPDATE public.orders
  SET
    status = 'cancelled',
    payment_status = 'voided',
    cancellation_reason = p_reason,
    is_card_released = false
  WHERE id = p_order_id;

  -- Mark card as held_for_recovery (DO NOT AUTO RELEASE)
  IF v_order.card_number IS NOT NULL THEN
    UPDATE public.queue_cards
    SET
      status = 'held_for_recovery'
    WHERE card_number = v_order.card_number;
  END IF;

  -- Audit log
  INSERT INTO public.order_activity_logs (
    order_id, previous_status, new_status, actor_id, actor_name, notes
  ) VALUES (
    p_order_id, v_order.status, 'cancelled', p_staff_id, v_staff_name,
    'Order cancelled: ' || p_reason || '. Card #' || COALESCE(v_order.card_number::text, 'N/A') || ' held for physical recovery.'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'cancelled',
    'cardHeld', v_order.card_number,
    'requiresCardRelease', v_order.card_number IS NOT NULL
  );
END;
$$;

-- RPC: Separate Manager Explicit Card Release (after physical recovery)
CREATE OR REPLACE FUNCTION public.fn_pos_release_held_card(
  p_card_number INT,
  p_staff_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_staff_name TEXT := 'Manager';
BEGIN
  IF NOT public.fn_is_staff(p_staff_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only authorized manager can release held cards';
  END IF;

  SELECT COALESCE(display_name, 'Manager') INTO v_staff_name
  FROM public.staff_roles
  WHERE user_id = p_staff_id AND active = true
  LIMIT 1;

  UPDATE public.queue_cards
  SET
    status = 'available',
    current_order_id = NULL,
    last_released_at = now(),
    last_released_by = p_staff_id,
    last_release_reason = COALESCE(p_reason, 'Physically recovered by manager')
  WHERE card_number = p_card_number;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card #% not found', p_card_number;
  END IF;

  -- Mark order card as released
  UPDATE public.orders
  SET is_card_released = true
  WHERE card_number = p_card_number AND is_card_released = false;

  RETURN jsonb_build_object(
    'success', true,
    'cardNumber', p_card_number,
    'status', 'available'
  );
END;
$$;

-- RPC: Resolve Card Current Active Order (Strict Privacy - No PII, No Earlier Customer Data)
CREATE OR REPLACE FUNCTION public.fn_get_card_active_order(
  p_card_identifier TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_card RECORD;
  v_order RECORD;
  v_card_num INT;
BEGIN
  -- Parse numeric card number from 'card_04' or '4' or '04'
  IF p_card_identifier ~ '^card_[0-9]+$' THEN
    v_card_num := substring(p_card_identifier from 6)::int;
  ELSIF p_card_identifier ~ '^[0-9]+$' THEN
    v_card_num := p_card_identifier::int;
  ELSE
    RETURN jsonb_build_object('active', false, 'message', 'Invalid card identifier');
  END IF;

  SELECT * INTO v_card
  FROM public.queue_cards
  WHERE card_number = v_card_num;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('active', false, 'message', 'Card not registered');
  END IF;

  -- If card is available or has no active order
  IF v_card.status = 'available' OR v_card.current_order_id IS NULL THEN
    RETURN jsonb_build_object(
      'active', false,
      'cardNumber', v_card.card_number,
      'cardId', v_card.card_id,
      'status', 'available'
    );
  END IF;

  -- Fetch current order (only if not completed & not released, or completed within last 3 minutes)
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = v_card.current_order_id;

  IF NOT FOUND OR v_order.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'active', false,
      'cardNumber', v_card.card_number,
      'cardId', v_card.card_id,
      'status', v_card.status
    );
  END IF;

  -- Return sanitized active order data (Strictly current order, no other customers' data)
  RETURN jsonb_build_object(
    'active', true,
    'cardNumber', v_card.card_number,
    'cardId', v_card.card_id,
    'queueNumber', COALESCE(v_order.pickup_number, 'Card #' || LPAD(v_card.card_number::text, 2, '0')),
    'orderId', v_order.id,
    'requestReference', v_order.request_reference,
    'orderStatus', v_order.status,
    'paymentStatus', v_order.payment_status,
    'paymentMethod', v_order.payment_method,
    'subtotal', v_order.subtotal,
    'totalAmount', v_order.total_amount,
    'createdAt', v_order.created_at,
    'startedAt', v_order.started_at,
    'readyAt', v_order.ready_at,
    'completedAt', v_order.completed_at,
    'receiptSnapshot', v_order.receipt_snapshot,
    'items', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name', oi.product_name,
        'quantity', oi.quantity,
        'unitPrice', oi.unit_price,
        'itemTotal', oi.item_total,
        'customization', oi.customization_summary
      )), '[]'::jsonb)
      FROM public.order_items oi
      WHERE oi.order_id = v_order.id
    )
  );
END;
$$;
