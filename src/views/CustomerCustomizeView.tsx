import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { INITIAL_MENU_ITEMS } from '../data/mockMenu';
import { calculateAuthoritativeItemPrice } from '../services/orderCalculator';

export const CustomerCustomizeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCafe();

  const product = useMemo(() => {
    return INITIAL_MENU_ITEMS.find(m => m.id === id) || INITIAL_MENU_ITEMS[0];
  }, [id]);

  const [size, setSize] = useState<string>(product.options?.sizes?.[0]?.name || 'Regular');
  const [milk, setMilk] = useState<string>(product.options?.milks?.[0]?.name || 'Dairy');
  const [sweetness, setSweetness] = useState<string>(product.options?.sweetness?.[1] || '25%');
  const [extraShot, setExtraShot] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  // Authoritative real-time calculation
  const priceResult = useMemo(() => {
    return calculateAuthoritativeItemPrice(product, {
      size,
      milk,
      sweetness,
      extraShot,
      quantity,
    });
  }, [product, size, milk, sweetness, extraShot, quantity]);

  const handleAddToCart = () => {
    addToCart({
      menuItemId: product.id,
      name: product.name,
      price: priceResult.unitPrice,
      basePrice: product.price,
      quantity,
      image: product.image,
      size,
      milk,
      sweetness,
      extraShot,
    });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans flex flex-col selection:bg-[#221611] selection:text-[#FAF8F5]">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-5 md:py-8 flex-1 flex flex-col">
        {/* Navigation Header */}
        <header className="flex items-center justify-between pb-4 border-b border-[#ECE5DC]">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-bold text-[#221611] hover:text-[#5C4A3E] p-1 -ml-1 transition-colors cursor-pointer"
          >
            <span>←</span>
            <span>Back to menu</span>
          </button>
          <span className="font-bold text-sm text-[#7A695C]">Customize your drink</span>
          <button
            onClick={() => navigate('/cart')}
            className="w-8 h-8 rounded-full border border-[#DFD6CC] flex items-center justify-center text-[#5C4A3E] relative hover:bg-[#F2EDE4] transition-all"
            title="Cart"
          >
            <span className="text-sm">👜</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#221611] text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </header>

        {/* Hero Card with Image & Details */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center bg-white p-4 sm:p-5 rounded-3xl border border-[#ECE5DC] shadow-xs">
          <div className="w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-[#EAE3DA]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#ECEAE3] text-[#7A695C] rounded-full text-[11px] font-semibold mb-2">
                {product.category}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#221611] tracking-tight">{product.name}</h1>
              <p className="text-xs sm:text-sm text-[#7A695C] mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F2ECE3] flex items-baseline justify-between">
              <span className="text-xs text-[#8C7A6D]">Base price</span>
              <span className="text-xl font-black text-[#221611]">₱{product.price}</span>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="mt-6 space-y-5 text-xs sm:text-sm">
          {/* Size */}
          {product.options?.sizes && product.options.sizes.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE5DC]">
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-sm text-[#221611]">Size</label>
                <span className="text-[11px] font-semibold text-[#8C7A6D]">Required</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {product.options.sizes.map(s => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSize(s.name)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      size === s.name
                        ? 'border-[#221611] bg-[#F2EDE4] font-bold text-[#221611] ring-1 ring-[#221611]'
                        : 'border-[#E0D7CC] bg-[#FAF8F5] hover:bg-white text-[#5C4A3E]'
                    }`}
                  >
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-xs text-[#8C7A6D]">
                      {s.price === 0 ? 'Base' : `+₱${s.price}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk */}
          {product.options?.milks && product.options.milks.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE5DC]">
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-sm text-[#221611]">Milk Option</label>
                <span className="text-[11px] font-semibold text-[#8C7A6D]">Required</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {product.options.milks.map(m => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setMilk(m.name)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      milk === m.name
                        ? 'border-[#221611] bg-[#F2EDE4] font-bold text-[#221611] ring-1 ring-[#221611]'
                        : 'border-[#E0D7CC] bg-[#FAF8F5] hover:bg-white text-[#5C4A3E]'
                    }`}
                  >
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-xs text-[#8C7A6D]">
                      {m.price === 0 ? 'Included' : `+₱${m.price}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sweetness */}
          {product.options?.sweetness && product.options.sweetness.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE5DC]">
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-sm text-[#221611]">Sweetness Level</label>
                <span className="text-[11px] font-semibold text-[#8C7A6D]">Required</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {product.options.sweetness.map(sw => (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => setSweetness(sw)}
                    className={`py-3 px-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      sweetness === sw
                        ? 'border-[#221611] bg-[#221611] text-white font-bold'
                        : 'border-[#E0D7CC] bg-[#FAF8F5] hover:bg-white text-[#5C4A3E]'
                    }`}
                  >
                    {sw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {product.category === 'Coffee' && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE5DC]">
              <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-sm text-[#221611]">Add-ons</label>
                <span className="text-[11px] font-semibold text-[#8C7A6D]">Optional</span>
              </div>
              <button
                type="button"
                onClick={() => setExtraShot(!extraShot)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  extraShot
                    ? 'border-[#221611] bg-[#F2EDE4] font-bold text-[#221611] ring-1 ring-[#221611]'
                    : 'border-[#E0D7CC] bg-[#FAF8F5] hover:bg-white text-[#5C4A3E]'
                }`}
              >
                <span className="font-semibold">Extra espresso shot</span>
                <span className="text-xs font-bold text-[#8C7A6D]">+₱30</span>
              </button>
            </div>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="mt-6 bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE5DC] flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-[#221611]">Quantity</span>
            <div className="text-[11px] text-[#8C7A6D] mt-0.5">
              {priceResult.details.join(' · ')}
            </div>
          </div>
          <div className="flex items-center gap-3 border border-[#E0D7CC] rounded-xl px-4 py-1.5 bg-[#FAF8F5]">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="text-sm font-bold text-[#7A695C] px-2 hover:text-[#221611] cursor-pointer"
            >
              –
            </button>
            <span className="text-sm font-bold w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="text-sm font-bold text-[#7A695C] px-2 hover:text-[#221611] cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Bottom Add to Cart Button */}
        <div className="sticky bottom-6 mt-8 z-20">
          <button
            onClick={handleAddToCart}
            className="w-full py-4 px-6 bg-[#221611] hover:bg-[#36251E] text-[#FAF8F5] rounded-2xl font-bold text-sm transition-transform active:scale-[0.99] flex items-center justify-between shadow-xl cursor-pointer"
          >
            <span>Add to Cart ({quantity})</span>
            <span className="font-extrabold text-base">₱{priceResult.totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
