import React from 'react';
import { useCafe } from '../../context/CafeContext';

interface Props {
  onNext?: () => void;
}

export const Screen07Preparing: React.FC<Props> = ({ onNext }) => {
  const { activeOrder } = useCafe();
  const orderCode = activeOrder?.code || 'A042';
  const orderTotal = activeOrder?.totalAmount || 265;

  return (
    <div className="w-[390px] min-h-[960px] bg-[#FAF8F5] text-[#221611] rounded-[44px] p-6 flex flex-col shadow-2xl border border-[#EAE3DA] font-sans relative overflow-hidden select-none">
      {/* Device Status Bar */}
      <div className="flex justify-between items-center text-[12px] font-semibold text-[#221611] pb-3 pt-1 px-2">
        <span>9:42</span>
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

      {/* Preparing Pill */}
      <div className="mt-4 flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF2DE] text-[#8A6715] rounded-full text-[11px] font-bold border border-[#EFE1BA]">
          <span className="w-2 h-2 rounded-full bg-[#8A6715] animate-pulse"></span>
          Preparing
        </div>
      </div>

      {/* Headline */}
      <div className="mt-4 text-center">
        <h1 className="text-3xl font-black text-[#221611]">A little coffee magic.</h1>
        <p className="text-xs text-[#7A695C] mt-2 leading-relaxed max-w-[260px] mx-auto">
          Your order is being poured.<br />Your treats are coming along, too.
        </p>
      </div>

      {/* Code Box */}
      <div className="mt-5 p-5 bg-white rounded-3xl border border-[#ECE5DC] text-center shadow-xs">
        <span className="text-[10px] uppercase tracking-widest text-[#9A877A] font-bold">
          YOUR PICKUP NUMBER
        </span>
        <div className="text-6xl font-black tracking-tight my-2 font-mono text-[#221611]">
          {orderCode}
        </div>
        <div className="text-xs text-[#6E5D50] flex items-center justify-center gap-1">
          <span>☕</span>
          <span>Started at 9:42 AM</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="mt-5 space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <div className="text-[#221611] pb-1.5 border-b-2 border-[#221611]">Confirmed</div>
          <div className="text-[#221611] pb-1.5 border-b-2 border-[#221611]">Preparing</div>
          <div className="text-[#A49588] pb-1.5 border-b-2 border-[#DFD6CC]">Ready</div>
        </div>
        <p className="text-[11px] text-[#7A695C] text-center">
          Watch the stall screen or listen for your number.
        </p>
      </div>

      {/* Payment Reminder */}
      <div className="mt-4 p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs flex justify-between items-center">
        <div>
          <div className="font-bold text-[#221611]">Pay ₱{orderTotal} in cash</div>
          <p className="text-[11px] text-[#69584B] mt-0.5">Please have cash ready at collection.</p>
        </div>
        <span className="text-xl">💵</span>
      </div>

      {/* Location Box */}
      <div className="mt-3 p-4 bg-white rounded-2xl border border-[#ECE5DC] text-xs space-y-1 shadow-xs">
        <div className="font-bold text-[#221611] flex items-center gap-1.5">
          <span>📍</span>
          The Courtyard · Aight stall
        </div>
        <p className="text-[11px] text-[#7A695C]">
          Estimated ready in 3–5 minutes.
        </p>
      </div>

      {/* Bottom Sticky Button */}
      <div className="mt-auto pt-4 space-y-1.5">
        <button
          onClick={onNext}
          className="w-full py-3.5 px-6 bg-[#221611] hover:bg-[#36251E] text-white rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>When ready, click to preview</span>
          <span>→</span>
        </button>
        <p className="text-[10px] text-center text-[#8C7A6D]">
          Auto-updates via Supabase Realtime. Keep this screen open.
        </p>
      </div>

      {/* Home indicator */}
      <div className="h-4 flex items-center justify-center pt-2">
        <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
      </div>
    </div>
  );
};
