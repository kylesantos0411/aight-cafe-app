import React from 'react';

export const Frame1PickupOrder: React.FC = () => {
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

      {/* Headline */}
      <div className="mt-4">
        <p className="text-[11px] text-[#8C7A6D] font-medium">Pickup · Order 042</p>
        <h1 className="text-2xl font-black tracking-tight text-[#221611] mt-0.5">stuff is ready.</h1>
        <p className="text-[11px] text-[#7A695C] mt-0.5">The Aight staff is waiting at the pick-up counter.</p>
      </div>

      {/* Big Dark Card with 042 */}
      <div className="mt-4 bg-[#1E1714] text-white rounded-2xl p-5 text-center shadow-md">
        <div className="text-[10px] uppercase tracking-widest text-[#B5A599] font-medium">Order Number</div>
        <div className="text-6xl font-black tracking-tight my-1 font-mono text-[#FAF8F5]">
          042
        </div>
        <p className="text-[10px] text-[#C2B3A8] mt-1">Pick up at counter. Please present this number.</p>
      </div>

      {/* Instructions Card */}
      <div className="mt-3 p-3 bg-[#F2ECE3] rounded-xl text-[11px] text-[#69584B] leading-relaxed border border-[#E5DDD2]">
        <span className="font-semibold text-[#221611]">Counter instructions:</span> Look for the pick-up display board or present this screen to the barista.
      </div>

      {/* Items Breakdown */}
      <div className="mt-3 bg-white rounded-2xl p-3.5 border border-[#ECE5DC] space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-[#221611] pb-1.5 border-b border-[#F4EFEA]">
          <span>Your items</span>
          <span className="text-[10px] text-[#8C7A6D] font-normal">2 items</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between text-[#221611]">
            <div>
              <span className="font-semibold">1x Iced latte</span>
              <span className="block text-[10px] text-[#8C7A6D]">Large · Oat milk · 50% sweet</span>
            </div>
            <span className="font-semibold">P180</span>
          </div>

          <div className="flex justify-between text-[#221611]">
            <div>
              <span className="font-semibold">1x chocolate cookie</span>
            </div>
            <span className="font-semibold">P85</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#F4EFEA] flex justify-between items-center text-xs font-bold text-[#221611]">
          <span>Total paid</span>
          <span>P265</span>
        </div>
        <p className="text-[9px] text-[#8C7A6D]">Paid at counter · Card verified</p>
      </div>

      {/* Bottom Button */}
      <div className="mt-auto pt-3">
        <button className="w-full py-3 bg-[#221611] hover:bg-[#36251E] text-[#FAF8F5] rounded-full font-semibold text-xs transition-colors">
          Pickup details
        </button>
      </div>

      {/* Home indicator */}
      <div className="h-3 flex items-center justify-center pt-2">
        <div className="w-24 h-1 bg-[#221611]/25 rounded-full"></div>
      </div>
    </div>
  );
};
