import React from 'react';
import { useCafe } from '../../context/CafeContext';
import type { Order } from '../../types/cafe';
import { XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export const OrderStatusCancelled: React.FC = () => {
  const { setCustomerScreen, orders } = useCafe();

  const defaultCancelledOrder: Order = {
    id: 'ord_108',
    requestReference: 'R-6B3',
    code: 'A037',
    privateToken: 'token_sample_james_a037',
    customerName: 'Dan',
    orderType: 'takeout',
    items: [
      { id: '1', menuItemId: 'm3', name: 'Iced Americano', price: 140, quantity: 1, image: '', size: 'Large', sweetness: 'Less sweet' },
    ],
    subtotal: 140,
    totalAmount: 140,
    paymentMethod: 'Card',
    paymentStatus: 'refunded',
    status: 'cancelled',
    cancellationReason: 'Espresso machine maintenance calibration. Customer notified.',
    createdAt: new Date().toISOString(),
  };

  const cancelledOrder = orders.find(o => o.code === 'A037') || defaultCancelledOrder;

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
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Cancelled
        </div>
      </div>

      {/* Cancelled Icon & Headline */}
      <div className="mt-8 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-red-100/70 border border-red-200 flex items-center justify-center text-red-600 mb-3 shadow-xs">
          <XCircle className="w-8 h-8 stroke-[1.8]" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-[#8A7667] uppercase">Order {cancelledOrder.code}</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1 text-[#241A15]">
          We couldn't make this one.
        </h1>
        <p className="text-xs text-[#7A695C] mt-1.5 max-w-xs leading-relaxed">
          The team reviewed your order before preparation. We're very sorry about this inconvenience.
        </p>
      </div>

      {/* Reason Card */}
      <div className="mt-6 p-4 bg-[#F7F1EB] rounded-2xl border border-[#E9DFD4] flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#8A5A36] shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-semibold text-[#3D291D]">Item currently unavailable</p>
          <p className="text-[#6E594C] mt-1 leading-relaxed">
            {cancelledOrder.cancellationReason ||
              'Our espresso machine was undergoing quick calibration. Please ask our barista about today’s alternatives.'}
          </p>
        </div>
      </div>

      {/* Cancelled Order Item List */}
      <div className="mt-4 bg-white rounded-2xl p-4 border border-[#ECE5DC] shadow-xs">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#F0EAE1]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7667]">Cancelled Items</span>
          <span className="text-xs text-[#8A7667]">Order {cancelledOrder.code}</span>
        </div>

        <div className="divide-y divide-[#F5EFE8]">
          {cancelledOrder.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-start text-xs">
              <div>
                <p className="font-semibold text-[#241A15] line-through text-opacity-60">
                  {item.quantity}x {item.name}
                </p>
                {item.size && (
                  <p className="text-[11px] text-[#7A695C] mt-0.5">
                    {item.size} {item.sweetness ? `· ${item.sweetness}` : ''}
                  </p>
                )}
              </div>
              <span className="font-semibold text-[#8A7667] line-through">₱{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 mt-1 border-t border-[#F0EAE1] flex justify-between items-center text-xs">
          <div>
            <span className="font-semibold text-[#241A15]">Amount Due</span>
            <p className="text-[10px] text-[#7A695C]">No charges were processed to your account</p>
          </div>
          <span className="text-lg font-bold text-emerald-700 font-display">₱0</span>
        </div>
      </div>

      {/* Bottom Button */}
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
