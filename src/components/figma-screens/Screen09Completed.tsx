import React from 'react';
import { useCafe } from '../../context/CafeContext';

interface Props {
  onBackToMenu?: () => void;
}

export const Screen09Completed: React.FC<Props> = ({ onBackToMenu }) => {
  const { activeOrder } = useCafe();
  const orderCode = activeOrder?.code || 'A042';
  const customerName = activeOrder?.customerName || 'Alex';
  const orderTotal = activeOrder?.totalAmount || 265;

  return (
    <div className="w-[390px] min-h-[960px] bg-[#FAF8F5] text-[#221611] rounded-[44px] p-6 flex flex-col shadow-2xl border border-[#EAE3DA] font-sans relative overflow-hidden select-none">
      {/* Device Status Bar */}
      <div className="flex justify-between items-center text-[12px] font-semibold text-[#221611] pb-3 pt-1 px-2">
        <span>9:52</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">●●●</span>
          <div className="w-4 h-2.5 border border-current rounded-xs flex items-center p-0.5">
            <div className="w-full h-full bg-current rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 pt-1">
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
          <span>Collected at 9:52 AM</span>
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
      <div className="mt-auto pt-4 space-y-1.5">
        <button
          onClick={onBackToMenu}
          className="w-full py-3.5 px-6 bg-[#221611] hover:bg-[#36251E] text-white rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>Order again</span>
          <span>☕</span>
        </button>
        <p className="text-[10px] text-center text-[#8C7A6D]">
          See you next time at The Courtyard.
        </p>
      </div>

      {/* Home indicator */}
      <div className="h-4 flex items-center justify-center pt-2">
        <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
      </div>
    </div>
  );
};
