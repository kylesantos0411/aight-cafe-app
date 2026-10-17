-- =====================================================================
-- AIGHT CAFE — SUPABASE POSTGRESQL PRODUCTION SCHEMA & MIGRATION
-- Project: Aight Cafe (Pickup-only popup coffee & bakes)
-- Timezone: Asia/Manila
-- =====================================================================

-- Enable pgcrypto for UUIDs and random tokens
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. STORE SETTINGS & AVAILABILITY
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'Aight Cafe',
  stall_location TEXT NOT NULL DEFAULT 'The Courtyard',
  is_open BOOLEAN NOT NULL DEFAULT true,
  opening_time TIME NOT NULL DEFAULT '08:00',
  closing_time TIME NOT NULL DEFAULT '18:00',
  queue_prefix CHAR(1) NOT NULL DEFAULT 'A',
  timezone TEXT NOT NULL DEFAULT 'Asia/Manila',
  ordering_enabled BOOLEAN NOT NULL DEFAULT true,
  stall_sound_enabled BOOLEAN NOT NULL DEFAULT false,
  announcement_banner TEXT DEFAULT 'Open until 6 PM · Pickup only',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CUSTOMER & USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL DEFAULT 'Guest',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. STAFF ROLES (Strict role-based authorization; NOT self-registered)
CREATE TABLE IF NOT EXISTS public.staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('stall_operator', 'barista', 'manager', 'admin')),
  display_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 4. PRODUCT CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  image_url TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. PRODUCT OPTION GROUPS (Size, Milk, Sweetness, Add-ons)
CREATE TABLE IF NOT EXISTS public.product_option_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Size', 'Milk', 'Sweetness', 'Add-ons'
  selection_type TEXT NOT NULL DEFAULT 'single' CHECK (selection_type IN ('single', 'multiple')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. PRODUCT OPTION ITEMS
CREATE TABLE IF NOT EXISTS public.product_option_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_delta NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price_delta >= 0),
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0
);

-- 8. DAILY QUEUE NUMBER SEQUENCE GENERATOR
CREATE TABLE IF NOT EXISTS public.daily_queue_sequences (
  service_date DATE PRIMARY KEY DEFAULT (now() AT TIME ZONE 'Asia/Manila')::date,
  last_number INT NOT NULL DEFAULT 40, -- Initial baseline matching A041, A042
  prefix CHAR(1) NOT NULL DEFAULT 'A'
);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_reference TEXT NOT NULL UNIQUE, -- 'R-8F2', 'R-91C' (before acceptance)
  pickup_number TEXT,                    -- Assigned atomically on acceptance: 'A042'
  private_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE, -- Unguessable guest link
  customer_name TEXT NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone TEXT,
  order_type TEXT NOT NULL DEFAULT 'takeout' CHECK (order_type IN ('takeout', 'dine_in')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'cash_at_pickup' CHECK (payment_method IN ('cash_at_pickup')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'verified', 'voided')),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  pickup_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  cancellation_reason TEXT,
  notes TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cash_verified_at TIMESTAMPTZ,
  cash_verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cash_amount_received NUMERIC(10,2)
);

-- 10. ORDER ITEMS TABLE (Immutable historical snapshot of product and price)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  item_total NUMERIC(10,2) NOT NULL CHECK (item_total >= 0),
  customization_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. ORDER ITEM CUSTOMIZATIONS (Snapshot of selected options)
