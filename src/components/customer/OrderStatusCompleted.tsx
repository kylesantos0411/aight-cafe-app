import React from 'react';
import { useCafe } from '../../context/CafeContext';
import type { Order } from '../../types/cafe';
import { Check, ShieldCheck, ArrowLeft, Coffee } from 'lucide-react';

export const OrderStatusCompleted: React.FC = () => {
  const { activeOrder, setCustomerScreen } = useCafe();

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
    status: 'completed',
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
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          Completed
        </div>
      </div>

      {/* Main Status Headline */}
      <div className="mt-6 text-center">
        <p className="text-xs font-semibold tracking-wider text-[#8A7667] uppercase">Completed · Order {order.code}</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1 text-[#241A15]">
          Enjoy your aight moment.
        </h1>
        <p className="text-xs text-[#7A695C] mt-1 max-w-xs mx-auto leading-relaxed">
          Your order has been completed. Thanks for stopping by{order.customerName ? `, ${order.customerName}` : ''}!
        </p>
      </div>

      {/* Order Token Code Box (matching Figma clean border box A042) */}
      <div className="mt-5 p-6 bg-white border border-[#E4DCCE] rounded-3xl text-center shadow-xs">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8A7667]">Order Reference</span>
        <div className="text-5xl font-black tracking-tight my-1.5 font-display text-[#241812]">
          {order.code}
        </div>
        <div className="text-xs text-[#7A695C] flex items-center justify-center gap-1.5">
          <Coffee className="w-3.5 h-3.5 text-[#8A7667]" />
          Crafted with care by our baristas
        </div>
      </div>

      {/* Payment Verified Green Card */}
      <div className="mt-4 p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <p className="font-semibold text-emerald-950">{order.paymentMethod} payment verified</p>
          <p className="text-emerald-800/90 mt-0.5 leading-relaxed">
            ₱{order.totalAmount} collected and verified by the Aight store team.
          </p>
        </div>
      </div>

      {/* Order Items Breakdown */}
      <div className="mt-4 bg-white rounded-2xl p-4 border border-[#ECE5DC] shadow-xs">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#F0EAE1]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7667]">Receipt</span>
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
          <span className="text-[#6E5D50]">Total Paid</span>
          <span className="text-base font-bold text-[#241A15] font-display">₱{order.totalAmount}</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-auto pt-6">
        <button
          onClick={() => setCustomerScreen('menu')}
          className="w-full py-3.5 bg-[#241812] hover:bg-[#38261D] text-[#FAF8F5] rounded-2xl font-semibold text-sm transition-all duration-150 active:scale-[0.99] shadow-sm"
        >
          Back to the menu
        </button>
      </div>
    </div>
  );
};
