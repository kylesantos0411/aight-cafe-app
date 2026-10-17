# Aight Cafe — Production Web Application & Queue System

A production-grade, pickup-only coffee stall ordering system built exactly from the Figma design (`AIGHT CAFE APP.fig`). Features a zero-redesign customer flow, staff pickup Kanban board, public stall queue display, atomic sequence generation, cash payment verification gate, and offline-resilient PWA support.

---

## 🌟 Key Features

1. **Exact Figma Fidelity (All 15 Artboards)**
   - Screen 01: Menu (`Screen01Menu.tsx`)
   - Screen 02: Customize — Make it yours (`Screen02Customize.tsx`)
   - Screen 03: Cart — The good stuff (`Screen03Cart.tsx`)
   - Screen 04: Checkout — One last thing (`Screen04Checkout.tsx`)
   - Screen 05: Pending — Sent to the team (`Screen05Pending.tsx`)
   - Screen 06: Confirmed — You're in the queue (`Screen06Confirmed.tsx`)
   - Screen 07: Preparing — A little coffee magic (`Screen07Preparing.tsx`)
   - Screen 08: Ready for pickup — Your good stuff is ready (`Screen08Ready.tsx`)
   - Screen 09: Completed — Enjoy your aight moment (`Screen09Completed.tsx`)
   - Screen 10: Cancelled — Order cancelled (`Screen10Cancelled.tsx`)
   - Screen 11: Connection lost — Your order is still yours (`Screen11ConnectionLost.tsx`)
   - Screen 12: Staff sign-in — Protected access (`Screen12StaffSignIn.tsx`)
   - Screen 13: Staff orders — 1440px Kanban board (`Screen13StaffOrders.tsx`)
   - Screen 14: Stall queue — 1440px digital TV display (`Screen14StallQueue.tsx`)
   - Screen 15: Handoff documentation (`Screen15HandoffDoc.tsx`)

2. **Authoritative Server Pricing**
   - Prices and addon totals are recalculated authoritatively on the backend/service layer against active menu items.
   - Prevents client-side price tampering.

3. **Atomic Queue Numbers & Request References**
   - Guest orders receive a short request reference (e.g. `R-8F2`) and an unguessable private token (UUID).
   - Queue numbers (e.g. `A042`) are atomically allocated **only upon staff acceptance** using PostgreSQL sequence locks (`fn_accept_order`).

4. **Cash Verification Security Gate**
   - The business model is strictly **cash at pickup** (`payment_method = 'cash_at_pickup'`).
   - Hard enforcement: An order can **never** be transitioned to `completed` unless cash receipt has been verified (`payment_status = 'verified'`) by an authorized staff operator.

5. **Zero-PII Public Stall Display**
   - Stall TV screen queries the secure RPC `fn_get_public_queue()`.
   - Strictly exposes only `queue_number`, `status`, and `updated_at`. Customer names, phones, notes, items, and totals are 100% isolated.

6. **Progressive Web App (PWA)**
   - Standalone installable app for iOS Safari and Android Chrome.
   - Caches app shell, fonts, and menu photography safely in Cache Storage.
   - Offline fallback: Displays Screen 11 ("Connection lost · Your order is still yours") with the last verified order state and timestamp.

---

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite 6.
- **Backend / Database:** Supabase (PostgreSQL 15+, Row Level Security, RPCs, Auth, Realtime).
- **Testing:** Vitest with jsdom and React Testing Library.
- **Deployment:** Vercel (SPA routing, HTTPS, Security headers configured in `vercel.json`).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```
> **Note:** If environment variables are omitted, Aight Cafe runs automatically in **high-fidelity local engine mode**, persisting orders and queue sequences in browser storage while keeping all database constraints and RPC logic active.

### 3. Apply Supabase Database Migrations
Run the schema file directly in your Supabase SQL Editor:
```
supabase/migrations/20261017000000_aight_cafe_schema.sql
```
This sets up:
- Tables: `store_settings`, `profiles`, `staff_roles`, `categories`, `products`, `product_option_groups`, `product_option_items`, `orders`, `order_items`, `daily_queue_sequences`, `order_activity_logs`.
- Row-Level Security (RLS) policies.
- Atomic RPC functions: `fn_accept_order`, `fn_update_order_status`, `fn_verify_cash_payment`, `fn_get_public_queue`, `fn_link_guest_order`.
- Authentic Aight Cafe menu seed data with extracted photography.

### 4. Run Automated Tests
```bash
npm test
```
All 9 core tests (pricing validation, lifecycle transitions, cash verification gate, zero-PII queue privacy, and token generation) execute via Vitest.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

---

## 📱 PWA Installation Instructions

### iOS (Safari)
1. Open the deployed application URL in Safari.
2. Tap the **Share** button (box with upward arrow) at the bottom toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top right corner. The Aight Cafe icon will appear on your iOS home screen.

### Android (Chrome)
1. Open the deployed application URL in Chrome.
2. Tap the browser options menu (three dots **⋮**).
3. Select **Install app** or **Add to Home screen**.
4. Confirm installation.

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete Aight Cafe production app with Supabase, PWA, and Vitest suite"
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com) and import the repository.
3. In Project Settings > Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will build and serve the application using the included `vercel.json` rewrite rules and security headers.
