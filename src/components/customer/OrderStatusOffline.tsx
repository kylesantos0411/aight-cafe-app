import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import type { Order } from '../../types/cafe';
import { WifiOff, RefreshCw, ArrowLeft, Clock } from 'lucide-react';

export const OrderStatusOffline: React.FC = () => {
  const { activeOrder, setCustomerScreen, setIsOffline } = useCafe();
  const [isRetrying, setIsRetrying] = useState(false);

  const defaultOrder: Order = {
    id: 'ord_101',
    requestReference: 'R-8F2',
    code: 'A042',
    privateToken: 'token_sample_alex_a042',
    customerName: 'Kyle',
    orderType: 'takeout',
    items: [
      { id: '1', menuItemId: 'm1', name: 'Iced Latte', price: 180, quantity: 1, image: '', size: 'Large', milk: 'Oat milk' },
      { id: '2', menuItemId: 'm2', name: 'Chocolate Cookie', price: 85, quantity: 1, image: '' },
    ],
    subtotal: 265,
    totalAmount: 265,
    paymentMethod: 'Card',
    paymentStatus: 'verified',
    status: 'preparing',
    createdAt: new Date().toISOString(),
  };

  const order = activeOrder || defaultOrder;

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setIsOffline(false);
      setCustomerScreen('status-ready');
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#FAF8F5] text-[#241A15] p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE3DA]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomerScreen('menu')}
            className="p-1.5 -ml-1.5 text-[#5C4A3E] hover:text-[#241A15] transition-colors rounded-full"
            title="Back to menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="font-display font-bold tracking-tight text-xl text-[#241A15]">aight.</span>
            <span className="text-xs font-medium text-[#7D6B5E] ml-1.5 tracking-wide">CAFE</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold border border-amber-200">
          <WifiOff className="w-3.5 h-3.5" />
          Offline mode
        </div>
      </div>

      {/* Top Offline Notification Banner */}
      <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
        <WifiOff className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">You're offline.</span> We'll sync with the barista when you reconnect. You can still pick up your order with this ticket.
        </p>
      </div>

      {/* Main Status Headline */}
      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#241A15]">
          Your order is still yours.
        </h1>
        <p className="text-xs text-[#7A695C] mt-1.5 max-w-xs mx-auto leading-relaxed">
          We need to renew signal. We can't refresh for new updates right now, but here is your cached ticket:
        </p>
      </div>

      {/* Large Offline Token Code Box */}
      <div className="mt-5 p-6 bg-white border border-[#E4DCCE] rounded-3xl text-center shadow-xs">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8A7667]">Cached Token</span>
        <div className="text-6xl font-black tracking-tight my-2 font-display text-[#241812]">
          {order.code}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          Preparing in queue
        </div>
      </div>

      {/* Helper Guidance */}
      <div className="mt-4 p-4 bg-[#F2ECE3] rounded-2xl text-xs text-[#6B5A4E] leading-relaxed">
        <p className="font-medium text-[#241A15] mb-1">Pick up tips while offline:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Show this screen number to the barista at the bar.</li>
          <li>Your name ({order.customerName}) is already received on the bar terminal.</li>
        </ul>
      </div>

      {/* Retry connection button */}
      <div className="mt-auto pt-6 space-y-2.5">
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full py-3.5 bg-[#241812] hover:bg-[#38261D] text-[#FAF8F5] rounded-2xl font-semibold text-sm transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm disabled:opacity-75"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Reconnecting to Aight Cafe...' : 'Retry connection'}
        </button>

        <button
          onClick={() => {
            setIsOffline(false);
            setCustomerScreen('menu');
          }}
          className="w-full py-2.5 text-center text-xs font-medium text-[#7D6B5E] hover:text-[#241A15]"
        >
          Browse menu offline
        </button>
      </div>
    </div>
  );
};
