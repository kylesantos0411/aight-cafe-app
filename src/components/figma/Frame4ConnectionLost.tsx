import React, { useState } from 'react';

export const Frame4ConnectionLost: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      if (onRetry) onRetry();
    }, 1000);
  };

  return (
    <div className="w-[340px] min-h-[680px] bg-[#FAF8F5] text-[#221611] rounded-[36px] p-5 flex flex-col shadow-xl border border-[#ECE5DC] relative overflow-hidden font-sans">
      {/* Status Bar */}
      <div className="flex justify-between items-center text-[11px] font-semibold text-[#221611] pb-2 pt-1 px-1">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 opacity-80">
          <div className="w-3.5 h-2 border border-current rounded-xs"></div>
        </div>
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 pt-1 border-b border-[#ECE5DC]">
        <div className="flex items-center gap-1">
          <span className="font-bold text-sm tracking-tight">aight.</span>
          <span className="text-[10px] text-[#8C7A6D] ml-0.5">· cafe</span>
        </div>
        <span className="text-xs font-semibold text-[#5E4D40]">Your order</span>
      </div>

      {/* Top Alert Banner */}
      <div className="mt-4 p-3 bg-[#FAF2DE] rounded-xl border border-[#EFE1BA] text-[11px] leading-relaxed">
        <div className="font-bold text-[#8A6715] flex items-center gap-1.5">
          <span>⚡</span>
          You're offline
        </div>
        <p className="text-[10px] text-[#7A6025] mt-0.5 leading-normal">
          Details will refresh once you're back online. Your order ticket is still valid.
        </p>
      </div>

      {/* Headline */}
      <div className="mt-4 text-center">
        <h1 className="text-2xl font-black tracking-tight text-[#221611]">
          Your order is still yours.
        </h1>
        <p className="text-[11px] text-[#7A695C] mt-1.5 leading-snug">
          We need to renew signal. We can't refresh for new updates right now, but here's the last known status:
        </p>
      </div>

      {/* Code Card */}
      <div className="mt-4 bg-white rounded-2xl p-5 text-center border border-[#E8DFD5] shadow-xs">
        <span className="text-[9px] uppercase tracking-widest text-[#9A877A] font-semibold">
          LAST KNOWN STATUS
        </span>
        <div className="text-5xl font-black tracking-tight my-1.5 text-[#221611] font-mono">
          A042
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF2DE] text-[#8A6715] rounded-full text-[10px] font-bold border border-[#EFE1BA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8A6715]"></span>
          Preparing your order
        </div>
      </div>

      {/* Bottom Button */}
      <div className="mt-auto pt-4 space-y-3">
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="w-full py-3 bg-[#221611] hover:bg-[#36251E] text-[#FAF8F5] rounded-full font-semibold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>↻</span>
          <span>{retrying ? 'Connecting...' : 'Retry connection'}</span>
        </button>

        <p className="text-[10px] text-center text-[#8C7A6D] px-2 leading-relaxed">
          Show this screen at pickup or let staff know your name. Live updates will appear when reconnected.
        </p>
      </div>

      {/* Home indicator */}
      <div className="h-3 flex items-center justify-center pt-2">
        <div className="w-24 h-1 bg-[#221611]/25 rounded-full"></div>
      </div>
    </div>
  );
};
