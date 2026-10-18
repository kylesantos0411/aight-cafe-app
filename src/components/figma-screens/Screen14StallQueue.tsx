import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';

export const Screen14StallQueue: React.FC = () => {
  const { publicQueue } = useCafe();
  const [currentTime, setCurrentTime] = useState<string>('9:48 AM');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const readyItems = publicQueue.filter(q => q.status === 'ready');
  const preparingItems = publicQueue.filter(q => q.status === 'preparing');

  const nowServing = readyItems.length > 0 ? readyItems[0].queueNumber : null;
  const nextReadyList = readyItems.slice(1).map(q => q.queueNumber);
  const preparingList = preparingItems.map(q => q.queueNumber);

  return (
    <div className="w-full max-w-7xl min-h-[85vh] bg-[#FAF8F5] text-[#221611] rounded-3xl sm:rounded-[44px] p-6 sm:p-10 flex flex-col justify-between shadow-2xl border border-[#EAE3DA] font-sans relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center pb-6 border-b border-[#ECE5DC]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-[#221611]">aight .</span>
          <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2.5 py-1 rounded-full">
            CAFE
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-[#6E5D50]">
          <span>Silangan, San Mateo, Rizal · Pickup only</span>
          <span className="font-mono font-bold text-sm sm:text-base text-[#221611]">{currentTime}</span>
        </div>
      </div>

      {/* Main Grid: Left Giant Now Serving Card + Right Queue Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 my-auto items-stretch py-6">
        {/* Left Column: NOW SERVING */}
        <div className="lg:col-span-7 col-span-1 bg-[#221611] text-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 flex flex-col justify-between shadow-2xl shadow-black/20 relative overflow-hidden min-h-[380px] sm:min-h-[500px]">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              <span className={`w-2.5 h-2.5 rounded-full ${nowServing ? 'bg-emerald-400 animate-ping' : 'bg-[#A8988B]'}`}></span>
              NOW SERVING
            </div>
          </div>

          <div className="text-center my-auto py-6 sm:py-8">
            <div className={`font-black tracking-tight leading-none font-mono transition-all ${
              nowServing
                ? 'text-5xl sm:text-7xl lg:text-8xl text-[#FAF8F5]'
                : 'text-7xl sm:text-9xl text-white/20'
            }`}>
              {nowServing || '—'}
            </div>
          </div>

          <div className="space-y-1.5 text-center border-t border-white/10 pt-6">
            <p className="text-base sm:text-lg font-bold text-[#FAF8F5] flex items-center justify-center gap-2">
              <span>☕</span>
              {nowServing ? 'Your order is ready at the counter.' : 'All orders served.'}
            </p>
            <p className="text-xs text-[#CFC3B5]">
              {nowServing ? 'Please present your Queue Card (1–20) for pickup.' : 'Watch this screen when your Card (1–20) is called.'}
            </p>
          </div>
        </div>

        {/* Right Column: READY FOR PICKUP + PREPARING */}
        <div className="lg:col-span-5 col-span-1 flex flex-col justify-between gap-6">
          {/* Top Card: READY FOR PICKUP */}
          <div className="flex-1 bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 border border-[#ECE5DC] flex flex-col justify-between shadow-xs">
            <div className="text-xs font-bold tracking-widest uppercase text-[#8C7A6D]">
              READY FOR PICKUP
            </div>
            <div className="my-auto py-4">
              {nextReadyList.length > 0 ? (
                <div className="text-3xl sm:text-5xl font-black font-mono text-[#221611] tracking-wide break-words">
                  {nextReadyList.join('   ')}
                </div>
              ) : (
                <div className="text-5xl sm:text-6xl font-bold font-mono text-[#D6CCC2]">
                  —
                </div>
              )}
            </div>
            <p className="text-xs text-[#69584B] border-t border-[#F4EFEA] pt-4">
              {nextReadyList.length > 0 ? 'You can collect your order from our team.' : 'No other orders waiting for pickup.'}
            </p>
          </div>

          {/* Bottom Card: PREPARING */}
          <div className="flex-1 bg-[#F2EDE4] rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 border border-[#E5DDD2] flex flex-col justify-between shadow-xs">
            <div className="text-xs font-bold tracking-widest uppercase text-[#8C7A6D]">
              PREPARING
            </div>
            <div className="my-auto py-4">
              {preparingList.length > 0 ? (
                <div className="text-3xl sm:text-5xl font-black font-mono text-[#544337] tracking-wide break-words">
                  {preparingList.join('   ')}
                </div>
              ) : (
                <div className="text-5xl sm:text-6xl font-bold font-mono text-[#C4B7AA]">
                  —
                </div>
              )}
            </div>
            <p className="text-xs text-[#69584B] border-t border-[#E5DDD2] pt-4">
              {preparingList.length > 0 ? "We're working on your good stuff." : 'No orders currently in preparation.'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-6 border-t border-[#ECE5DC] text-xs text-[#8C7A6D]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>Live stall feed · Watch this screen for your pickup number</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span>🔇</span>
          <span>Sound off</span>
        </div>
      </div>
    </div>
  );
};
