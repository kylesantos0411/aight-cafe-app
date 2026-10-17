import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';

interface Props {
  onRetry?: () => void;
}

export const Screen11ConnectionLost: React.FC<Props> = ({ onRetry }) => {
  const { activeOrder, setIsOffline } = useCafe();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      setIsOffline(false);
      if (onRetry) onRetry();
    }, 800);
  };

  const orderCode = activeOrder?.code || 'A042';
  const orderStatus = activeOrder?.status || 'Preparing';

  return (
    <div className="w-full max-w-xl mx-auto bg-[#FAF8F5] text-[#221611] rounded-3xl p-6 sm:p-8 flex flex-col shadow-xs border border-[#EAE3DA] font-sans relative select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ECE5DC]">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-2xl tracking-tight text-[#221611]">aight .</span>
          <span className="text-[10px] font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
            CAFE
          </span>
        </div>
        <span className="text-xs font-semibold text-[#5E4D40]">Your order</span>
      </div>

      {/* Offline Alert Banner */}
      <div className="mt-4 p-4 bg-[#FAF2DE] rounded-2xl border border-[#EFE1BA] text-xs space-y-1">
        <div className="font-bold text-[#8A6715] flex items-center gap-2">
          <span>⚡</span>
          You're offline
        </div>
        <p className="text-[11px] text-[#7A6025] leading-relaxed">
          Order updates are paused. Check your connection, then try again.
        </p>
      </div>

      {/* Offline Icon */}
      <div className="mt-4 flex justify-center">
        <div className="w-16 h-16 rounded-full bg-[#F2EDE4] flex items-center justify-center text-2xl text-[#8C7A6D]">
          ☁️
        </div>
      </div>

      {/* Headline */}
      <div className="mt-4 text-center">
        <h1 className="text-3xl font-black text-[#221611]">Your order is still yours.</h1>
        <p className="text-xs text-[#7A695C] mt-2 leading-relaxed max-w-[270px] mx-auto">
          No need to order again. We can't check for new updates right now, but here's the last status we received.
        </p>
      </div>

      {/* Code Box */}
      <div className="mt-5 p-5 bg-white rounded-3xl border border-[#ECE5DC] text-center shadow-xs">
        <span className="text-[10px] uppercase tracking-widest text-[#9A877A] font-bold">
          LAST KNOWN STATUS
        </span>
        <div className="text-6xl font-black tracking-tight my-2 font-mono text-[#221611]">
          {orderCode}
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF2DE] text-[#8A6715] rounded-full text-[11px] font-bold border border-[#EFE1BA] mb-2 capitalize">
          <span className="w-2 h-2 rounded-full bg-[#8A6715]"></span>
          {orderStatus} · not live
        </div>
        <p className="text-[10px] text-[#8C7A6D]">Last update recorded on this device</p>
      </div>

      {/* Local Save Box */}
      <div className="mt-4 p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs space-y-1">
        <div className="font-bold text-[#221611]">We saved your order locally</div>
        <p className="text-[11px] text-[#69584B] leading-relaxed">
          Keep this screen open. Show your pickup number when you get to the stall.
        </p>
      </div>

      {/* Retry Button */}
      <div className="mt-8 pt-4 space-y-2">
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="w-full py-4 px-6 bg-[#221611] text-white hover:bg-[#36251E] rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {retrying ? (
            <>
              <span className="animate-spin text-sm">⟳</span>
              <span>Reconnecting...</span>
            </>
          ) : (
            <span>Try reconnecting</span>
          )}
        </button>
        <p className="text-xs text-center text-[#8C7A6D]">
          Your order isn't lost. We'll refresh automatically once you're back online.
        </p>
      </div>
    </div>
  );
};