CREATE TABLE IF NOT EXISTS public.order_item_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  option_name TEXT NOT NULL,
  price_delta NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- 12. AUDIT TRAIL / ORDER ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.order_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- INDEXES FOR FAST PERFORMANCE & CONCURRENCY
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_private_token ON public.orders(private_token);
CREATE INDEX IF NOT EXISTS idx_orders_pickup_number ON public.orders(pickup_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_user_id ON public.staff_roles(user_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current user an authorized staff member?
CREATE OR REPLACE FUNCTION public.fn_is_staff(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_roles
    WHERE user_id = $1 AND active = true
  );
$$;

-- 1. Store settings: Public read-only; staff can update
CREATE POLICY "Public read store_settings"
  ON public.store_settings FOR SELECT
  USING (true);

CREATE POLICY "Staff update store_settings"
  ON public.store_settings FOR UPDATE
  USING (public.fn_is_staff(auth.uid()));

-- 2. Menu Catalog: Public read-only; staff can update availability
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (is_active = true OR public.fn_is_staff(auth.uid()));
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (is_available = true OR public.fn_is_staff(auth.uid()));
CREATE POLICY "Public read option groups" ON public.product_option_groups FOR SELECT USING (true);
CREATE POLICY "Public read option items" ON public.product_option_items FOR SELECT USING (true);

CREATE POLICY "Staff update products" ON public.products FOR UPDATE USING (public.fn_is_staff(auth.uid()));

-- 3. Profiles: User can view and update their own profile; staff can view customer profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.fn_is_staff(auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Staff roles: Staff can view; only admins can modify
CREATE POLICY "Staff read roles" ON public.staff_roles FOR SELECT USING (public.fn_is_staff(auth.uid()));

-- 5. Orders:
-- Customers: Can select only their own orders (by auth.uid() or private_token through secure RPC)
CREATE POLICY "Customer view own orders"
  ON public.orders FOR SELECT
  USING (
    customer_id = auth.uid()
    OR public.fn_is_staff(auth.uid())
  );

-- Customers/Public can create an order in 'pending' status only
CREATE POLICY "Public insert pending orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND payment_status = 'unpaid'
    AND pickup_number IS NULL
  );

-- Only staff can update orders (statuses, payments, queue assignments)
CREATE POLICY "Staff update orders"
  ON public.orders FOR UPDATE
  USING (public.fn_is_staff(auth.uid()));

-- Order items: Can be read by order owner or staff
CREATE POLICY "View order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.customer_id = auth.uid() OR public.fn_is_staff(auth.uid()))
    )
  );

CREATE POLICY "Insert order items on create"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- Order activity logs: Read by staff and order owner
CREATE POLICY "View order activity"
  ON public.order_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_activity_logs.order_id
      AND (o.customer_id = auth.uid() OR public.fn_is_staff(auth.uid()))
    )
  );

-- =====================================================================
-- SECURE DATABASE FUNCTIONS & WORKFLOW RPCs (SECURITY DEFINER)
-- =====================================================================

-- RPC 1: Look up order by private token (for Guest access without leaking table)
CREATE OR REPLACE FUNCTION public.fn_get_order_by_token(p_private_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_order RECORD;
  v_items JSONB;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE private_token = p_private_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', oi.id,
      'product_name', oi.product_name,
      'unit_price', oi.unit_price,
      'quantity', oi.quantity,
      'item_total', oi.item_total,
      'customization_summary', oi.customization_summary
    )
  ) INTO v_items
  FROM public.order_items oi
  WHERE oi.order_id = v_order.id;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'request_reference', v_order.request_reference,
    'pickup_number', v_order.pickup_number,
    'private_token', v_order.private_token,
    'customer_name', v_order.customer_name,
    'status', v_order.status,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'subtotal', v_order.subtotal,
    'pickup_fee', v_order.pickup_fee,
    'total_amount', v_order.total_amount,
    'cancellation_reason', v_order.cancellation_reason,
    'created_at', v_order.created_at,
    'accepted_at', v_order.accepted_at,
    'started_at', v_order.started_at,
    'ready_at', v_order.ready_at,
    'completed_at', v_order.completed_at,
    'items', COALESCE(v_items, '[]'::jsonb)
  );
END;
$$;

