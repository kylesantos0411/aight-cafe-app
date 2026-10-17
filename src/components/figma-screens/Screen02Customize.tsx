import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';

interface Props {
  onBack?: () => void;
  onAddToCart?: () => void;
}

export const Screen02Customize: React.FC<Props> = ({ onBack, onAddToCart }) => {
  const { addToCart } = useCafe();
  const [size, setSize] = useState<'Regular' | 'Large'>('Large');
  const [milk, setMilk] = useState<'Dairy' | 'Oat milk' | 'Soy milk'>('Oat milk');
  const [sweetness, setSweetness] = useState<'0%' | '25%' | '50%' | '100%'>('25%');
  const [extraShot, setExtraShot] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const basePrice = 140;
  const sizePrice = size === 'Large' ? 20 : 0;
  const milkPrice = milk !== 'Dairy' ? 20 : 0;
  const addonPrice = extraShot ? 30 : 0;
  const unitPrice = basePrice + sizePrice + milkPrice + addonPrice;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    addToCart({
      menuItemId: '1',
      name: 'Iced oat latte',
      price: unitPrice,
      basePrice,
      quantity,
      image: '/figma-assets/iced-latte.jpg',
      size,
      milk,
      sweetness,
      extraShot,
    });
    if (onAddToCart) onAddToCart();
  };

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

      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 pt-1">
        <button onClick={onBack} className="text-lg font-bold text-[#221611] p-1 -ml-1">
          ←
        </button>
        <span className="font-bold text-sm text-[#221611]">Make it yours</span>
        <span className="text-sm font-bold text-[#8C7A6D]">···</span>
      </div>

      {/* Hero Image */}
      <div className="w-full h-56 rounded-3xl overflow-hidden bg-[#EAE3DA] mt-2 shadow-xs">
        <img
          src="/figma-assets/iced-latte.jpg"
          alt="Iced latte"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title & Price */}
      <div className="mt-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-[#221611]">Iced latte</h1>
          <p className="text-xs text-[#7A695C] mt-1 leading-relaxed max-w-[240px]">
            Double espresso, your choice of milk, over ice. A smooth everyday favorite.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#8C7A6D]">From</div>
          <div className="text-xl font-black text-[#221611]">₱140</div>
        </div>
      </div>

      {/* Customization Options */}
      <div className="mt-4 space-y-4 text-xs">
        {/* 1. Size */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-bold text-[#221611]">Size</label>
            <span className="text-[10px] text-[#8C7A6D]">Required</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSize('Regular')}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                size === 'Regular'
                  ? 'border-[#221611] bg-[#F2EDE4] font-bold text-[#221611]'
                  : 'border-[#E0D7CC] bg-white text-[#5C4A3E]'
              }`}
            >
              <span>Regular (12 oz)</span>
              <span className="text-[11px] text-[#8C7A6D]">Base</span>
            </button>
            <button
              onClick={() => setSize('Large')}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                size === 'Large'
                  ? 'border-[#221611] bg-[#F2EDE4] font-bold text-[#221611]'
                  : 'border-[#E0D7CC] bg-white text-[#5C4A3E]'
              }`}
            >
              <span>Large (16 oz)</span>
              <span className="text-[11px] text-[#8C7A6D]">+₱20</span>
            </button>
          </div>
        </div>

        {/* 2. Milk */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-bold text-[#221611]">Milk</label>
            <span className="text-[10px] text-[#8C7A6D]">Required</span>
          </div>
          <div className="space-y-1.5">
            {(['Dairy', 'Oat milk', 'Soy milk'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMilk(m)}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                  milk === m
                    ? 'border-[#221611] bg-[#F2EDE4] font-bold text-[#221611]'
                    : 'border-[#E0D7CC] bg-white text-[#5C4A3E]'
                }`}
              >
                <span>{m}</span>
                <span className="text-[11px] text-[#8C7A6D]">
                  {m === 'Dairy' ? 'Included' : '+₱20'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Sweetness */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-bold text-[#221611]">Sweetness</label>
            <span className="text-[10px] text-[#8C7A6D]">Required</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            {(['0%', '25%', '50%', '100%'] as const).map(sw => (
              <button
                key={sw}
                onClick={() => setSweetness(sw)}
                className={`py-2 px-1 rounded-xl border text-[11px] font-semibold transition-all ${
                  sweetness === sw
                    ? 'border-[#221611] bg-[#221611] text-white font-bold'
                    : 'border-[#E0D7CC] bg-white text-[#5C4A3E]'
                }`}
              >
                {sw}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Add-ons */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-bold text-[#221611]">Add-ons</label>
            <span className="text-[10px] text-[#8C7A6D]">Optional</span>
          </div>
          <button
            onClick={() => setExtraShot(!extraShot)}
            className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
              extraShot
                ? 'border-[#221611] bg-[#F2EDE4] font-bold text-[#221611]'
                : 'border-[#E0D7CC] bg-white text-[#5C4A3E]'
            }`}
          >
            <span>Extra espresso shot</span>
            <span className="text-[11px] text-[#8C7A6D]">+₱30</span>
          </button>
        </div>
      </div>

      {/* Quantity bar */}
      <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#ECE5DC]">
        <span className="text-xs font-bold text-[#221611]">Quantity</span>
        <div className="flex items-center gap-3 border border-[#E0D7CC] rounded-xl px-3 py-1 bg-white">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="text-xs font-bold text-[#7A695C] px-1 hover:text-[#221611]"
          >
            –
          </button>
          <span className="text-xs font-bold w-4 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="text-xs font-bold text-[#7A695C] px-1 hover:text-[#221611]"
          >
            +
          </button>
        </div>
      </div>

      {/* Price breakdown string */}
      <div className="mt-3 text-center text-[11px] text-[#8C7A6D]">
        ₱140 base {size === 'Large' ? '+ ₱20 large ' : ''}{milk !== 'Dairy' ? `+ ₱20 ${milk.toLowerCase()} ` : ''}{extraShot ? '+ ₱30 extra shot ' : ''}= ₱{unitPrice}
      </div>

      {/* Sticky Bottom Add to Cart Button */}
      <div className="mt-auto pt-4">
        <button
          onClick={handleAdd}
          className="w-full py-3.5 px-6 bg-[#523E32] hover:bg-[#3D2D23] text-[#FAF8F5] rounded-2xl font-bold text-xs transition-transform active:scale-[0.99] flex items-center justify-between shadow-lg shadow-black/10"
        >
          <span>Add to cart</span>
          <span>₱{totalPrice}</span>
        </button>
      </div>

      {/* Home indicator */}
      <div className="h-4 flex items-center justify-center pt-2">
        <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
      </div>
    </div>
  );
};
