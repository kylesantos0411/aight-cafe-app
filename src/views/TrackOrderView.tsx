import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { nfcAnalyticsService } from '../services/nfcAnalyticsService';

export const TrackOrderView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeOrder } = useCafe();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const checkActiveOrder = useCallback(async () => {
    setLoading(true);
    const source = searchParams.get('source') || 'nfc';
    nfcAnalyticsService.logTap('track', source === 'qr' ? 'qr' : 'nfc', window.location.pathname);

    // 1. Check if token query param was passed directly
    const directToken = searchParams.get('token');
    if (directToken) {
      navigate(`/order/${directToken}`, { replace: true });
      return;
    }

    // 2. Check if context has an active order with privateToken
    if (activeOrder && activeOrder.privateToken && ['pending', 'confirmed', 'preparing', 'ready'].includes(activeOrder.status)) {
      navigate(`/order/${activeOrder.privateToken}`, { replace: true });
      return;
    }

    // 3. Check customer authenticated session for live active orders
    try {
      const customer = await authService.getCustomerSession();
      if (customer) {
        const liveOrder = await orderService.getActiveCustomerOrder(customer.id);
        if (liveOrder && liveOrder.privateToken) {
          navigate(`/order/${liveOrder.privateToken}`, { replace: true });
          return;
        }
      }

      // 4. Check localStorage active order token
      const storedToken = localStorage.getItem('aight_cafe_active_order_token');
      if (storedToken) {
        const storedOrder = await orderService.getOrderByPrivateToken(storedToken);
        if (storedOrder && ['pending', 'confirmed', 'preparing', 'ready'].includes(storedOrder.status)) {
          navigate(`/order/${storedOrder.privateToken}`, { replace: true });
          return;
        }
      }
    } catch (err) {
      console.warn('Track auto-lookup error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams, activeOrder, navigate]);

  useEffect(() => {
    checkActiveOrder();
  }, [checkActiveOrder]);

  const handleManualLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const found = await orderService.findOrderForTracking(searchQuery.trim());
      if (found && found.privateToken) {
        navigate(`/order/${found.privateToken}`);
      } else {
        setSearchError(`No order matching "${searchQuery}" was found. Please check your pickup ticket or code.`);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Lookup failed. Please verify your reference.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans flex flex-col selection:bg-[#221611] selection:text-[#FAF8F5]">
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-6 md:py-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b border-[#ECE5DC]">
          <Link to="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <span className="font-extrabold text-2xl tracking-tight text-[#221611]">aight .</span>
            <span className="text-[10px] font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
              CAFE
            </span>
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2.5 py-1 rounded-full">
            📍 Pickup Counter
          </span>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-3 border-[#221611] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#7A695C] mt-4 font-semibold">
              Connecting to Aight live queue...
            </p>
          </div>
        ) : (
          <div className="mt-8 flex-1 flex flex-col justify-between">
            <div>
              {/* Stall Location Banner */}
              <div className="p-4 bg-white rounded-3xl border border-[#ECE5DC] shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F2EDE4] flex items-center justify-center text-lg">
                  🎯
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#221611]">Silangan, San Mateo, Rizal Pickup Station</h3>
                  <p className="text-[11px] text-[#7A695C]">
                    Check your live order status, queue number, and barista prep.
                  </p>
                </div>
              </div>

              {/* No Active Order Notice */}
              <div className="mt-6 p-6 sm:p-7 bg-white rounded-3xl border border-[#ECE5DC] shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F2EDE4] flex items-center justify-center text-2xl">
                  📋
                </div>

                <div>
                  <h2 className="text-lg font-black text-[#221611]">No active order on this device</h2>
                  <p className="text-xs text-[#7A695C] mt-1.5 leading-relaxed">
                    If you ordered on another phone or as a walk-in guest, enter your 4-digit pickup code or order reference below:
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleManualLookup} className="space-y-3 pt-2">
                  <div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="e.g. A042, R-8F2B, or order token"
                      className="w-full px-4 py-3.5 bg-[#FAF8F5] rounded-2xl border border-[#DFD6CC] text-xs font-semibold text-[#221611] focus:outline-hidden focus:ring-2 focus:ring-[#221611] uppercase tracking-wider"
                    />
                  </div>

                  {searchError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px]">
                      {searchError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full py-3.5 bg-[#221611] hover:bg-[#3D2D23] text-white rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <span>🔍</span>
                    <span>{isSearching ? 'Finding order...' : 'Track My Order'}</span>
                  </button>
                </form>
              </div>

              {/* Helpful options */}
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <Link
                  to="/menu"
                  className="p-4 bg-white rounded-2xl border border-[#ECE5DC] hover:border-[#DFD6CC] transition-all text-center flex flex-col items-center justify-center gap-1 group shadow-2xs"
                >
                  <span className="text-lg">☕</span>
                  <span className="font-bold text-[#221611] group-hover:underline">Start New Order</span>
                  <span className="text-[10px] text-[#8C7A6D]">Browse menu</span>
                </Link>

                <Link
                  to="/login?redirect=/track"
                  className="p-4 bg-white rounded-2xl border border-[#ECE5DC] hover:border-[#DFD6CC] transition-all text-center flex flex-col items-center justify-center gap-1 group shadow-2xs"
                >
                  <span className="text-lg">👤</span>
                  <span className="font-bold text-[#221611] group-hover:underline">Sign In</span>
                  <span className="text-[10px] text-[#8C7A6D]">View all orders</span>
                </Link>
              </div>
            </div>

            {/* Public Queue Link */}
            <div className="pt-8 text-center text-xs text-[#8C7A6D] space-x-2">
              <span>Waiting at the stall?</span>
              <Link to="/queue" className="text-[#221611] font-bold hover:underline">
                View Stall TV Screen →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