-- RPC 2: Atomic Accept Order & Queue Allocation (Thread-Safe Transaction)
CREATE OR REPLACE FUNCTION public.fn_accept_order(
  p_order_id UUID,
  p_staff_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_today DATE := (now() AT TIME ZONE 'Asia/Manila')::date;
  v_next_num INT;
  v_prefix CHAR(1);
  v_pickup_code TEXT;
  v_staff_name TEXT := 'Staff';
BEGIN
  -- Verify staff authorization
  IF NOT public.fn_is_staff(p_staff_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only verified staff can accept orders';
  END IF;

  -- Lock order row for update
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.status <> 'pending' THEN
    RAISE EXCEPTION 'Order is not in pending state (current: %)', v_order.status;
  END IF;

  -- Get staff display name
  SELECT display_name INTO v_staff_name
  FROM public.staff_roles
  WHERE user_id = p_staff_id AND active = true
  LIMIT 1;

  -- Atomic queue number allocation (concurrency-safe lock on daily sequence)
  INSERT INTO public.daily_queue_sequences (service_date, last_number, prefix)
  VALUES (v_today, 40, 'A')
  ON CONFLICT (service_date) DO UPDATE
  SET last_number = public.daily_queue_sequences.last_number + 1
  RETURNING last_number, prefix INTO v_next_num, v_prefix;

  v_pickup_code := v_prefix || LPAD(v_next_num::text, 3, '0');

  -- Update order
  UPDATE public.orders
  SET
    status = 'confirmed',
    pickup_number = v_pickup_code,
    accepted_at = now()
  WHERE id = p_order_id;

  -- Log audit activity
  INSERT INTO public.order_activity_logs (
    order_id, previous_status, new_status, actor_id, actor_name, notes
  ) VALUES (
    p_order_id, 'pending', 'confirmed', p_staff_id, v_staff_name, 'Order accepted. Assigned queue ' || v_pickup_code
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'pickup_number', v_pickup_code,
    'status', 'confirmed',
    'accepted_at', now()
  );
END;
$$;

-- RPC 3: Validated Order Status Transitions
CREATE OR REPLACE FUNCTION public.fn_update_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_staff_id UUID,
  p_reason TEXT DEFAULT NULL
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
    RAISE EXCEPTION 'Unauthorized: Only verified staff can transition order status';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- State machine validation
  IF p_new_status = 'preparing' THEN
    IF v_order.status <> 'confirmed' THEN
      RAISE EXCEPTION 'Can only start preparing confirmed orders';
    END IF;
    UPDATE public.orders SET status = 'preparing', started_at = now() WHERE id = p_order_id;

  ELSIF p_new_status = 'ready' THEN
    IF v_order.status NOT IN ('confirmed', 'preparing') THEN
      RAISE EXCEPTION 'Can only mark ready from confirmed or preparing';
    END IF;
    UPDATE public.orders SET status = 'ready', ready_at = now() WHERE id = p_order_id;

  ELSIF p_new_status = 'completed' THEN
    IF v_order.status <> 'ready' THEN
      RAISE EXCEPTION 'Can only complete an order that is ready for pickup';
    END IF;
    IF v_order.payment_status <> 'verified' THEN
      RAISE EXCEPTION 'Cannot complete order: Cash payment has not been verified yet!';
    END IF;
    UPDATE public.orders SET status = 'completed', completed_at = now() WHERE id = p_order_id;

  ELSIF p_new_status = 'cancelled' THEN
    IF v_order.status IN ('completed', 'cancelled') THEN
      RAISE EXCEPTION 'Cannot cancel an order that is already completed or cancelled';
    END IF;
    UPDATE public.orders
    SET
      status = 'cancelled',
      payment_status = 'voided',
      cancellation_reason = COALESCE(p_reason, 'Cancelled by store team')
    WHERE id = p_order_id;

  ELSE
    RAISE EXCEPTION 'Invalid status target: %', p_new_status;
  END IF;

  SELECT display_name INTO v_staff_name
  FROM public.staff_roles
  WHERE user_id = p_staff_id AND active = true
  LIMIT 1;

  INSERT INTO public.order_activity_logs (
    order_id, previous_status, new_status, actor_id, actor_name, notes
  ) VALUES (
    p_order_id, v_order.status, p_new_status, p_staff_id, v_staff_name, p_reason
  );

  RETURN jsonb_build_object('success', true, 'status', p_new_status);
END;
$$;

-- RPC 4: Cash Payment Verification
CREATE OR REPLACE FUNCTION public.fn_verify_cash_payment(
  p_order_id UUID,
  p_staff_id UUID,
  p_amount_received NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_staff_name TEXT;
BEGIN
  IF NOT public.fn_is_staff(p_staff_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only verified staff can verify cash receipts';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF p_amount_received < v_order.total_amount THEN
    RAISE EXCEPTION 'Received amount (₱%) is less than order total (₱%)', p_amount_received, v_order.total_amount;
  END IF;

  SELECT display_name INTO v_staff_name
  FROM public.staff_roles
  WHERE user_id = p_staff_id AND active = true
  LIMIT 1;

  UPDATE public.orders
  SET
    payment_status = 'verified',
    cash_verified_at = now(),
    cash_verified_by = p_staff_id,
    cash_amount_received = p_amount_received
  WHERE id = p_order_id;

  INSERT INTO public.order_activity_logs (
    order_id, previous_status, new_status, actor_id, actor_name, notes
  ) VALUES (
    p_order_id, v_order.status, v_order.status, p_staff_id, v_staff_name,
    'Verified cash receipt of ₱' || p_amount_received::text
  );

  RETURN jsonb_build_object(
    'success', true,
    'payment_status', 'verified',
    'verified_at', now(),
    'verified_by', v_staff_name
  );
END;
$$;

-- RPC 5: Public Queue Feed (STRICT PRIVACY: NO PII, NO NAMES, NO TOTALS)
CREATE OR REPLACE FUNCTION public.fn_get_public_queue()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_ready JSONB;
  v_preparing JSONB;
  v_last_updated TIMESTAMPTZ := now();
BEGIN
  -- Ready orders (e.g. A042, A040)
  SELECT jsonb_agg(
    jsonb_build_object(
      'pickup_number', pickup_number,
      'ready_at', ready_at
    ) ORDER BY ready_at DESC
  ) INTO v_ready
  FROM public.orders
  WHERE status = 'ready' AND pickup_number IS NOT NULL;

  -- Preparing / Confirmed orders (e.g. A041, A044)
  SELECT jsonb_agg(
    jsonb_build_object(
      'pickup_number', pickup_number,
      'status', status,
      'started_at', started_at
    ) ORDER BY accepted_at ASC
  ) INTO v_preparing
  FROM public.orders
  WHERE status IN ('confirmed', 'preparing') AND pickup_number IS NOT NULL;

  RETURN jsonb_build_object(
    'ready', COALESCE(v_ready, '[]'::jsonb),
    'preparing', COALESCE(v_preparing, '[]'::jsonb),
    'timestamp', v_last_updated
  );
END;
$$;

-- RPC 6: Link Guest Order to Authenticated Customer
CREATE OR REPLACE FUNCTION public.fn_link_guest_order(
  p_private_token UUID,
  p_customer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  -- Verify customer is linking their own authenticated user id
  IF auth.uid() <> p_customer_id THEN
    RAISE EXCEPTION 'Unauthorized customer linkage';
  END IF;

  UPDATE public.orders
  SET customer_id = p_customer_id
  WHERE private_token = p_private_token
  AND (customer_id IS NULL OR customer_id = p_customer_id)
  RETURNING id INTO v_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found or already assigned');
  END IF;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id);
END;
$$;

-- =====================================================================
-- INITIAL SEED DATA (Aight Cafe Menu from Design)
-- =====================================================================
INSERT INTO public.store_settings (store_name, stall_location, is_open, opening_time, closing_time)
VALUES ('Aight Cafe', 'The Courtyard', true, '08:00', '18:00')
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO public.categories (name, slug, display_order)
VALUES
  ('Coffee', 'coffee', 1),
  ('Non-Coffee', 'non-coffee', 2),
  ('Matcha', 'matcha', 3),
  ('Pastries', 'pastries', 4)
ON CONFLICT (slug) DO NOTHING;

-- Products with exact pricing from design
DO $$
DECLARE
  v_cat_coffee UUID;
  v_cat_noncoffee UUID;
  v_cat_matcha UUID;
  v_cat_pastries UUID;
  v_prod_latte UUID;
  v_opt_size UUID;
  v_opt_milk UUID;
  v_opt_sweet UUID;
  v_opt_addons UUID;
BEGIN
  SELECT id INTO v_cat_coffee FROM public.categories WHERE slug = 'coffee';
  SELECT id INTO v_cat_noncoffee FROM public.categories WHERE slug = 'non-coffee';
  SELECT id INTO v_cat_matcha FROM public.categories WHERE slug = 'matcha';
  SELECT id INTO v_cat_pastries FROM public.categories WHERE slug = 'pastries';

  -- 1. Iced Latte (₱140 base)
  INSERT INTO public.products (category_id, name, slug, description, base_price, image_url, display_order)
  VALUES (v_cat_coffee, 'Iced latte', 'iced-latte', 'Double espresso, your choice of milk, over ice. A smooth everyday favorite.', 140.00, '/figma-assets/iced-latte.jpg', 1)
  ON CONFLICT (slug) DO UPDATE SET base_price = 140.00 RETURNING id INTO v_prod_latte;

  -- 2. Iced Americano (₱110 base)
  INSERT INTO public.products (category_id, name, slug, description, base_price, image_url, display_order)
  VALUES (v_cat_coffee, 'Iced americano', 'iced-americano', 'Bold, bright & refreshing double shot over chilled spring water and ice.', 110.00, '/figma-assets/iced-americano.jpg', 2)
  ON CONFLICT (slug) DO UPDATE SET base_price = 110.00;

  -- 3. Matcha Latte (₱160 base)
  INSERT INTO public.products (category_id, name, slug, description, base_price, image_url, display_order)
  VALUES (v_cat_matcha, 'Matcha latte', 'matcha-latte', 'Matcha · Earthy & mellow ceremonial grade whisked fresh with velvety milk.', 160.00, '/figma-assets/matcha-latte.jpg', 3)
  ON CONFLICT (slug) DO UPDATE SET base_price = 160.00;

  -- 4. Iced Chocolate (₱130 base)
  INSERT INTO public.products (category_id, name, slug, description, base_price, image_url, display_order)
  VALUES (v_cat_noncoffee, 'Iced chocolate', 'iced-chocolate', 'Non-Coffee · Rich dark cocoa swirled with fresh chilled milk and ice.', 130.00, '/figma-assets/iced-chocolate.jpg', 4)
  ON CONFLICT (slug) DO UPDATE SET base_price = 130.00;

  -- 5. Brown Butter Cookie (₱85)
  INSERT INTO public.products (category_id, name, slug, description, base_price, image_url, display_order)
  VALUES (v_cat_pastries, 'Brown butter cookie', 'brown-butter-cookie', 'Chocolate chunks, flaky salt, molten center baked fresh daily.', 85.00, '/figma-assets/brown-butter-cookie.jpg', 5)
  ON CONFLICT (slug) DO UPDATE SET base_price = 85.00;

  -- 6. Butter Croissant (₱120)
  INSERT INTO public.products (category_id, name, slug, description, base_price, image_url, display_order)
  VALUES (v_cat_pastries, 'Butter croissant', 'butter-croissant', 'Flaky, golden, baked today with laminated French butter layers.', 120.00, '/figma-assets/butter-croissant.jpg', 6)
  ON CONFLICT (slug) DO UPDATE SET base_price = 120.00;

  -- Customization options for Iced Latte
  IF v_prod_latte IS NOT NULL THEN
    -- Size Group
    INSERT INTO public.product_option_groups (product_id, name, selection_type, is_required, display_order)
    VALUES (v_prod_latte, 'Size', 'single', true, 1)
    RETURNING id INTO v_opt_size;

    INSERT INTO public.product_option_items (group_id, name, price_delta, is_default, display_order)
    VALUES
      (v_opt_size, 'Regular (12 oz)', 0.00, true, 1),
      (v_opt_size, 'Large (16 oz)', 20.00, false, 2);

    -- Milk Group
    INSERT INTO public.product_option_groups (product_id, name, selection_type, is_required, display_order)
    VALUES (v_prod_latte, 'Milk', 'single', true, 2)
    RETURNING id INTO v_opt_milk;

    INSERT INTO public.product_option_items (group_id, name, price_delta, is_default, display_order)
    VALUES
      (v_opt_milk, 'Dairy', 0.00, true, 1),
      (v_opt_milk, 'Oat milk', 20.00, false, 2),
      (v_opt_milk, 'Soy milk', 20.00, false, 3);

    -- Sweetness Group
    INSERT INTO public.product_option_groups (product_id, name, selection_type, is_required, display_order)
    VALUES (v_prod_latte, 'Sweetness', 'single', true, 3)
    RETURNING id INTO v_opt_sweet;

    INSERT INTO public.product_option_items (group_id, name, price_delta, is_default, display_order)
    VALUES
      (v_opt_sweet, '0%', 0.00, false, 1),
      (v_opt_sweet, '25%', 0.00, true, 2),
      (v_opt_sweet, '50%', 0.00, false, 3),
      (v_opt_sweet, '100%', 0.00, false, 4);

    -- Add-ons Group
    INSERT INTO public.product_option_groups (product_id, name, selection_type, is_required, display_order)
    VALUES (v_prod_latte, 'Add-ons', 'multiple', false, 4)
    RETURNING id INTO v_opt_addons;

    INSERT INTO public.product_option_items (group_id, name, price_delta, is_default, display_order)
    VALUES (v_opt_addons, 'Extra espresso shot', 30.00, false, 1);
  END IF;
END $$;
