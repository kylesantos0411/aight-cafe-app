import React from 'react';

interface Props {
  onSelectItem?: () => void;
  onViewCart?: () => void;
}

export const Screen01Menu: React.FC<Props> = ({ onSelectItem, onViewCart }) => {
  return (
    <div className="w-[390px] min-h-[960px] bg-[#FAF8F5] text-[#221611] rounded-[44px] p-6 flex flex-col shadow-2xl border border-[#EAE3DA] font-sans relative overflow-hidden select-none">
      {/* Device Status Bar */}
      <div className="flex justify-between items-center text-[12px] font-semibold text-[#221611] pb-3 pt-1 px-2">
        <span>9:40</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">●●●</span>
          <div className="w-4 h-2.5 border border-current rounded-xs flex items-center p-0.5">
            <div className="w-full h-full bg-current rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-2xl tracking-tight text-[#221611]">aight .</span>
          <span className="text-[10px] font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
            CAFE
          </span>
        </div>
        <div className="w-8 h-8 rounded-full border border-[#DFD6CC] flex items-center justify-center text-[#5C4A3E]">
          <span className="text-sm">👜</span>
        </div>
      </div>

      {/* Status Tags */}
      <div className="flex items-center justify-between mt-1 text-xs font-medium">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ECEAE3] text-[#4A4036] rounded-full text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          Open until 6 PM
        </div>
        <span className="text-[#8C7A6D] text-[11px]">Pickup only</span>
      </div>

      {/* Headline */}
      <div className="mt-6">
        <h1 className="text-3xl font-black tracking-tight text-[#221611] leading-tight">
          Good coffee.<br />Your kind of day.
        </h1>
        <p className="text-xs text-[#7A695C] mt-2 flex items-center gap-1 font-medium">
          <span>📍</span>
          Aight popup · Silangan, San Mateo, Rizal
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-6 mt-6 pb-2 border-b border-[#ECE5DC] text-xs font-semibold">
        <button className="text-[#221611] pb-2 border-b-2 border-[#221611] -mb-2">Coffee</button>
        <button className="text-[#8C7A6D] hover:text-[#221611]">Non-Coffee</button>
        <button className="text-[#8C7A6D] hover:text-[#221611]">Matcha</button>
        <button className="text-[#8C7A6D] hover:text-[#221611]">Pastries</button>
      </div>

      {/* Section 1: Coffee */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#221611]">Coffee</h2>
          <span className="text-[11px] text-[#8C7A6D]">Made to order</span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 1: Iced latte */}
          <div
            onClick={onSelectItem}
            className="bg-white rounded-2xl p-2.5 border border-[#ECE5DC] hover:border-[#CFC3B5] transition-all cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div className="w-full h-32 rounded-xl overflow-hidden bg-[#EAE3DA]">
              <img
                src="/figma-assets/iced-latte.jpg"
                alt="Iced latte"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2.5">
              <h3 className="font-bold text-xs text-[#221611]">Iced latte</h3>
              <p className="text-[10px] text-[#7A695C] mt-0.5 line-clamp-1">Smooth espresso, creamy milk</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-xs text-[#221611]">From ₱140</span>
                <span className="w-5 h-5 rounded-full border border-[#DFD6CC] flex items-center justify-center text-xs text-[#5C4A3E]">
                  +
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Iced americano */}
          <div
            onClick={onSelectItem}
            className="bg-white rounded-2xl p-2.5 border border-[#ECE5DC] hover:border-[#CFC3B5] transition-all cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div className="w-full h-32 rounded-xl overflow-hidden bg-[#EAE3DA]">
              <img
                src="/figma-assets/iced-americano.jpg"
                alt="Iced americano"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2.5">
              <h3 className="font-bold text-xs text-[#221611]">Iced americano</h3>
              <p className="text-[10px] text-[#7A695C] mt-0.5 line-clamp-1">Bold, bright & refreshing</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-xs text-[#221611]">From ₱110</span>
                <span className="w-5 h-5 rounded-full border border-[#DFD6CC] flex items-center justify-center text-xs text-[#5C4A3E]">
                  +
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: A little less coffee */}
      <div className="mt-6">
        <h2 className="text-base font-bold text-[#221611] mb-3">A little less coffee.</h2>
        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 3: Matcha latte */}
          <div
            onClick={onSelectItem}
            className="bg-white rounded-2xl p-2.5 border border-[#ECE5DC] hover:border-[#CFC3B5] transition-all cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div className="w-full h-32 rounded-xl overflow-hidden bg-[#EAE3DA]">
              <img
                src="/figma-assets/matcha-latte.jpg"
                alt="Matcha latte"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2.5">
              <h3 className="font-bold text-xs text-[#221611]">Matcha latte</h3>
              <p className="text-[10px] text-[#7A695C] mt-0.5 line-clamp-1">Matcha · Earthy & mellow</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-xs text-[#221611]">From ₱160</span>
                <span className="w-5 h-5 rounded-full border border-[#DFD6CC] flex items-center justify-center text-xs text-[#5C4A3E]">
                  +
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Iced chocolate */}
          <div
            onClick={onSelectItem}
            className="bg-white rounded-2xl p-2.5 border border-[#ECE5DC] hover:border-[#CFC3B5] transition-all cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div className="w-full h-32 rounded-xl overflow-hidden bg-[#EAE3DA]">
              <img
                src="/figma-assets/iced-chocolate.jpg"
                alt="Iced chocolate"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2.5">
              <h3 className="font-bold text-xs text-[#221611]">Iced chocolate</h3>
              <p className="text-[10px] text-[#7A695C] mt-0.5 line-clamp-1">Non-Coffee · Rich cocoa</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-xs text-[#221611]">From ₱130</span>
                <span className="w-5 h-5 rounded-full border border-[#DFD6CC] flex items-center justify-center text-xs text-[#5C4A3E]">
                  +
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Something on the side */}
      <div className="mt-6">
        <h2 className="text-base font-bold text-[#221611] mb-3">Something on the side.</h2>
        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 5: Brown butter cookie */}
          <div
            onClick={onSelectItem}
            className="bg-white rounded-2xl p-2.5 border border-[#ECE5DC] hover:border-[#CFC3B5] transition-all cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div className="w-full h-32 rounded-xl overflow-hidden bg-[#EAE3DA]">
              <img
                src="/figma-assets/brown-butter-cookie.jpg"
                alt="Brown butter cookie"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2.5">
              <h3 className="font-bold text-xs text-[#221611]">Brown butter cookie</h3>
              <p className="text-[10px] text-[#7A695C] mt-0.5 line-clamp-1">Chocolate chunks, flaky salt</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-xs text-[#221611]">₱85</span>
                <span className="w-5 h-5 rounded-full border border-[#DFD6CC] flex items-center justify-center text-xs text-[#5C4A3E]">
                  +
                </span>
              </div>
            </div>
          </div>

          {/* Card 6: Butter croissant */}
          <div
            onClick={onSelectItem}
            className="bg-white rounded-2xl p-2.5 border border-[#ECE5DC] hover:border-[#CFC3B5] transition-all cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div className="w-full h-32 rounded-xl overflow-hidden bg-[#EAE3DA]">
              <img
                src="/figma-assets/butter-croissant.jpg"
                alt="Butter croissant"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2.5">
              <h3 className="font-bold text-xs text-[#221611]">Butter croissant</h3>
              <p className="text-[10px] text-[#7A695C] mt-0.5 line-clamp-1">Flaky, golden, baked today</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-xs text-[#221611]">₱120</span>
                <span className="w-5 h-5 rounded-full border border-[#DFD6CC] flex items-center justify-center text-xs text-[#5C4A3E]">
                  +
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Allergen notice */}
      <p className="text-[10px] text-[#8C7A6D] text-center mt-6 mb-2 leading-relaxed">
        Made fresh in small batches. Ask our team about allergens before ordering.
      </p>

      {/* Floating Bottom Cart Bar */}
      <div className="sticky bottom-0 pt-3 pb-1 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5] to-transparent">
        <button
          onClick={onViewCart}
          className="w-full py-3.5 px-5 bg-[#523E32] hover:bg-[#3D2D23] text-[#FAF8F5] rounded-2xl font-bold text-xs transition-transform active:scale-[0.99] flex items-center justify-between shadow-lg shadow-black/10"
        >
          <span>View cart · 2 items</span>
          <span>₱265</span>
        </button>
      </div>

      {/* Home indicator */}
      <div className="h-4 flex items-center justify-center pt-2">
        <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
      </div>
    </div>
  );
};
