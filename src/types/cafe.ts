export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface MenuItemOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Coffee' | 'Cold Brew' | 'Tea & Matcha' | 'Pastries';
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
  tags?: string[];
  options?: {
    sizes?: MenuItemOption[];
    milks?: MenuItemOption[];
    sweetness?: string[];
    temperatures?: ('Hot' | 'Iced')[];
    extraShotPrice?: number;
  };
}

export interface CartCustomization {
  groupName: string;
  itemName: string;
  additionalPrice: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number; // Unit price including customizations
  basePrice?: number;
  quantity: number;
  image: string;
  size?: string;
  milk?: string;
  sweetness?: string;
  temperature?: 'Hot' | 'Iced';
  extraShot?: boolean;
  notes?: string;
  customizations?: CartCustomization[];
}

export interface ReceiptSnapshot {
  orderId: string;
  requestReference: string;
  cardNumber: number;
  cardId: string;
  queueNumber: string;
  customerName: string;
  totalAmount: number;
  subtotal: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string;
  cashierName: string;
  cashAmountReceived?: number;
  cashChangeGiven?: number;
  paymentProofRef?: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    itemTotal: number;
    customization?: string | null;
  }[];
}

export interface QueueCard {
  id: string;
  cardNumber: number; // 1 to 20
  cardId: string; // 'card_01' to 'card_20'
  status: 'available' | 'occupied' | 'held_for_recovery';
  currentOrderId?: string | null;
  allocatedAt?: string | null;
  lastReleasedAt?: string | null;
  lastReleasedBy?: string | null;
  lastReleaseReason?: string | null;
}

export interface RefundRecord {
  id: string;
  orderId: string;
  cardNumber?: number;
  amount: number;
  refundMethod: 'cash' | 'gcash' | 'original_method';
  refundStatus: 'not_required' | 'pending' | 'partially_refunded' | 'refunded';
  status?: 'completed' | 'pending' | string;
  authorizingManagerId?: string;
  authorizingManagerName: string;
  authorizedBy?: string;
  reason: string;
  notes?: string;
  processedAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;                    // UUID or string id
  requestReference: string;     // e.g. "R-8F2"
  code: string;                 // e.g. "Card #04" or "R-8F2"
  queueNumber?: string | null;  // e.g. "Card #04"
  cardNumber?: number | null;   // 1 to 20 physical card number
  cardId?: string | null;       // 'card_01' to 'card_20'
  isCardReleased?: boolean;
  draftExpiresAt?: string | null;
  receiptSnapshot?: ReceiptSnapshot | null;
  cashierId?: string | null;
  cashierName?: string | null;
  privateToken: string;         // Unguessable UUID token for guest access
  customerId?: string | null;   // Linked customer profile if authenticated
  customerName: string;
  phone?: string;
  orderType: 'takeout' | 'dine-in';
  items: CartItem[];
  subtotal: number;
  totalAmount: number;
  paymentMethod: 'cash_at_pickup' | 'Cash at Counter' | 'GCash' | 'cash' | 'gcash' | 'Maya' | 'Card';
  paymentStatus: 'unpaid' | 'verified' | 'paid' | 'refunded' | 'voided';
  cashAmountReceived?: number;
  cashChangeGiven?: number;
  paymentProofRef?: string;
  status: OrderStatus;
  createdAt: string;            // ISO string
  acceptedAt?: string | null;
  startedAt?: string | null;
  readyAt?: string | null;
  completedAt?: string | null;
  estimatedMinutes?: number;
  cancellationReason?: string;
  notes?: string;
}

export interface PublicQueueItem {
  queueNumber: string;
  status: 'preparing' | 'ready';
  updatedAt: string;
}

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'barista' | 'cashier' | 'manager' | 'stall_operator';
}

export interface CustomerUser {
  id: string;
  email: string;
  fullName: string;
}

export type AppViewMode = 'customer' | 'staff' | 'display' | 'artboards';
export type CustomerScreenMode =
  | 'menu'
  | 'customize'
  | 'cart'
  | 'checkout'
  | 'pending'
  | 'status-confirmed'
  | 'status-preparing'
  | 'status-ready'
  | 'status-completed'
  | 'status-cancelled'
  | 'status-offline';
