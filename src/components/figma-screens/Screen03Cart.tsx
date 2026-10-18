import React from 'react';
import { useCafe } from '../../context/CafeContext';

interface Props {
  onBack?: () => void;
  onCheckout?: () => void;
  onAddMore?: () => void;
}

export const Screen03Cart: React.FC<Props> = ({ onBack, onCheckout, onAddMore }) => {
  const { cart, cartTotal, updateCartQuantity, removeFromCart } = useCafe();

  const displayItems = cart.length > 0 ? cart : [
    {
      id: 'default_1',
      menuItemId: '1',
      name: 'Iced oat latte',
      price: 180,
      quantity: 1,
      image: '/figma-assets/iced-latte.jpg',
      size: 'Large',
      milk: 'Oat milk',
      sweetness: '25%',
    },
    {
      id: 'default_2',
      menuItemId: '5',
      name: 'Brown butter cookie',
      price: 85,
      quantity: 1,
      image: '/figma-assets/brown-butter-cookie.jpg',
    }
  ];

  const total = cart.length > 0 ? cartTotal : 265;

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
        <span className="font-bold text-sm text-[#221611]">Your cart</span>
        <span className="text-sm font-bold text-[#8C7A6D]">···</span>
      </div>

      {/* Title */}
      <div className="mt-4 flex items-baseline justify-between pb-2 border-b border-[#ECE5DC]">
        <h1 className="text-2xl font-black text-[#221611]">The good stuff.</h1>
        <span className="text-xs text-[#8C7A6D]">{displayItems.length} items</span>
      </div>

      {/* Cart Items List */}
      <div className="divide-y divide-[#ECE5DC] mt-2">
        {displayItems.map((item) => (
          <div key={item.id} className="py-4 space-y-2">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#EAE3DA] shrink-0">
                <img
                  src={item.image || '/figma-assets/iced-latte.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-[#221611]">{item.name}</h3>
                <p className="text-[11px] text-[#7A695C] mt-0.5">
                  {item.size ? `${item.size} · ` : ''}
                  {item.milk ? `${item.milk} · ` : ''}
                  {item.sweetness ? `${item.sweetness} sweet` : 'Standard'}
                </p>
                <button onClick={onBack} className="text-[10px] font-semibold text-[#221611] underline mt-1 block">
                  Edit item
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3 border border-[#E0D7CC] rounded-xl px-2.5 py-1 bg-white">
                <button
                  onClick={() => updateCartQuantity(item.id, -1)}
                  className="text-xs font-bold text-[#7A695C] px-1 hover:text-[#221611]"
                >
                  –
                </button>
                <span className="text-xs font-bold w-3 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.id, 1)}
                  className="text-xs font-bold text-[#7A695C] px-1 hover:text-[#221611]"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#221611]">₱{item.price * item.quantity}</span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-[#8C7A6D] hover:text-rose-600 text-xs transition-colors"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add something else */}
      <button
        onClick={onAddMore || onBack}
        className="text-xs font-bold text-[#221611] hover:underline mt-2 text-left"
      >
        + Add something else
      </button>

      {/* Totals */}
      <div className="mt-5 space-y-2 text-xs pt-3 border-t border-[#ECE5DC]">
        <div className="flex justify-between text-[#6E5D50]">
          <span>Subtotal</span>
          <span className="font-semibold text-[#221611]">₱{total}</span>
        </div>
        <div className="flex justify-between text-[#6E5D50]">
          <span>Pickup at stall</span>
          <span className="font-semibold text-emerald-700">Free</span>
        </div>
        <div className="flex justify-between text-sm font-black text-[#221611] pt-1">
          <span>Total</span>
          <span>₱{total}</span>
        </div>
      </div>

      {/* Pickup Callout Notice */}
      <div className="mt-5 p-3.5 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs flex gap-2.5">
        <span className="text-sm">☕</span>
        <div>
          <div className="font-bold text-[#221611]">Pickup at Silangan, San Mateo, Rizal</div>
          <p className="text-[11px] text-[#69584B] mt-0.5 leading-relaxed">
            Your order is made after the team accepts it. Usually ready in 8–12 minutes.
          </p>
        </div>
      </div>

      {/* Bottom Sticky Button */}
      <div className="mt-auto pt-4 space-y-1.5">
        <button
          onClick={onCheckout}
          className="w-full py-3.5 px-6 bg-[#523E32] hover:bg-[#3D2D23] text-[#FAF8F5] rounded-2xl font-bold text-xs transition-transform active:scale-[0.99] flex items-center justify-between shadow-lg shadow-black/10"
        >
          <span>Continue to checkout</span>
          <span>₱{total}</span>
        </button>
        <p className="text-[10px] text-center text-[#8C7A6D]">
          No payment is taken at this step.
        </p>
      </div>

      {/* Home indicator */}
      <div className="h-4 flex items-center justify-center pt-2">
        <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
      </div>
    </div>
  );
};
