import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';

export const CustomerCartView: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, updateCartQuantity, removeFromCart } = useCafe();

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
          <span className="font-bold text-sm text-[#7A695C]">Your cart</span>
          <span className="text-xs font-semibold text-[#8C7A6D]">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
        </header>

        {/* Title */}
        <div className="mt-6 flex items-baseline justify-between pb-3 border-b border-[#ECE5DC]">
          <h1 className="text-2xl sm:text-3xl font-black text-[#221611] tracking-tight">The good stuff.</h1>
          <span className="text-xs text-[#8C7A6D]">Pickup only</span>
        </div>

        {/* Cart items list or empty notice */}
        {cart.length === 0 ? (
          <div className="my-auto text-center py-16 space-y-4">
            <div className="text-4xl">☕</div>
            <h3 className="font-bold text-lg text-[#221611]">Your cart is empty</h3>
            <p className="text-sm text-[#7A695C] max-w-xs mx-auto">
              Choose your favorite coffee or pastry from the menu.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 px-6 py-3 bg-[#221611] text-[#FAF8F5] rounded-xl text-xs font-bold hover:bg-[#36251E] cursor-pointer transition-colors"
            >
              Browse menu
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#ECE5DC] mt-2 flex-1">
            {cart.map((item) => (
              <div key={item.id} className="py-5 space-y-3 bg-white/60 p-4 rounded-2xl border border-[#ECE5DC] my-3">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#EAE3DA] shrink-0">
                    <img
                      src={item.image || '/figma-assets/iced-latte.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-[#221611]">{item.name}</h3>
                    <p className="text-xs text-[#7A695C] mt-1">
                      {item.size ? `${item.size} · ` : ''}
                      {item.milk ? `${item.milk} · ` : ''}
                      {item.sweetness ? `${item.sweetness} sweet` : ''}
                    </p>
                    {item.extraShot && (
                      <p className="text-xs font-semibold text-[#8C7A6D] mt-0.5">+ Extra espresso shot</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE3]">
                  <div className="flex items-center gap-3 border border-[#E0D7CC] rounded-xl px-3 py-1 bg-[#FAF8F5]">
                    <button
                      onClick={() => updateCartQuantity(item.id, -1)}
                      className="text-sm font-bold text-[#7A695C] px-1 hover:text-[#221611] cursor-pointer"
                    >
                      –
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, 1)}
                      className="text-sm font-bold text-[#7A695C] px-1 hover:text-[#221611] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base text-[#221611]">₱{item.price * item.quantity}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#8C7A6D] hover:text-rose-600 text-sm p-1 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <button
                onClick={() => navigate('/')}
                className="text-xs sm:text-sm font-bold text-[#221611] hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Add something else from menu
              </button>
            </div>
          </div>
        )}

        {/* Totals & Sticky Checkout */}
        {cart.length > 0 && (
          <div className="mt-8 space-y-4 bg-white p-5 rounded-3xl border border-[#ECE5DC] shadow-xs">
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-[#6E5D50]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#221611]">₱{cartTotal}</span>
              </div>
              <div className="flex justify-between text-[#6E5D50]">
                <span>Pickup at stall (The Courtyard)</span>
                <span className="font-semibold text-emerald-700">Free</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#221611] pt-2 border-t border-[#ECE5DC]">
                <span>Total Amount Due</span>
                <span>₱{cartTotal}</span>
              </div>
            </div>

            <div className="p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs flex gap-3">
              <span className="text-base">☕</span>
              <div>
                <div className="font-bold text-[#221611]">Pickup at The Courtyard</div>
                <p className="text-xs text-[#69584B] mt-0.5 leading-relaxed">
                  Your order is prepared fresh after barista accepts. Pay with cash when you pick it up.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 px-6 bg-[#221611] hover:bg-[#36251E] text-[#FAF8F5] rounded-2xl font-bold text-sm transition-transform active:scale-[0.99] flex items-center justify-between shadow-xl cursor-pointer"
              >
                <span>Continue to Checkout</span>
                <span className="font-extrabold text-base">₱{cartTotal} →</span>
              </button>
              <p className="text-[11px] text-center text-[#8C7A6D]">
                Cash at pickup · No card required
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
