import React, { useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';

interface Props {
  onSimulateAccept?: () => void;
}

export const Screen05Pending: React.FC<Props> = ({ onSimulateAccept }) => {
  const { activeOrder, acceptOrder } = useCafe();

  const requestRef = activeOrder?.requestReference || 'R-8F2';
  const orderTotal = activeOrder?.totalAmount || 265;
  const items = activeOrder?.items || [
    {
      id: 'default_1',
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
      name: 'Brown butter cookie',
      price: 85,
      quantity: 1,
      image: '/figma-assets/brown-butter-cookie.jpg',
    }
  ];

  // Auto-advance if staff accepted the order
  useEffect(() => {
    if (activeOrder && activeOrder.status !== 'pending' && onSimulateAccept) {
      onSimulateAccept();
    }
  }, [activeOrder?.status, onSimulateAccept]);

  const handleSimulate = async () => {
    if (activeOrder && activeOrder.status === 'pending') {
      try {
        await acceptOrder(activeOrder.id);
      } catch {
        // ignore
      }
    }
    if (onSimulateAccept) onSimulateAccept();
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
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-2xl tracking-tight text-[#221611]">aight .</span>
          <span className="text-[10px] font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
            CAFE
          </span>
        </div>
        <span className="text-xs font-semibold text-[#5E4D40]">Your order</span>
      </div>

      {/* Pending acceptance pill */}
      <div className="mt-4 flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF2DE] text-[#8A6715] rounded-full text-[11px] font-bold border border-[#EFE1BA]">
          <span className="w-2 h-2 rounded-full bg-[#8A6715] animate-pulse"></span>
          Pending acceptance
        </div>
      </div>

      {/* Hourglass Icon */}
      <div className="mt-4 flex justify-center">
        <div className="w-16 h-16 rounded-full bg-[#F2EDE4] flex items-center justify-center text-2xl text-[#8A6715]">
          ⌛
        </div>
      </div>

      {/* Headline */}
      <div className="mt-4 text-center">
        <h1 className="text-2xl font-black text-[#221611]">Sent to the team.</h1>
        <p className="text-xs text-[#7A695C] mt-2 leading-relaxed max-w-[280px] mx-auto">
          We're waiting for the stall to accept your order. Your pickup number will appear here once it's confirmed.
        </p>
      </div>

      {/* Reference Card */}
      <div className="mt-5 p-4 bg-white rounded-2xl border border-[#ECE5DC] text-xs space-y-2.5 shadow-xs">
        <div className="flex justify-between items-center text-[#6E5D50]">
          <span>Request reference</span>
          <span className="font-mono font-bold text-sm text-[#221611]">{requestRef}</span>
        </div>
        <p className="text-[10px] text-[#8C7A6D]">
          Use this if you need to ask the team before acceptance.
        </p>

        <div className="pt-2 border-t border-[#F2ECE3] flex justify-between items-center text-[#6E5D50]">
          <span>Pickup location</span>
          <span className="font-semibold text-[#221611]">The Courtyard</span>
        </div>

        <div className="flex justify-between items-center text-[#6E5D50]">
          <span>Estimated wait</span>
          <span className="font-semibold text-[#221611]">8–12 min after acceptance</span>
        </div>
      </div>

      {/* Payment Box */}
      <div className="mt-3 p-3.5 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs flex justify-between items-center">
        <div>
          <div className="font-bold text-[#221611]">Cash at pickup</div>
          <div className="text-[10px] text-[#69584B]">Pay at the stall when collecting.</div>
        </div>
        <span className="font-bold text-sm text-[#221611]">₱{orderTotal}</span>
      </div>

      {/* Items Preview */}
      <div className="mt-3 p-3.5 bg-white rounded-2xl border border-[#ECE5DC] space-y-2 text-xs shadow-xs">
        {items.map((it, idx) => (
          <div key={idx} className="flex justify-between items-start">
            <div className="flex items-start gap-2.5">
              <img
                src={it.image || '/figma-assets/iced-latte.jpg'}
                alt={it.name}
                className="w-9 h-9 rounded-lg object-cover bg-[#EAE3DA]"
              />
              <div>
                <p className="font-bold text-[#221611]">{it.quantity} × {it.name}</p>
                <p className="text-[10px] text-[#7A695C]">
                  {it.size ? `${it.size} · ` : ''}
                  {it.milk ? `${it.milk} · ` : ''}
                  {it.sweetness ? `${it.sweetness} sweet` : ''}
                </p>
              </div>
            </div>
            <span className="font-bold text-[#221611]">₱{it.price * it.quantity}</span>
          </div>
        ))}

        <div className="pt-2 border-t border-[#F2ECE3] flex justify-between font-black text-sm text-[#221611]">
          <span>Total due at pickup</span>
          <span>₱{orderTotal}</span>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="mt-auto pt-4 space-y-2">
        <button
          onClick={handleSimulate}
          className="w-full py-3.5 px-6 bg-[#221611] hover:bg-[#3D2D23] text-[#FAF8F5] rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-black/10"
        >
          <span>✓</span>
          <span>Simulate staff accept (Assign queue)</span>
        </button>
        <p className="text-[10px] text-center text-[#8C7A6D]">
          Keep this private page open. No payment has been taken.
        </p>
      </div>

      {/* Home indicator */}
      <div className="h-4 flex items-center justify-center pt-2">
        <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
      </div>
    </div>
  );
};
