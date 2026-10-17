import React from 'react';
import { useCafe } from '../context/CafeContext';
import {
  Smartphone,
  LayoutDashboard,
  Tv,
  Wifi,
  WifiOff,
  RotateCcw
} from 'lucide-react';

export const NavigationDock: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    isOffline,
    toggleOffline,
    resetDemoData,
  } = useCafe();

  return (
    <header className="sticky top-0 z-50 bg-[#241812] text-white border-b border-[#38261D] shadow-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#241812] font-display font-black text-base flex items-center justify-center">
            a.
          </div>
          <div>
            <span className="font-display font-black text-lg tracking-tight text-white">aight.</span>
            <span className="text-[10px] font-bold tracking-widest text-[#C4B4A5] ml-1.5 uppercase bg-white/10 px-2 py-0.5 rounded-md">
              Figma to Web
            </span>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('customer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              viewMode === 'customer'
                ? 'bg-[#FAF8F5] text-[#241812] shadow-sm'
                : 'text-[#DDD2C7] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer App</span>
          </button>

          <button
            onClick={() => setViewMode('staff')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              viewMode === 'staff'
                ? 'bg-[#FAF8F5] text-[#241812] shadow-sm'
                : 'text-[#DDD2C7] hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Staff Portal</span>
          </button>

          <button
            onClick={() => setViewMode('display')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              viewMode === 'display'
                ? 'bg-[#FAF8F5] text-[#241812] shadow-sm'
                : 'text-[#DDD2C7] hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Pickup TV Screen</span>
          </button>
        </div>

        {/* Quick Tools & Simulation Controls */}
        <div className="flex items-center gap-2">
          {/* Offline simulator toggle */}
          <button
            onClick={toggleOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-white/5 text-[#C4B4A5] border-white/10 hover:text-white hover:bg-white/10'
            }`}
            title="Simulate offline connection lost (Figma screen 4)"
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'Offline Active' : 'Test Offline'}</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={resetDemoData}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-[#C4B4A5] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            title="Reset to default Figma sample orders"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
