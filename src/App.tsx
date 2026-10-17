import React, { useState } from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { FigmaArtboardView } from './components/FigmaArtboardView';
import { InteractiveCustomerApp } from './components/InteractiveCustomerApp';
import { Screen13StaffOrders } from './components/figma-screens/Screen13StaffOrders';
import { Screen14StallQueue } from './components/figma-screens/Screen14StallQueue';
import { PwaInstallModal } from './components/PwaInstallModal';

const MainShell: React.FC = () => {
  const { viewMode, setViewMode, isOffline, toggleOffline, resetDemoData } = useCafe();
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans select-none text-[#221611]">
      {/* Top Application Switcher Bar */}
      <header className="sticky top-0 z-50 bg-[#221611] text-[#FAF8F5] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-[#3D2C24]">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#221611] font-black text-sm flex items-center justify-center">
            a.
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white">aight .</span>
            <span className="text-[9px] font-bold tracking-widest text-[#C4B4A5] bg-white/10 px-2 py-0.5 rounded-full uppercase">
              Production
            </span>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-white/10 p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            onClick={() => setViewMode('artboards')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'artboards' ? 'bg-[#FAF8F5] text-[#221611] shadow-xs' : 'text-[#D9CEC5] hover:text-white'
            }`}
          >
            <span>❖</span>
            <span>15 Figma Artboards</span>
          </button>

          <button
            onClick={() => setViewMode('customer')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'customer' ? 'bg-[#FAF8F5] text-[#221611] shadow-xs' : 'text-[#D9CEC5] hover:text-white'
            }`}
          >
            <span>📱</span>
            <span>Customer App</span>
          </button>

          <button
            onClick={() => setViewMode('staff')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'staff' ? 'bg-[#FAF8F5] text-[#221611] shadow-xs' : 'text-[#D9CEC5] hover:text-white'
            }`}
          >
            <span>📋</span>
            <span>Staff Orders (1440px)</span>
          </button>

          <button
            onClick={() => setViewMode('display')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'display' ? 'bg-[#FAF8F5] text-[#221611] shadow-xs' : 'text-[#D9CEC5] hover:text-white'
            }`}
          >
            <span>📺</span>
            <span>Stall Queue TV</span>
          </button>
        </div>

        {/* Quick Tools */}
        <div className="flex items-center gap-2 text-xs">
          {/* Offline Simulator */}
          <button
            onClick={toggleOffline}
            className={`px-3 py-1.5 rounded-lg font-semibold border transition-all flex items-center gap-1.5 ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-white/5 text-[#C4B4A5] border-white/10 hover:text-white hover:bg-white/10'
            }`}
            title="Simulate connection lost (Screen 11)"
          >
            <span>⚡</span>
            <span>{isOffline ? 'Offline Active' : 'Test Offline'}</span>
          </button>

          {/* Reset Demo */}
          <button
            onClick={resetDemoData}
            className="px-2.5 py-1.5 rounded-lg text-[#C4B4A5] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 font-medium transition-colors"
            title="Reset to default Figma sample orders"
          >
            Reset Demo
          </button>

          {/* Install PWA */}
          <button
            onClick={() => setIsInstallOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#523E32] hover:bg-[#685041] text-white font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Install PWA</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-auto">
        {viewMode === 'artboards' && <FigmaArtboardView />}
        {viewMode === 'customer' && <InteractiveCustomerApp />}
        {viewMode === 'staff' && (
          <div className="flex justify-center p-8 bg-[#F5F5F5] min-h-[calc(100vh-60px)] overflow-auto">
            <Screen13StaffOrders
              onOpenQueueDisplay={() => setViewMode('display')}
              onSignOut={() => setViewMode('customer')}
            />
          </div>
        )}
        {viewMode === 'display' && (
          <div className="flex justify-center p-8 bg-[#F5F5F5] min-h-[calc(100vh-60px)] overflow-auto">
            <Screen14StallQueue />
          </div>
        )}
      </main>

      {/* PWA Guidance Modal */}
      <PwaInstallModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <CafeProvider>
      <MainShell />
    </CafeProvider>
  );
}
