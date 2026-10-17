import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { menuService } from '../services/menuService';
import { calculateAuthoritativeItemPrice } from '../services/orderCalculator';
import type { MenuItem } from '../types/cafe';

export const CustomerCustomizeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCafe();

  const [product, setProduct] = useState<MenuItem | null>(null);
  const [size, setSize] = useState<string>('Large');
  const [milk, setMilk] = useState<string>('Oat milk');
  const [sweetness, setSweetness] = useState<string>('25%');
  const [extraShot, setExtraShot] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      menuService.getProductById(id).then(item => {
        if (item) {
          setProduct(item);
          if (item.options?.sizes && item.options.sizes.length > 0) {
            setSize(item.options.sizes[item.options.sizes.length - 1].name);
          }
          if (item.options?.milks && item.options.milks.length > 0) {
            setMilk(item.options.milks[1]?.name || item.options.milks[0].name);
          }
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6 text-xs text-[#8C7A6D]">
        Loading item details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <p className="text-sm font-bold text-[#221611]">Item not found</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#221611] text-white rounded-xl text-xs font-bold"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const priceResult = calculateAuthoritativeItemPrice(product, {
    size,
    milk,
    extraShot,
    quantity,
  });

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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-start p-4 md:p-8 font-sans">
      <div className="w-full max-w-[420px] min-h-[960px] bg-[#FAF8F5] text-[#221611] rounded-[44px] p-6 flex flex-col shadow-2xl border border-[#EAE3DA] relative overflow-hidden select-none">
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
          <button
            onClick={() => navigate('/')}
            className="text-lg font-bold text-[#221611] p-1 -ml-1 hover:text-[#5C4A3E]"
          >
            ←
          </button>
          <span className="font-bold text-sm text-[#221611]">Make it yours</span>
          <span className="text-sm font-bold text-[#8C7A6D]">···</span>
        </div>

        {/* Hero Image */}
        <div className="w-full h-56 rounded-3xl overflow-hidden bg-[#EAE3DA] mt-2 shadow-xs">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title & Price */}
        <div className="mt-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-[#221611]">{product.name}</h1>
            <p className="text-xs text-[#7A695C] mt-1 leading-relaxed max-w-[240px]">
              {product.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#8C7A6D]">From</div>
            <div className="text-xl font-black text-[#221611]">₱{product.price}</div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="mt-4 space-y-4 text-xs">
          {/* Size */}
          {product.options?.sizes && product.options.sizes.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-[#221611]">Size</label>
                <span className="text-[10px] text-[#8C7A6D]">Required</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {product.options.sizes.map(s => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSize(s.name)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                      size === s.name
                        ? 'border-[#221611] bg-[#F2EDE4] font-bold text-[#221611]'
                        : 'border-[#E0D7CC] bg-white text-[#5C4A3E]'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="text-[11px] text-[#8C7A6D]">
                      {s.price === 0 ? 'Base' : `+₱${s.price}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk */}
          {product.options?.milks && product.options.milks.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-[#221611]">Milk</label>
                <span className="text-[10px] text-[#8C7A6D]">Required</span>
              </div>
              <div className="space-y-1.5">
                {product.options.milks.map(m => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setMilk(m.name)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                      milk === m.name
                        ? 'border-[#221611] bg-[#F2EDE4] font-bold text-[#221611]'
                        : 'border-[#E0D7CC] bg-white text-[#5C4A3E]'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[11px] text-[#8C7A6D]">
                      {m.price === 0 ? 'Included' : `+₱${m.price}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sweetness */}
          {product.options?.sweetness && product.options.sweetness.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-[#221611]">Sweetness</label>
                <span className="text-[10px] text-[#8C7A6D]">Required</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {product.options.sweetness.map(sw => (
                  <button
                    key={sw}
                    type="button"
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
          )}

          {/* Add-ons */}
          {product.category === 'Coffee' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-[#221611]">Add-ons</label>
                <span className="text-[10px] text-[#8C7A6D]">Optional</span>
              </div>
              <button
                type="button"
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
          )}
        </div>

        {/* Quantity */}
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

        {/* Price Breakdown */}
        <div className="mt-3 text-center text-[11px] text-[#8C7A6D]">
          {priceResult.details.join(' ')} = ₱{priceResult.unitPrice}
        </div>

        {/* Bottom Add to Cart Button */}
        <div className="mt-auto pt-4">
          <button
            onClick={handleAddToCart}
            className="w-full py-3.5 px-6 bg-[#523E32] hover:bg-[#3D2D23] text-[#FAF8F5] rounded-2xl font-bold text-xs transition-transform active:scale-[0.99] flex items-center justify-between shadow-lg shadow-black/10"
          >
            <span>Add to cart</span>
            <span>₱{priceResult.totalPrice}</span>
          </button>
        </div>

        {/* Home indicator */}
        <div className="h-4 flex items-center justify-center pt-2">
          <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
