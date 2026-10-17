import React from 'react';
import { useCafe } from '../../context/CafeContext';

interface Props {
  onNext?: () => void;
}

export const Screen06Confirmed: React.FC<Props> = ({ onNext: _onNext }) => {
  const { activeOrder } = useCafe();
  const orderCode = activeOrder?.code || 'A042';
  const orderTotal = activeOrder?.totalAmount || 265;

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

      {/* Confirmed Pill */}
      <div className="mt-4 flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F2EDE4] text-[#69584B] rounded-full text-[11px] font-bold border border-[#E5DDD2]">
          <span className="w-2 h-2 rounded-full bg-[#8A6715]"></span>
          Confirmed
        </div>
      </div>

      {/* Headline */}
      <div className="mt-4 text-center">
        <h1 className="text-3xl font-black text-[#221611]">You're in the queue.</h1>
        <p className="text-xs text-[#7A695C] mt-2 leading-relaxed max-w-[260px] mx-auto">
          The team has accepted your order.<br />We'll start making it shortly.
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
          <span>✓</span>
          <span>Accepted at 9:41 AM</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="mt-5 space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <div className="text-[#221611] pb-1.5 border-b-2 border-[#221611]">Confirmed</div>
          <div className="text-[#A49588] pb-1.5 border-b-2 border-[#DFD6CC]">Preparing</div>
          <div className="text-[#A49588] pb-1.5 border-b-2 border-[#DFD6CC]">Ready</div>
        </div>
        <p className="text-[11px] text-[#7A695C] text-center">
          We'll call this number on the stall display when it's your turn.
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
          Show this screen to the barista when your number is called.
        </p>
      </div>

      {/* Bottom Sticky Button */}
      <div className="mt-8 pt-4 space-y-2">
        <p className="text-xs text-center text-[#8C7A6D]">
          Auto-updates via Supabase Realtime. Keep this screen open.
        </p>
      </div>
    </div>
  );
};
