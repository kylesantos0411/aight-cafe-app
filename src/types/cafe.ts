export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

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

export interface Order {
  id: string;                    // UUID or string id
  requestReference: string;     // e.g. "R-8F2"
  code: string;                 // e.g. "A042" (or "R-8F2" before acceptance)
  queueNumber?: string | null;  // e.g. "A042" (only set upon staff acceptance)
  privateToken: string;         // Unguessable UUID token for guest access
  customerId?: string | null;   // Linked customer profile if authenticated
  customerName: string;
  phone?: string;
  orderType: 'takeout' | 'dine-in';
  items: CartItem[];
  subtotal: number;
  totalAmount: number;
  paymentMethod: 'cash_at_pickup' | 'Cash at Counter' | 'GCash' | 'Maya' | 'Card';
  paymentStatus: 'unpaid' | 'verified' | 'paid' | 'refunded';
  status: OrderStatus;
  createdAt: string;            // ISO string
  acceptedAt?: string | null;
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
  role: 'admin' | 'barista' | 'cashier';
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
