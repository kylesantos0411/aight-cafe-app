import React from 'react';

export const Frame3CancelledOrder: React.FC<{ onBackToMenu?: () => void }> = ({ onBackToMenu }) => {
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
        <button onClick={onBackToMenu} className="text-xs text-[#5E4D40] hover:text-[#221611] flex items-center gap-1">
          <span>‹</span>
          <span>Order details</span>
        </button>
        <div className="w-5"></div>
      </div>

      {/* Cancelled Icon Badge */}
      <div className="mt-4 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-[#FCEBE9] flex items-center justify-center text-[#C53A30] text-lg font-bold mb-2">
          ✕
        </div>
        <div className="inline-flex items-center px-2.5 py-0.5 bg-[#FCEBE9] text-[#C53A30] rounded-full text-[9px] font-bold tracking-wider uppercase">
          Cancelled
        </div>
      </div>

      {/* Two-Line Headline */}
      <div className="mt-2 text-center">
        <h1 className="text-2xl font-black tracking-tight text-[#221611] leading-tight">
          We couldn't make this<br />one.
        </h1>
        <p className="text-[11px] text-[#7A695C] mt-1.5 leading-snug">
          The team reviewed your order before preparation.<br />We're sorry for this delay.
        </p>
      </div>

      {/* Item No Longer Available Alert Card */}
      <div className="mt-4 p-3.5 bg-[#FBF2EA] rounded-xl border border-[#F2DECE] text-[11px] leading-relaxed">
        <div className="font-bold text-[#A4532B] flex items-center gap-1.5">
          <span>⚠</span>
          Item no longer available
        </div>
        <p className="text-[10px] text-[#7A5B49] mt-0.5 leading-normal">
          Our espresso machine was undergoing quick calibration. Please ask the team about today's alternatives.
        </p>
      </div>

      {/* Details Box */}
      <div className="mt-3 bg-white rounded-2xl p-3.5 border border-[#ECE5DC] space-y-2">
        <div className="flex justify-between items-center text-[11px] text-[#69584B]">
          <span>Order</span>
          <span className="font-bold text-[#221611]">A037</span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-[#69584B]">
          <span>Cancelled</span>
          <span className="font-medium text-[#221611]">Today, 9:35 AM</span>
        </div>

        <div className="pt-2 border-t border-[#F4EFEA]">
          <div className="flex justify-between text-[11px] text-[#221611]">
            <div>
              <span className="font-semibold">1x Iced Americano</span>
              <span className="block text-[10px] text-[#8C7A6D]">Large · Less sweet</span>
            </div>
            <span className="font-semibold">P140</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#F4EFEA] flex justify-between items-center text-xs font-bold text-[#221611]">
          <span>Amount due</span>
          <span>P0</span>
        </div>
        <p className="text-[9px] text-[#8C7A6D] leading-tight">
          No payment was collected. Your unsettled receipt will be voided for this visit.
        </p>
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
