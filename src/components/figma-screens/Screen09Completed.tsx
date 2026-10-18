import React from 'react';
import { useCafe } from '../../context/CafeContext';
import type { Order } from '../../types/cafe';

interface Props {
  order?: Order;
  onBackToMenu?: () => void;
}

export const Screen09Completed: React.FC<Props> = ({ order, onBackToMenu }) => {
  const { activeOrder } = useCafe();
  const effectiveOrder = order || activeOrder;
  const orderCode = effectiveOrder?.queueNumber || effectiveOrder?.code || 'A042';
  const customerName = effectiveOrder?.customerName || 'Friend';
  const orderTotal = effectiveOrder?.totalAmount || 265;
  const completedTime = effectiveOrder?.completedAt
    ? new Date(effectiveOrder.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  return (
    <div className="w-full max-w-xl mx-auto bg-[#FAF8F5] text-[#221611] rounded-3xl p-6 sm:p-8 flex flex-col shadow-xs border border-[#EAE3DA] font-sans relative select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ECE5DC]">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-2xl tracking-tight text-[#221611]">aight .</span>
          <span className="text-[10px] font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
            CAFE
          </span>
        </div>
        <span className="text-xs font-semibold text-[#5E4D40]">Your order</span>
      </div>

      {/* Completed Pill */}
      <div className="mt-4 flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F3EB] text-[#246B3E] rounded-full text-[11px] font-bold border border-[#D2E7D7]">
          <span className="w-2 h-2 rounded-full bg-[#246B3E]"></span>
          Completed
        </div>
      </div>

      {/* Two-Line Headline */}
      <div className="mt-4 text-center">
        <h1 className="text-3xl font-black text-[#221611] leading-tight">
          Enjoy your aight<br />moment.
        </h1>
        <p className="text-xs text-[#7A695C] mt-2 leading-relaxed max-w-[260px] mx-auto">
          Your order has been collected.<br />Thanks for stopping by, {customerName}.
        </p>
      </div>

      {/* White Code Box */}
      <div className="mt-5 p-5 bg-white rounded-3xl border border-[#ECE5DC] text-center shadow-xs">
        <span className="text-[10px] uppercase tracking-widest text-[#9A877A] font-bold">
          YOUR PICKUP NUMBER
        </span>
        <div className="text-6xl font-black tracking-tight my-2 font-mono text-[#221611]">
          {orderCode}
        </div>
        <div className="text-xs text-[#6E5D50] flex items-center justify-center gap-1">
          <span>✓</span>
          <span>Collected at {completedTime}</span>
        </div>
      </div>

      {/* Verified Cash Box */}
      <div className="mt-4 p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs space-y-1">
        <div className="font-bold text-[#221611] flex items-center gap-1.5">
          <span>✓</span>
          <span>Paid ₱{orderTotal} in cash</span>
        </div>
        <p className="text-[11px] text-[#69584B]">
          Verified by the Aight team at pickup.
        </p>
      </div>

      {/* Feedback / Star Card */}
      <div className="mt-4 p-5 bg-white rounded-3xl border border-[#ECE5DC] text-center shadow-xs space-y-3">
        <div className="font-bold text-sm text-[#221611]">How was your coffee?</div>
        <div className="flex justify-center gap-3 text-2xl text-[#CFC3B5] cursor-pointer">
          <span className="hover:text-amber-500 transition-colors">★</span>
          <span className="hover:text-amber-500 transition-colors">★</span>
          <span className="hover:text-amber-500 transition-colors">★</span>
          <span className="hover:text-amber-500 transition-colors">★</span>
          <span className="hover:text-amber-500 transition-colors">★</span>
        </div>
        <p className="text-[10px] text-[#8C7A6D]">Tap a star to let the team know</p>
      </div>

      {/* Bottom Sticky Button */}
      <div className="mt-8 pt-4 space-y-2">
        <button
          onClick={onBackToMenu}
          className="w-full py-4 px-6 bg-[#221611] hover:bg-[#36251E] text-white rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <span>Order again</span>
          <span>☕</span>
        </button>
        <p className="text-xs text-center text-[#8C7A6D]">
          See you next time at Silangan, San Mateo, Rizal.
        </p>
      </div>
    </div>
  );
};
