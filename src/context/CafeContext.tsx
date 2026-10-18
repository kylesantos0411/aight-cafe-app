import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Order,
  CartItem,
  MenuItem,
  OrderStatus,
  AppViewMode,
  CustomerScreenMode,
  PublicQueueItem,
  QueueCard,
  RefundRecord,
} from '../types/cafe';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '../data/mockMenu';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { realtimeHub } from '../services/realtimeService';
import { queueCardService } from '../services/queueCardService';

interface CafeContextType {
  // Navigation & View
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  customerScreen: CustomerScreenMode;
  setCustomerScreen: (screen: CustomerScreenMode) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;

  // Menu & Cart
  menuItems: MenuItem[];
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  createOrder: (details: {
    customerName: string;
    phone?: string;
    orderType?: 'takeout' | 'dine-in';
    notes?: string;
    customerId?: string | null;
  }) => Promise<Order>;
  acceptOrder: (orderId: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => Promise<Order>;
  verifyCashPayment: (orderId: string) => Promise<Order>;
  refreshOrders: () => Promise<void>;

  // Cashier POS & 20 Physical Queue Cards
  queueCards: import('../types/cafe').QueueCard[];
  refreshCards: () => Promise<import('../types/cafe').QueueCard[]>;
  createDraftOrder: (
    items: CartItem[],
    options?: {
      customerName?: string;
      phone?: string;
      orderType?: 'takeout' | 'dine-in';
      notes?: string;
      expiresInMinutes?: number;
    }
  ) => Promise<Order>;
  confirmPosPaymentAndAllocateCard: (
    orderId: string,
    paymentMethod: 'Cash at Counter' | 'GCash' | 'cash' | 'gcash' | 'cash_at_pickup',
    amountReceived: number
  ) => Promise<{ order: Order; queueNumber: string; card: import('../types/cafe').QueueCard; receipt: import('../types/cafe').ReceiptSnapshot }>;
  releaseHeldCard: (cardNumber: number, reason: string) => Promise<import('../types/cafe').QueueCard>;
  recordOrderRefund: (params: {
    orderId: string;
    cardNumber?: number;
    amount: number;
    refundMethod: 'cash' | 'gcash' | 'original_method';
    authorizingManagerName: string;
    reason: string;
    notes?: string;
  }) => Promise<import('../types/cafe').RefundRecord>;

  // Public Queue
  publicQueue: PublicQueueItem[];

  // Customer State
  customerUser: import('../types/cafe').CustomerUser | null;
  refreshCustomer: () => Promise<void>;

  // Staff State
  isStaffLoggedIn: boolean;
  staffUser: import('../types/cafe').StaffUser | null;
  isStaffAuthChecking: boolean;
  loginStaff: (emailOrPass: string, pass?: string) => Promise<boolean>;
  logoutStaff: () => Promise<void>;

  // Offline / Network
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  toggleOffline: () => void;

  // Reset to initial demo state
  resetDemoData: () => void;

  // Daily Close & Next Day Reset
  resetDailyQueueAndOrders: () => Promise<void>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

const STORAGE_ACTIVE_TOKEN_KEY = 'aight_cafe_active_order_token';
const STORAGE_CART_KEY = 'aight_cafe_cart_v2';

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<AppViewMode>('artboards');
  const [customerScreen, setCustomerScreen] = useState<CustomerScreenMode>('menu');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [menuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(false);
  const [staffUser, setStaffUser] = useState<import('../types/cafe').StaffUser | null>(null);
  const [isStaffAuthChecking, setIsStaffAuthChecking] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeOrder, setActiveOrderState] = useState<Order | null>(null);
  const [publicQueue, setPublicQueue] = useState<PublicQueueItem[]>([]);
  const [queueCards, setQueueCards] = useState<QueueCard[]>(() => queueCardService.getStoredCards());

  const refreshCards = useCallback(async (): Promise<QueueCard[]> => {
    try {
      const cards = await queueCardService.getAllCards();
      setQueueCards(cards);
      return cards;
    } catch {
      return queueCardService.getStoredCards();
    }
  }, []);

  useEffect(() => {
    refreshCards();
  }, [refreshCards]);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [customerUser, setCustomerUser] = useState<import('../types/cafe').CustomerUser | null>(null);

  const refreshCustomer = useCallback(async () => {
    try {
      const user = await authService.getCustomerSession();
      setCustomerUser(user);
    } catch {
      setCustomerUser(null);
    }
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  // Load initial orders and public queue
  const refreshOrders = useCallback(async () => {
    try {
      const loaded = await orderService.getAllOrders();
      setOrders(loaded);

      // Refresh public queue
      const queue = await orderService.getPublicQueue();
      setPublicQueue(queue);

      // Restore active order from token if present and valid
      const activeToken = localStorage.getItem(STORAGE_ACTIVE_TOKEN_KEY);
      if (activeToken) {
        const found = loaded.find(o => o.privateToken === activeToken);
        if (found) {
          setActiveOrderState(found);
          return;
        }
      }
      
      setActiveOrderState(null);
    } catch (err) {
      console.warn('Failed to load orders', err);
    }
  }, []);

  // Verify staff session on app launch
  useEffect(() => {
    authService.getStaffSession().then(staff => {
      setStaffUser(staff);
      setIsStaffLoggedIn(!!staff);
      setIsStaffAuthChecking(false);
    }).catch(() => {
      setStaffUser(null);
      setIsStaffLoggedIn(false);
      setIsStaffAuthChecking(false);
    });
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // Reconcile staff orders every 4s if logged in
  useEffect(() => {
    if (!isStaffLoggedIn) return;
    const interval = setInterval(() => {
      refreshOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, [isStaffLoggedIn, refreshOrders]);

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubOrders = realtimeHub.subscribeToOrders((updatedOrder) => {
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === updatedOrder.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = updatedOrder;
          return next;
        }
        return [updatedOrder, ...prev];
      });

      // Keep active order updated in customer view
      setActiveOrderState(current => {
        if (current && (current.id === updatedOrder.id || current.privateToken === updatedOrder.privateToken)) {
          return updatedOrder;
        }
        return current;
      });
    });

    const unsubQueue = realtimeHub.subscribeToQueue(async () => {
      try {
        const q = await orderService.getPublicQueue();
        setPublicQueue(q);
      } catch {
        // ignore
      }
      refreshOrders();
    });

    // Listen to browser online / offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubOrders();
      unsubQueue();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshOrders]);

  // Save cart changes
  useEffect(() => {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const setActiveOrder = (order: Order | null) => {
    setActiveOrderState(order);
    if (order?.privateToken) {
      localStorage.setItem(STORAGE_ACTIVE_TOKEN_KEY, order.privateToken);
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_TOKEN_KEY);
    }
  };

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    };
    setCart(prev => [...prev, newItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(i => i.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.id === cartItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const createOrder = async (details: {
    customerName: string;
    phone?: string;
    orderType?: 'takeout' | 'dine-in';
    notes?: string;
    customerId?: string | null;
  }): Promise<Order> => {
    const newOrder = await orderService.createOrder(
      cart.length > 0 ? cart : [
        {
          id: 'cart_default_1',
          menuItemId: '1',
          name: 'Iced oat latte',
          price: 180,
          quantity: 1,
          image: '/figma-assets/iced-latte.jpg',
          size: 'Large',
          milk: 'Oat milk',
          sweetness: '25%',
        },
        {
          id: 'cart_default_2',
          menuItemId: '5',
          name: 'Brown butter cookie',
          price: 85,
          quantity: 1,
          image: '/figma-assets/brown-butter-cookie.jpg',
        }
      ],
      {
        customerName: details.customerName,
        phone: details.phone,
        orderType: details.orderType,
        notes: details.notes,
        customerId: details.customerId || customerUser?.id || null,
      },
      menuItems
    );

    setActiveOrder(newOrder);
    clearCart();
    await refreshOrders();
    return newOrder;
  };

  const acceptOrder = async (orderId: string): Promise<Order> => {
    const updated = await orderService.acceptOrder(orderId, staffUser?.id);
    await refreshOrders();
    return updated;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    reason?: string
  ): Promise<Order> => {
    const updated = await orderService.updateOrderStatus(orderId, status, reason, staffUser?.id);
    await refreshOrders();
    return updated;
  };

  const verifyCashPayment = async (orderId: string): Promise<Order> => {
    const updated = await orderService.verifyCashPayment(orderId, staffUser?.id);
    await refreshOrders();
    return updated;
  };

  const loginStaff = async (emailOrPass: string, pass?: string): Promise<boolean> => {
    try {
      const email = pass ? emailOrPass : 'kylesantos0411@gmail.com';
      const password = pass ? pass : emailOrPass;
      const user = await authService.signInStaff(email, password);
      setStaffUser(user);
      setIsStaffLoggedIn(true);
      return true;
    } catch (err) {
      setStaffUser(null);
      setIsStaffLoggedIn(false);
      throw err;
    }
  };

  const logoutStaff = async () => {
    await authService.signOutStaff();
    setStaffUser(null);
    setIsStaffLoggedIn(false);
  };

  const toggleOffline = () => {
    setIsOffline(prev => !prev);
  };

  const resetDemoData = () => {
    setOrders([]);
    setActiveOrder(null);
    setCart([]);
    setIsOffline(false);
    localStorage.removeItem('aight_cafe_orders_v2');
    localStorage.removeItem(STORAGE_CART_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_TOKEN_KEY);
  };

  const resetDailyQueueAndOrders = async () => {
    const updated = await orderService.resetDailyQueueAndOrders();
    setOrders(updated);
    setActiveOrderState(null);
    localStorage.removeItem(STORAGE_ACTIVE_TOKEN_KEY);
    const queue = await orderService.getPublicQueue();
    setPublicQueue(queue);
  };

  const createDraftOrder = async (
    items: CartItem[],
    options?: {
      customerName?: string;
      phone?: string;
      orderType?: 'takeout' | 'dine-in';
      notes?: string;
      expiresInMinutes?: number;
    }
  ): Promise<Order> => {
    const draft = await orderService.createDraftOrder(items, options, staffUser || undefined, menuItems);
    await refreshOrders();
    return draft;
  };

  const confirmPosPaymentAndAllocateCard = async (
    orderId: string,
    paymentMethod: 'Cash at Counter' | 'GCash' | 'cash' | 'gcash' | 'cash_at_pickup',
    amountReceived: number
  ) => {
    const res = await orderService.confirmPosPaymentAndAllocateCard(
      orderId,
      paymentMethod,
      amountReceived,
      staffUser || undefined
    );
    await Promise.all([refreshOrders(), refreshCards()]);
    return res;
  };

  const releaseHeldCard = async (cardNumber: number, reason: string): Promise<QueueCard> => {
    const card = await orderService.releaseHeldCard(cardNumber, reason, staffUser?.id);
    await Promise.all([refreshOrders(), refreshCards()]);
    return card;
  };

  const recordOrderRefund = async (params: {
    orderId: string;
    cardNumber?: number;
    amount: number;
    refundMethod: 'cash' | 'gcash' | 'original_method';
    authorizingManagerName: string;
    reason: string;
    notes?: string;
  }): Promise<RefundRecord> => {
    const rec = await orderService.recordOrderRefund({
      ...params,
      authorizingManagerId: staffUser?.id,
    });
    await refreshOrders();
    return rec;
  };

  return (
    <CafeContext.Provider
      value={{
        viewMode,
        setViewMode,
        customerScreen,
        setCustomerScreen,
        isMobileFrame,
        setIsMobileFrame,
        menuItems,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        activeOrder,
        setActiveOrder,
        createOrder,
        acceptOrder,
        updateOrderStatus,
        verifyCashPayment,
        refreshOrders,
        queueCards,
        refreshCards,
        createDraftOrder,
        confirmPosPaymentAndAllocateCard,
        releaseHeldCard,
        recordOrderRefund,
        publicQueue,
        customerUser,
        refreshCustomer,
        isStaffLoggedIn,
        staffUser,
        isStaffAuthChecking,
        loginStaff,
        logoutStaff,
        isOffline,
        setIsOffline,
        toggleOffline,
        resetDemoData,
        resetDailyQueueAndOrders,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};
