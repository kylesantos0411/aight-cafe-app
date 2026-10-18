import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';

interface Props {
  onBack?: () => void;
  onPlaceOrder?: () => void;
}

export const Screen04Checkout: React.FC<Props> = ({ onBack, onPlaceOrder }) => {
  const { cart, cartTotal, createOrder } = useCafe();
  const [pickupName, setPickupName] = useState('Alex');
  const [submitting, setSubmitting] = useState(false);

  const displayTotal = cartTotal > 0 ? cartTotal : 265;
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

  const handlePlaceOrder = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await createOrder({ customerName: pickupName.trim() || 'Alex' });
      if (onPlaceOrder) onPlaceOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
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
          Silangan, San Mateo, Rizal · Aight popup
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
              <div className="text-[10px] text-[#69584B]">Pay ₱{displayTotal} to the team when collecting.</div>
            </div>
          </div>
          <span className="text-base">💵</span>
        </div>
        <p className="text-[10px] text-[#8C7A6D] mt-1 leading-relaxed">
          Digital payments aren't available. The team will verify cash payment at collection.
        </p>
      </div>

      {/* Items Summary */}
      <div className="mt-4 p-3.5 bg-white rounded-2xl border border-[#ECE5DC] space-y-2 text-xs shadow-xs">
        {displayItems.map((item, idx) => (
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
                  {item.sweetness ? `${item.sweetness} sweet` : 'Standard'}
                </p>
              </div>
            </div>
            <span className="font-bold text-[#221611]">₱{item.price * item.quantity}</span>
          </div>
        ))}

        <div className="pt-2 border-t border-[#F2ECE3] space-y-1">
          <div className="flex justify-between text-[#7A695C] text-[11px]">
            <span>Subtotal · {displayItems.length} items</span>
            <span>₱{displayTotal}</span>
          </div>
          <div className="flex justify-between text-[#7A695C] text-[11px]">
            <span>Pickup</span>
            <span className="text-emerald-700 font-semibold">Free</span>
          </div>
          <div className="flex justify-between text-xs font-black text-[#221611] pt-1">
            <span>Total due at pickup</span>
            <span>₱{displayTotal}</span>
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

      {/* Bottom Sticky Button */}
      <div className="mt-auto pt-4 space-y-1.5">
        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="w-full py-3.5 px-6 bg-[#523E32] hover:bg-[#3D2D23] text-[#FAF8F5] rounded-2xl font-bold text-xs transition-transform active:scale-[0.99] flex items-center justify-center shadow-lg shadow-black/10"
        >
          {submitting ? (
            <span>Submitting order...</span>
          ) : (
            <span>Place pickup order · ₱{displayTotal}</span>
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
  );
};
