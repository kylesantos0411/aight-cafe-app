import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';

export const CustomerCheckoutView: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, createOrder } = useCafe();
  const [pickupName, setPickupName] = useState('Alex');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!pickupName.trim()) {
      setError('Please provide a name for order pickup.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = await createOrder({
        customerName: pickupName.trim(),
        phone: phone.trim() || undefined,
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
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans flex flex-col selection:bg-[#221611] selection:text-[#FAF8F5]">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-5 md:py-8 flex-1 flex flex-col">
        {/* Navigation Header */}
        <header className="flex items-center justify-between pb-4 border-b border-[#ECE5DC]">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-sm font-bold text-[#221611] hover:text-[#5C4A3E] p-1 -ml-1 transition-colors cursor-pointer"
          >
            <span>←</span>
            <span>Back to cart</span>
          </button>
          <span className="font-bold text-sm text-[#7A695C]">Checkout</span>
          <span className="text-xs font-semibold text-[#8C7A6D]">The Courtyard</span>
        </header>

        {/* Title */}
        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#221611] tracking-tight">One last thing.</h1>
          <p className="text-xs sm:text-sm text-[#7A695C] mt-1.5 leading-relaxed">
            We'll make it fresh. You'll pick it up at the Aight Cafe stall.
          </p>
        </div>

        {/* Location & Estimated Time Box */}
        <div className="mt-6 p-4 sm:p-5 bg-white rounded-3xl border border-[#ECE5DC] text-xs sm:text-sm space-y-1.5 shadow-xs">
          <div className="font-bold text-[#221611] flex items-center gap-2 text-sm sm:text-base">
            <span>📍</span>
            <span>The Courtyard · Aight Cafe popup</span>
          </div>
          <div className="text-xs text-[#7A695C] pl-6">Today, as soon as possible</div>
          <div className="text-xs font-medium text-emerald-700 pl-6">Estimated prep: 8–12 minutes after staff acceptance</div>
        </div>

        {/* Form Fields: Pickup Name & Optional Phone */}
        <div className="mt-6 bg-white p-5 rounded-3xl border border-[#ECE5DC] space-y-4 shadow-xs">
          <div>
            <label className="text-xs sm:text-sm font-bold text-[#221611] block mb-2">
              Pickup name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={pickupName}
              onChange={e => setPickupName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DFD6CC] text-sm font-semibold text-[#221611] focus:outline-hidden focus:ring-2 focus:ring-[#221611]"
            />
            <p className="text-[11px] text-[#8C7A6D] mt-1.5">
              Only your queue number (e.g. A042) appears on the public counter screen.
            </p>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-bold text-[#221611] block mb-2">
              Phone number <span className="text-[#8C7A6D] font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 0917 123 4567"
              className="w-full px-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DFD6CC] text-sm font-medium text-[#221611] focus:outline-hidden focus:ring-2 focus:ring-[#221611]"
            />
          </div>
        </div>

        {/* Payment Box */}
        <div className="mt-6 bg-white p-5 rounded-3xl border border-[#ECE5DC] shadow-xs">
          <label className="text-xs sm:text-sm font-bold text-[#221611] block mb-2.5">Payment Method</label>
          <div className="p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-[#221611] text-white flex items-center justify-center text-[9px]">●</span>
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#221611]">Cash at pickup</div>
                <div className="text-[11px] sm:text-xs text-[#69584B] mt-0.5">Pay ₱{cartTotal} to the barista when collecting.</div>
              </div>
            </div>
            <span className="text-xl">💵</span>
          </div>
          <p className="text-[11px] text-[#8C7A6D] mt-2 leading-relaxed">
            Payment is verified upon pickup before your order is handed over.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}

        {/* Order Items Breakdown */}
        <div className="mt-6 p-5 bg-white rounded-3xl border border-[#ECE5DC] space-y-3 text-xs sm:text-sm shadow-xs">
          <div className="font-bold text-sm text-[#221611] pb-1 border-b border-[#ECE5DC]">Order Summary</div>
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start pt-1">
              <div className="flex items-start gap-3">
                <img
                  src={item.image || '/figma-assets/iced-latte.jpg'}
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover bg-[#EAE3DA]"
                />
                <div>
                  <p className="font-bold text-[#221611]">{item.quantity} × {item.name}</p>
                  <p className="text-xs text-[#7A695C]">
                    {item.size ? `${item.size} · ` : ''}
                    {item.milk ? `${item.milk} · ` : ''}
                    {item.sweetness ? `${item.sweetness} sweet` : ''}
                  </p>
                </div>
              </div>
              <span className="font-bold text-[#221611]">₱{item.price * item.quantity}</span>
            </div>
          ))}

          <div className="pt-3 border-t border-[#F2ECE3] space-y-1.5">
            <div className="flex justify-between text-[#7A695C] text-xs">
              <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
              <span>₱{cartTotal}</span>
            </div>
            <div className="flex justify-between text-[#7A695C] text-xs">
              <span>Pickup Service</span>
              <span className="text-emerald-700 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#221611] pt-2 border-t border-[#ECE5DC]">
              <span>Total due at pickup</span>
              <span>₱{cartTotal}</span>
            </div>
          </div>
        </div>

        {/* Private Token Notice */}
        <div className="mt-4 p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs flex gap-2.5">
          <span className="text-sm">🔒</span>
          <div>
            <div className="font-bold text-xs text-[#221611]">Private Order Tracking</div>
            <p className="text-[11px] text-[#69584B] mt-0.5 leading-relaxed">
              You will receive an unguessable private order link to follow your status live. No account registration needed.
            </p>
          </div>
        </div>

        {/* Submit Order Button */}
        <div className="sticky bottom-6 mt-8 z-20 space-y-2">
          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="w-full py-4 px-6 bg-[#221611] hover:bg-[#36251E] text-[#FAF8F5] rounded-2xl font-bold text-sm transition-transform active:scale-[0.99] flex items-center justify-center shadow-xl disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <span>Submitting order to stall...</span>
            ) : (
              <span>Place Pickup Order · ₱{cartTotal}</span>
            )}
          </button>
          <p className="text-[11px] text-center text-[#8C7A6D]">
            Order is sent immediately to the barista queue
          </p>
        </div>
      </div>
    </div>
  );
};
