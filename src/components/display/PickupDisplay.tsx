import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Sparkles, Clock, Maximize, Store } from 'lucide-react';

export const PickupDisplay: React.FC = () => {
  const { orders } = useCafe();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'pending');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex-1 bg-[#1A120E] text-[#FAF8F5] min-h-screen p-6 sm:p-10 flex flex-col font-sans select-none">
      {/* Top Banner */}
      <header className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl font-display text-white border border-white/10">
            a.
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight font-display text-white">aight. cafe</h1>
            <p className="text-xs text-[#C4B4A5] tracking-widest uppercase font-semibold">
              Pickup Status Display · Silangan, San Mateo, Rizal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-white tracking-wider">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-[#A8988B]">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 text-white transition-colors"
            title="Toggle TV Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Board Grid: Preparing vs Ready */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {/* LEFT COLUMN: PREPARING */}
        <div className="bg-white/5 rounded-[36px] p-8 border border-white/10 flex flex-col backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h2 className="text-xl font-bold uppercase tracking-wider text-[#EADCCE]">
                Preparing
              </h2>
            </div>
            <span className="text-sm font-semibold px-3 py-1 bg-white/10 rounded-full text-[#D4C3B4]">
              {preparingOrders.length} in queue
            </span>
          </div>

          {preparingOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40">
              <Clock className="w-12 h-12 mb-3 stroke-[1.5]" />
              <p className="text-sm">No orders currently preparing</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-min">
              {preparingOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 text-center transition-all"
                >
                  <div className="text-3xl font-black font-display text-white tracking-tight">
                    {order.code}
                  </div>
                  <div className="text-xs text-[#C4B4A5] truncate mt-1">
                    {order.customerName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: READY FOR PICKUP (HIGH CONTRAST) */}
        <div className="bg-[#241A15] rounded-[36px] p-8 border-2 border-emerald-500/40 flex flex-col shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 z-10">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-emerald-400 animate-ping"></span>
              <h2 className="text-xl font-black uppercase tracking-wider text-emerald-400 font-display">
                Now Serving / Ready
              </h2>
            </div>
            <span className="text-sm font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              {readyOrders.length} Ready
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40 z-10">
              <Store className="w-12 h-12 mb-3 stroke-[1.5]" />
              <p className="text-sm">Orders will appear here once ready for pickup</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 auto-rows-min z-10">
              {readyOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white text-[#241A15] rounded-3xl p-6 text-center shadow-xl border border-white/20 transform hover:scale-[1.02] transition-transform animate-in fade-in zoom-in-95 duration-300"
                >
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 py-1 px-3 rounded-full inline-block mb-2">
                    Pick Up Now
                  </div>
                  <div className="text-5xl font-black font-display tracking-tight text-[#1E140E]">
                    {order.code}
                  </div>
                  <div className="text-sm font-semibold text-[#5C4A3E] mt-1.5">
                    {order.customerName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <footer className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A8988B]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Please present your order code at the pickup bar when called</span>
        </div>
        <div>aight. cafe display system · real-time queue</div>
      </footer>
    </div>
  );
};
