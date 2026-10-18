import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Order,
  CartItem,
  MenuItem,
  OrderStatus,
  AppViewMode,
  CustomerScreenMode,
  PublicQueueItem,
} from '../types/cafe';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '../data/mockMenu';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { realtimeHub } from '../services/realtimeService';

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
  }) => Promise<Order>;
  acceptOrder: (orderId: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => Promise<Order>;
  verifyCashPayment: (orderId: string) => Promise<Order>;

  // Public Queue
  publicQueue: PublicQueueItem[];

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

  // Load initial orders and public queue
  const refreshOrders = useCallback(async () => {
    try {
      const loaded = await orderService.getAllOrders();
      setOrders(loaded);

      // Refresh public queue
      const queue = await orderService.getPublicQueue();
      setPublicQueue(queue);

      // Restore active order from token if present, or fallback to A042
      const activeToken = localStorage.getItem(STORAGE_ACTIVE_TOKEN_KEY);
      if (activeToken) {
        const found = loaded.find(o => o.privateToken === activeToken);
        if (found) {
          setActiveOrderState(found);
          return;
        }
      }
      
      const defaultOrder = loaded.find(o => o.code === 'A042') || loaded[0] || null;
      setActiveOrderState(defaultOrder);
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
  }, []);

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
      },
      menuItems
    );

    setActiveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const acceptOrder = async (orderId: string): Promise<Order> => {
    const updated = await orderService.acceptOrder(orderId);
    return updated;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    reason?: string
  ): Promise<Order> => {
    const updated = await orderService.updateOrderStatus(orderId, status, reason);
    return updated;
  };

  const verifyCashPayment = async (orderId: string): Promise<Order> => {
    const updated = await orderService.verifyCashPayment(orderId);
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
    setOrders(INITIAL_ORDERS);
    const a042 = INITIAL_ORDERS.find(o => o.code === 'A042') || INITIAL_ORDERS[0];
    setActiveOrder(a042);
    setCart([]);
    setIsOffline(false);
    localStorage.removeItem('aight_cafe_orders_v2');
    localStorage.removeItem(STORAGE_CART_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_TOKEN_KEY);
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
        publicQueue,
        isStaffLoggedIn,
        staffUser,
        isStaffAuthChecking,
        loginStaff,
        logoutStaff,
        isOffline,
        setIsOffline,
        toggleOffline,
        resetDemoData,
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
