import React from 'react';

export const Frame2CompletedOrder: React.FC<{ onBackToMenu?: () => void }> = ({ onBackToMenu }) => {
  return (
    <div className="w-[340px] min-h-[680px] bg-[#FAF8F5] text-[#221611] rounded-[36px] p-5 flex flex-col shadow-xl border border-[#ECE5DC] relative overflow-hidden font-sans">
      {/* Status Bar */}
      <div className="flex justify-between items-center text-[11px] font-semibold text-[#221611] pb-2 pt-1 px-1">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 opacity-80">
          <div className="w-3.5 h-2 border border-current rounded-xs"></div>
        </div>
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 pt-1 border-b border-[#ECE5DC]">
        <div className="flex items-center gap-1">
          <span className="font-bold text-sm tracking-tight">aight.</span>
          <span className="text-[10px] text-[#8C7A6D] ml-0.5">· cafe</span>
        </div>
        <span className="text-xs font-semibold text-[#5E4D40]">Your order</span>
      </div>

      {/* Completed Pill Badge */}
      <div className="mt-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F3EB] text-[#246B3E] rounded-full text-[10px] font-bold tracking-wider uppercase border border-[#D2E7D7]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#246B3E]"></span>
          Completed
        </div>
      </div>

      {/* Two-Line Headline */}
      <div className="mt-2 text-center">
        <h1 className="text-2xl font-black tracking-tight text-[#221611] leading-tight">
          Enjoy your aight<br />moment.
        </h1>
        <p className="text-[11px] text-[#7A695C] mt-1.5 leading-snug">
          Your order has been activated.<br />Thanks for stopping by, Kyle.
        </p>
      </div>

      {/* YOUR PICKUP NUMBER Box */}
      <div className="mt-4 bg-white rounded-2xl p-4 text-center border border-[#E8DFD5] shadow-xs">
        <span className="text-[9px] uppercase tracking-widest text-[#9A877A] font-semibold">
          YOUR PICKUP NUMBER
        </span>
        <div className="text-5xl font-black tracking-tight my-1 text-[#221611] font-mono">
          A042
        </div>
        <p className="text-[10px] text-[#8C7A6D]">at Counter 02 or pickup counter</p>
      </div>

      {/* Card Payment Verified Callout Box */}
      <div className="mt-3 p-3 bg-[#F2EDE4] rounded-xl border border-[#E5DDD2] text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#221611]">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] inline-flex items-center justify-center">✓</span>
          Card payment verified
        </div>
        <p className="text-[10px] text-[#69584B] mt-0.5">
          P265 payment at 9:41 AM. Nothing left to pay.
        </p>
      </div>

      {/* Order Summary Box */}
      <div className="mt-3 bg-white rounded-2xl p-3.5 border border-[#ECE5DC] space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-[#221611] pb-1.5 border-b border-[#F4EFEA]">
          <span>Your order · A042</span>
          <span className="text-[10px] text-[#8C7A6D] font-normal">2 items</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between text-[#221611]">
            <div>
              <span className="font-semibold">1x Iced Latte</span>
              <span className="block text-[10px] text-[#8C7A6D]">Large · Oat milk · 50% sweet · Extra ice</span>
            </div>
            <span className="font-semibold">P180</span>
          </div>

          <div className="flex justify-between text-[#221611]">
            <div>
              <span className="font-semibold">1x Chocolate cookie</span>
            </div>
            <span className="font-semibold">P85</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#F4EFEA] flex justify-between items-center text-xs font-bold text-[#221611]">
          <span>Total paid</span>
          <span>P265</span>
        </div>
        <p className="text-[9px] text-[#8C7A6D]">Card payment · Visa Courtyard</p>
      </div>

      {/* Bottom Button */}
      <div className="mt-auto pt-3">
        <button
          onClick={onBackToMenu}
          className="w-full py-3 bg-[#221611] hover:bg-[#36251E] text-[#FAF8F5] rounded-full font-semibold text-xs transition-colors"
        >
          Back to the menu
        </button>
      </div>

      {/* Home indicator */}
      <div className="h-3 flex items-center justify-center pt-2">
        <div className="w-24 h-1 bg-[#221611]/25 rounded-full"></div>
      </div>
    </div>
  );
};
