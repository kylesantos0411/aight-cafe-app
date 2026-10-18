import React, { useState } from 'react';
import { AdminPosView } from './AdminPosView';
import { Screen14StallQueue } from '../components/figma-screens/Screen14StallQueue';
import { Screen13StaffOrders } from '../components/figma-screens/Screen13StaffOrders';
import { CustomerCardTrackerView } from './CustomerCardTrackerView';

export const StallTestSplitView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'split' | 'pos' | 'queue' | 'kitchen' | 'card'>('split');
  const [testCardNumber, setTestCardNumber] = useState<number>(1);

  return (
    <div className="min-h-screen bg-[#18110D] text-white flex flex-col font-sans">
      {/* Top Testing Header Bar */}
      <header className="bg-[#221611] border-b border-[#3D2C24] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#221611] font-black text-sm flex items-center justify-center shadow-xs">
            a.
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#FAF8F5] tracking-tight">aight .</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                Stall Testing Studio
              </span>
            </div>
            <p className="text-[10px] text-[#A8988B]">
              Simulate Cashier POS, Counter TV Queue & Customer Card Tracker together
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'split' ? 'bg-[#FAF8F5] text-[#221611] shadow-xs' : 'text-[#C4B4A5] hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>Split View (POS + TV)</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'pos' ? 'bg-[#FAF8F5] text-[#221611] shadow-xs' : 'text-[#C4B4A5] hover:text-white'
            }`}
          >
            <span>💻</span>
            <span>1. Cashier POS</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'queue' ? 'bg-[#FAF8F5] text-[#221611] shadow-xs' : 'text-[#C4B4A5] hover:text-white'
            }`}
          >
            <span>📺</span>
            <span>2. Display Queuing (TV)</span>
          </button>

          <button
            onClick={() => setActiveTab('kitchen')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'kitchen' ? 'bg-[#FAF8F5] text-[#221611] shadow-xs' : 'text-[#C4B4A5] hover:text-white'
            }`}
          >
            <span>🍳</span>
            <span>3. Kitchen / Staff Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'card' ? 'bg-[#FAF8F5] text-[#221611] shadow-xs' : 'text-[#C4B4A5] hover:text-white'
            }`}
          >
            <span>🏷️</span>
            <span>4. Customer Card #{testCardNumber}</span>
          </button>
        </div>

        {/* Card selector for simulator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#A8988B] text-[11px]">Card Simulator:</span>
          <select
            value={testCardNumber}
            onChange={e => setTestCardNumber(Number(e.target.value))}
            className="bg-black/50 border border-white/20 text-white rounded-lg px-2 py-1 text-xs font-mono"
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>
                Card #{num < 10 ? `0${num}` : num}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col overflow-auto">
        {activeTab === 'split' && (
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-0 overflow-auto">
            {/* Left Column: Cashier POS */}
            <div className="xl:col-span-7 border-r border-[#3D2C24] bg-[#FAF8F5] text-[#221611] overflow-auto">
              <div className="sticky top-0 bg-[#221611] text-[#FAF8F5] px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-[#3D2C24] z-10">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  SCREEN 1: CASHIER POS (Counter Tablet)
                </span>
                <span className="text-[11px] font-mono text-[#C4B4A5]">Route: /admin/pos</span>
              </div>
              <AdminPosView />
            </div>

            {/* Right Column: Stall TV Queue Display */}
            <div className="xl:col-span-5 bg-[#221611] text-white flex flex-col overflow-auto">
              <div className="sticky top-0 bg-[#18110D] text-[#FAF8F5] px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-[#3D2C24] z-10">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  SCREEN 2: DISPLAY QUEUING (Customer TV / Monitor)
                </span>
                <span className="text-[11px] font-mono text-[#C4B4A5]">Route: /queue</span>
              </div>
              <div className="flex-1 p-4 md:p-6 overflow-auto">
                <Screen14StallQueue />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pos' && (
          <div className="flex-1 bg-[#FAF8F5] text-[#221611] overflow-auto">
            <AdminPosView />
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="flex-1 bg-[#221611] flex items-center justify-center p-6 overflow-auto">
            <Screen14StallQueue />
          </div>
        )}

        {activeTab === 'kitchen' && (
          <div className="flex-1 bg-[#FAF8F5] text-[#221611] p-4 md:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Screen13StaffOrders />
            </div>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="flex-1 bg-[#FAF8F5] text-[#221611] overflow-auto">
            <CustomerCardTrackerView />
          </div>
        )}
      </main>
    </div>
  );
};
