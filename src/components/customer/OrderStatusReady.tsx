import React from 'react';
import { useCafe } from '../../context/CafeContext';
import type { Order } from '../../types/cafe';
import { CheckCircle2, Store, Clock, ArrowLeft } from 'lucide-react';

export const OrderStatusReady: React.FC = () => {
  const { activeOrder, setCustomerScreen, updateOrderStatus } = useCafe();

  const defaultOrder: Order = {
    id: 'ord_101',
    requestReference: 'R-8F2',
    code: 'A042',
    privateToken: 'token_sample_alex_a042',
    customerName: 'Kyle',
    orderType: 'takeout',
    items: [
      { id: '1', menuItemId: 'm1', name: 'Iced Latte', price: 180, quantity: 1, image: '', size: 'Large', milk: 'Oat milk', sweetness: '50% sweet' },
      { id: '2', menuItemId: 'm2', name: 'Chocolate Cookie', price: 85, quantity: 1, image: '' },
    ],
    subtotal: 265,
    totalAmount: 265,
    paymentMethod: 'Card',
    paymentStatus: 'verified',
    status: 'ready',
    createdAt: new Date().toISOString(),
  };

  const order = activeOrder || defaultOrder;

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
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EAE3DA]/60 rounded-full text-xs font-semibold text-[#5C4A3E]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Ready for pickup
        </div>
      </div>

      {/* Main Status Headline */}
      <div className="mt-5 text-center">
        <p className="text-sm font-semibold tracking-wider text-[#8A7667] uppercase">Pickup · Order {order.code}</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1 text-[#241A15]">stuff is ready.</h1>
        <p className="text-xs text-[#7A695C] mt-1">Please head to the pickup counter with your number</p>
      </div>

      {/* Large Code Badge Display Card (matching Figma dark card 042) */}
      <div className="mt-5 relative overflow-hidden bg-[#241812] text-white rounded-3xl p-6 text-center shadow-lg shadow-black/5">
        <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-[#E6D7CD]/75">Your pickup token</div>
        <div className="text-6xl font-black tracking-tight my-2 font-display text-[#FAF7F2]">
          {order.code}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] text-[#E7DDD5] font-medium">
          <Store className="w-3.5 h-3.5 text-emerald-400" />
          Counter 1 · Present screen to barista
        </div>
      </div>

      {/* Counter instructions info block */}
      <div className="mt-4 p-3.5 bg-[#F0EAE1] rounded-2xl border border-[#E4DCCE] flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs text-[#5C4A3E]">
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <p className="font-semibold text-[#241A15]">Freshly prepared right now</p>
          <p className="text-[#6E5D50] mt-0.5 leading-relaxed">
            Prepared with fresh beans and served chilled. Best enjoyed immediately!
          </p>
        </div>
      </div>

      {/* Order Items Breakdown */}
      <div className="mt-5 bg-white rounded-2xl p-4 border border-[#ECE5DC] shadow-xs">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#F0EAE1]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7667]">Order Details</span>
          <span className="text-xs font-medium text-[#7D6B5E]">{order.items.length} items</span>
        </div>

        <div className="divide-y divide-[#F5EFE8]">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-start text-xs">
              <div>
                <p className="font-semibold text-[#241A15]">
                  {item.quantity}x {item.name}
                </p>
                {(item.size || item.milk || item.sweetness) && (
                  <p className="text-[11px] text-[#7A695C] mt-0.5">
                    {[item.size, item.milk, item.sweetness].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <span className="font-semibold text-[#241A15]">₱{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 mt-1 border-t border-[#F0EAE1] flex justify-between items-center text-xs">
          <span className="text-[#6E5D50]">Total Paid ({order.paymentMethod})</span>
          <span className="text-base font-bold text-[#241A15] font-display">₱{order.totalAmount}</span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="mt-auto pt-5 space-y-2.5">
        <button
          onClick={() => {
            if (activeOrder) {
              updateOrderStatus(activeOrder.id, 'completed');
            }
            setCustomerScreen('status-completed');
          }}
          className="w-full py-3.5 bg-[#241812] hover:bg-[#38261D] text-[#FAF8F5] rounded-2xl font-semibold text-sm transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          I got my order (Complete)
        </button>

        <button
          onClick={() => setCustomerScreen('menu')}
          className="w-full py-3 bg-[#EAE3DA]/70 hover:bg-[#E2D9CE] text-[#4A3B30] rounded-2xl font-semibold text-xs transition-colors"
        >
          Back to the menu
        </button>
      </div>
    </div>
  );
};
