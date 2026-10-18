import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { menuService } from '../services/menuService';
import { nfcAnalyticsService } from '../services/nfcAnalyticsService';
import type { Order, CartItem, CustomerUser } from '../types/cafe';

export const ReorderView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, clearCart } = useCafe();

  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // Check authentication & load history
  const loadData = useCallback(async () => {
    setLoading(true);
    const source = searchParams.get('source') || 'nfc';
    nfcAnalyticsService.logTap('reorder', source === 'qr' ? 'qr' : 'nfc', window.location.pathname);

    try {
      const currCustomer = await authService.getCustomerSession();
      setCustomer(currCustomer);

      if (currCustomer) {
        const history = await orderService.getCustomerOrders(currCustomer.id);
        setOrders(history.filter((o: Order) => o.items && o.items.length > 0));
      } else {
        // Fallback: check device local storage for recent guest order
        const recentOrders = await orderService.getAllOrders();
        setOrders(recentOrders.slice(0, 3));
      }
    } catch (err) {
      console.warn('Failed to load reorder data:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle reorder action with authoritative revalidation
  const handleReorder = async (pastOrder: Order) => {
    setReorderingId(pastOrder.id);
    setReorderNotice(null);

    try {
      // Re-fetch latest live menu stock from server
      const freshCatalog = await menuService.getAllProducts();
      const freshAvailableMap = new Map(freshCatalog.map(p => [p.id, p.isAvailable !== false]));
      const freshPricesMap = new Map(freshCatalog.map(p => [p.id, p.price]));

      const validItemsToAdd: CartItem[] = [];
      const unavailableNames: string[] = [];

      for (const item of pastOrder.items) {
        // Find in catalog by ID or name
        const product = freshCatalog.find(p => p.id === item.menuItemId || p.name.toLowerCase() === item.name.toLowerCase());

        if (!product || freshAvailableMap.get(product.id) === false) {
          unavailableNames.push(item.name);
          continue;
        }

        // Restore item with current authoritative pricing
        const currentPrice = freshPricesMap.get(product.id) ?? item.price;
        validItemsToAdd.push({
          ...item,
          menuItemId: product.id,
          price: currentPrice,
          id: `reorder_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        });
      }

      if (validItemsToAdd.length === 0) {
        setReorderNotice(`All items in order #${pastOrder.code} are currently out of stock. Please browse the live menu.`);
        setReorderingId(null);
        return;
      }

      // Add to cart
      clearCart();
      validItemsToAdd.forEach(it => addToCart(it));

      if (unavailableNames.length > 0) {
        // Give customer clear warning
        setReorderNotice(
          `Added available items to your cart. Note: ${unavailableNames.join(', ')} is currently sold out and was omitted.`
        );
      }

      // Navigate to cart for customer confirmation
      setTimeout(() => {
        navigate('/cart');
      }, unavailableNames.length > 0 ? 1400 : 300);

    } catch (err: any) {
      setReorderNotice(err.message || 'Failed to revalidate items. Please try ordering from the menu.');
      setReorderingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans flex flex-col selection:bg-[#221611] selection:text-[#FAF8F5]">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-5 md:py-8 flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b border-[#ECE5DC]">
          <Link to="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <span className="font-extrabold text-2xl tracking-tight text-[#221611]">aight .</span>
            <span className="text-[10px] font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
              CAFE
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2.5 py-1 rounded-full">
              ⚡ Tap to Reorder
            </span>
          </div>
        </header>

        {/* Title */}
        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#221611] tracking-tight">
            Order your usual.
          </h1>
          <p className="text-xs sm:text-sm text-[#7A695C] mt-1.5 leading-relaxed">
            Reorder your favorites in 1 tap. Stock and prices are checked in real time.
          </p>
        </div>

        {/* Reorder Notification Alert */}
        {reorderNotice && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-start gap-2.5">
            <span className="text-base">ℹ️</span>
            <div className="leading-relaxed">{reorderNotice}</div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#8C7A6D]">Checking your recent orders...</div>
        ) : (
          <div className="mt-6 flex-1 flex flex-col space-y-4">
            {/* If unauthenticated notice banner */}
            {!customer && (
              <div className="p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs flex items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="font-bold text-[#221611]">Have an Aight Cafe account?</div>
                  <p className="text-[11px] text-[#69584B] mt-0.5">
                    Sign in to see your complete order history and saved drinks.
                  </p>
                </div>
                <Link
                  to="/login?redirect=/reorder"
                  className="px-3.5 py-2 bg-[#221611] hover:bg-[#3D2D23] text-white rounded-xl font-bold text-xs whitespace-nowrap transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}

            {/* Orders List */}
            {orders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#ECE5DC] space-y-3 my-auto">
                <div className="text-3xl">☕</div>
                <h3 className="font-bold text-sm text-[#221611]">No previous orders found</h3>
                <p className="text-xs text-[#7A695C] max-w-sm mx-auto leading-relaxed">
                  Start fresh with today's handcrafted drinks and bakes at Silangan, San Mateo, Rizal.
                </p>
                <button
                  onClick={() => navigate('/menu')}
                  className="mt-3 px-6 py-3 bg-[#221611] hover:bg-[#3D2D23] text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
                >
                  Browse Menu & Order
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="text-xs font-bold text-[#7A695C] uppercase tracking-wider px-1">
                  {customer ? 'Your Past Orders' : 'Recent Orders on this Device'}
                </div>

                {orders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-[#ECE5DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#DFD6CC] transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-[#F2EDE4] text-[#221611] px-2 py-0.5 rounded-md">
                          #{order.code}
                        </span>
                        <span className="text-[11px] text-[#8C7A6D]">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'Past order'}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="text-xs font-semibold text-[#221611] pt-1">
                        {order.items.map(it => `${it.quantity}× ${it.name}`).join(', ')}
                      </div>

                      {/* Customization Details */}
                      <div className="text-[11px] text-[#7A695C]">
                        {order.items
                          .filter(it => it.size || it.milk || it.sweetness)
                          .map(it => [it.size, it.milk, it.sweetness ? `${it.sweetness} sweet` : ''].filter(Boolean).join(' · '))
                          .join(' | ')}
                      </div>

                      <div className="text-xs font-bold text-[#221611] pt-0.5">
                        ₱{order.totalAmount}
                      </div>
                    </div>

                    <button
                      onClick={() => handleReorder(order)}
                      disabled={reorderingId === order.id}
                      className="py-3 px-5 bg-[#523E32] hover:bg-[#3D2D23] active:scale-[0.98] text-[#FAF8F5] rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm whitespace-nowrap self-stretch sm:self-center"
                    >
                      <span>🔄</span>
                      <span>{reorderingId === order.id ? 'Checking stock...' : 'Reorder items'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center text-xs text-[#8C7A6D]">
          <Link to="/" className="hover:underline font-semibold text-[#221611]">
            ← Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
};
