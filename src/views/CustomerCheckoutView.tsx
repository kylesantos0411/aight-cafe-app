import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';

export const CustomerCheckoutView: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, createOrder } = useCafe();
  const [pickupName, setPickupName] = useState('Alex');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!pickupName.trim()) {
      setError('Please provide a pickup name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = await createOrder({
        customerName: pickupName.trim(),
        orderType: 'takeout',
      });

      // Navigate to the private unguessable order URL
      navigate(`/order/${order.privateToken}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit order. Please try again.');
      setSubmitting(false);
    }
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
            onClick={() => navigate('/cart')}
            className="text-lg font-bold text-[#221611] p-1 -ml-1 hover:text-[#5C4A3E]"
          >
            ←
          </button>
          <span className="font-bold text-sm text-[#221611]">Checkout</span>
          <span className="text-sm font-bold text-[#8C7A6D]">···</span>
        </div>

        {/* Title */}
        <div className="mt-4">
          <h1 className="text-2xl font-black text-[#221611]">One last thing.</h1>
          <p className="text-xs text-[#7A695C] mt-1 leading-relaxed">
            We'll make it fresh. You'll pick it up at the Aight Cafe stall.
          </p>
        </div>

        {/* Location Box */}
        <div className="mt-4 p-4 bg-white rounded-2xl border border-[#ECE5DC] text-xs space-y-1 shadow-xs">
          <div className="font-bold text-[#221611] flex items-center gap-1.5">
            <span>📍</span>
            The Courtyard · Aight popup
          </div>
          <div className="text-[11px] text-[#7A695C]">Today, as soon as possible</div>
          <div className="text-[10px] text-[#8C7A6D]">Approx. 8–12 min after acceptance</div>
        </div>

        {/* Pickup Name field */}
        <div className="mt-4">
          <label className="text-xs font-bold text-[#221611] block mb-1.5">Pickup name</label>
          <input
            type="text"
            value={pickupName}
            onChange={e => setPickupName(e.target.value)}
            placeholder="e.g. Alex"
            className="w-full px-3.5 py-3 bg-white rounded-2xl border border-[#DFD6CC] text-xs font-medium text-[#221611] focus:outline-hidden focus:ring-1 focus:ring-[#221611]"
          />
          <p className="text-[10px] text-[#8C7A6D] mt-1">
            Only your queue number appears on the stall display.
          </p>
        </div>

        {/* Payment Option */}
        <div className="mt-4">
          <label className="text-xs font-bold text-[#221611] block mb-2">Payment</label>
          <div className="p-3.5 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#221611] text-white flex items-center justify-center text-[8px]">●</span>
              <div>
                <div className="font-bold text-xs text-[#221611]">Cash at pickup</div>
                <div className="text-[10px] text-[#69584B]">Pay ₱{cartTotal} to the team when collecting.</div>
              </div>
            </div>
            <span className="text-base">💵</span>
          </div>
          <p className="text-[10px] text-[#8C7A6D] mt-1 leading-relaxed">
            Digital payments aren't available. The team will verify cash payment at collection.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* Items Summary */}
        <div className="mt-4 p-3.5 bg-white rounded-2xl border border-[#ECE5DC] space-y-2 text-xs shadow-xs">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start pt-1 first:pt-0">
              <div className="flex items-start gap-2.5">
                <img
                  src={item.image || '/figma-assets/iced-latte.jpg'}
                  alt={item.name}
                  className="w-9 h-9 rounded-lg object-cover bg-[#EAE3DA]"
                />
                <div>
                  <p className="font-bold text-[#221611]">{item.quantity} × {item.name}</p>
                  <p className="text-[10px] text-[#7A695C]">
                    {item.size ? `${item.size} · ` : ''}
                    {item.milk ? `${item.milk} · ` : ''}
                    {item.sweetness ? `${item.sweetness} sweet` : ''}
                  </p>
                </div>
              </div>
              <span className="font-bold text-[#221611]">₱{item.price * item.quantity}</span>
            </div>
          ))}

          <div className="pt-2 border-t border-[#F2ECE3] space-y-1">
            <div className="flex justify-between text-[#7A695C] text-[11px]">
              <span>Subtotal · {cart.length} items</span>
              <span>₱{cartTotal}</span>
            </div>
            <div className="flex justify-between text-[#7A695C] text-[11px]">
              <span>Pickup</span>
              <span className="text-emerald-700 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-xs font-black text-[#221611] pt-1">
              <span>Total due at pickup</span>
              <span>₱{cartTotal}</span>
            </div>
          </div>
        </div>

        {/* Privacy Box */}
        <div className="mt-3 p-3 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs flex gap-2">
          <span className="text-xs">🔒</span>
          <div>
            <div className="font-bold text-[11px] text-[#221611]">Keep your order link private</div>
            <p className="text-[10px] text-[#69584B] mt-0.5 leading-relaxed">
              Use this device to check your order. No account or phone number is needed.
            </p>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-auto pt-4 space-y-1.5">
          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="w-full py-3.5 px-6 bg-[#523E32] hover:bg-[#3D2D23] text-[#FAF8F5] rounded-2xl font-bold text-xs transition-transform active:scale-[0.99] flex items-center justify-center shadow-lg shadow-black/10 disabled:opacity-50"
          >
            {submitting ? (
              <span>Submitting order to stall...</span>
            ) : (
              <span>Place pickup order · ₱{cartTotal}</span>
            )}
          </button>
          <p className="text-[10px] text-center text-[#8C7A6D]">
            Pay at the stall. Your order needs staff acceptance.
          </p>
        </div>

        {/* Home indicator */}
        <div className="h-4 flex items-center justify-center pt-2">
          <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
