import React from 'react';

interface Props {
  onBackToMenu?: () => void;
}

export const Screen10Cancelled: React.FC<Props> = ({ onBackToMenu }) => {
  return (
    <div className="w-[390px] min-h-[960px] bg-[#FAF8F5] text-[#221611] rounded-[44px] p-6 flex flex-col shadow-2xl border border-[#EAE3DA] font-sans relative overflow-hidden select-none">
      {/* Device Status Bar */}
      <div className="flex justify-between items-center text-[12px] font-semibold text-[#221611] pb-3 pt-1 px-2">
        <span>9:35</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">●●●</span>
          <div className="w-4 h-2.5 border border-current rounded-xs flex items-center p-0.5">
            <div className="w-full h-full bg-current rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 pt-1">
        <button onClick={onBackToMenu} className="text-lg font-bold text-[#221611] p-1 -ml-1">
          ←
        </button>
        <span className="font-bold text-sm text-[#221611]">Order details</span>
        <span className="text-sm font-bold text-[#8C7A6D]">···</span>
      </div>

      {/* Cancelled Pill */}
      <div className="mt-4 flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FCEBE9] text-[#C53A30] rounded-full text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#C53A30]"></span>
          Cancelled
        </div>
      </div>

      {/* Icon Circle */}
      <div className="mt-4 flex justify-center">
        <div className="w-16 h-16 rounded-full bg-[#FCEBE9] flex items-center justify-center text-xl font-bold text-[#C53A30]">
          ✕
        </div>
      </div>

      {/* Two-Line Headline */}
      <div className="mt-4 text-center">
        <h1 className="text-3xl font-black text-[#221611] leading-tight">
          We couldn't make this<br />one.
        </h1>
        <p className="text-xs text-[#7A695C] mt-2 leading-relaxed max-w-[260px] mx-auto">
          The team cancelled your order before preparation.<br />Sorry about that.
        </p>
      </div>

      {/* Alert Card */}
      <div className="mt-5 p-4 bg-[#FBF2EA] rounded-2xl border border-[#F2DECE] text-xs space-y-1">
        <div className="font-bold text-[#A4532B] flex items-center gap-2">
          <span>ⓘ</span>
          Item no longer available
        </div>
        <p className="text-[11px] text-[#7A5B49] leading-relaxed">
          Our espresso machine needed a quick reset. Please ask the team about today's alternatives.
        </p>
      </div>

      {/* Receipt Card */}
      <div className="mt-4 p-4 bg-white rounded-2xl border border-[#ECE5DC] text-xs space-y-2.5 shadow-xs">
        <div className="flex justify-between items-center text-[#6E5D50]">
          <span>Order</span>
          <span className="font-mono font-bold text-[#221611]">A037</span>
        </div>
        <div className="flex justify-between items-center text-[#6E5D50]">
          <span>Cancelled</span>
          <span className="font-medium text-[#221611]">Today, 9:35 AM</span>
        </div>

        <div className="pt-2 border-t border-[#F2ECE3] flex justify-between items-start">
          <div className="flex items-start gap-2.5">
            <img
              src="/figma-assets/iced-americano.jpg"
              alt="Iced americano"
              className="w-10 h-10 rounded-lg object-cover bg-[#EAE3DA]"
            />
            <div>
              <p className="font-bold text-[#221611]">1 × Iced americano</p>
              <p className="text-[10px] text-[#7A695C]">Regular · 0% sweet</p>
            </div>
          </div>
          <span className="font-bold text-[#221611]">₱110</span>
        </div>

        <div className="pt-2 border-t border-[#F2ECE3] flex justify-between items-center">
          <span className="font-black text-sm text-[#221611]">Amount due</span>
          <span className="text-base font-black text-[#221611]">₱0</span>
        </div>
      </div>

      <p className="text-[11px] text-[#8C7A6D] text-center mt-3 leading-relaxed px-4">
        No cash was collected. Your cancelled number won't be called for pickup.
      </p>

      {/* Bottom Sticky Button */}
      <div className="mt-auto pt-4">
        <button
          onClick={onBackToMenu}
          className="w-full py-3.5 px-6 bg-[#523E32] hover:bg-[#3D2D23] text-[#FAF8F5] rounded-2xl font-bold text-xs transition-colors flex items-center justify-center shadow-lg shadow-black/10"
        >
          Back to the menu
        </button>
      </div>

      {/* Home indicator */}
      <div className="h-4 flex items-center justify-center pt-2">
        <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
      </div>
    </div>
  );
};
