import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { CustomerMenu } from './CustomerMenu';
import { CustomerCart } from './CustomerCart';
import { OrderStatusReady } from './OrderStatusReady';
import { OrderStatusCompleted } from './OrderStatusCompleted';
import { OrderStatusCancelled } from './OrderStatusCancelled';
import { OrderStatusOffline } from './OrderStatusOffline';
import { Wifi, Battery, Smartphone, Maximize2 } from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const {
    customerScreen,
    setCustomerScreen,
    isMobileFrame,
    setIsMobileFrame,
    isOffline,
  } = useCafe();

  // If offline is toggled on, show offline screen
  const effectiveScreen = isOffline ? 'status-offline' : customerScreen;

  const renderContent = () => {
    switch (effectiveScreen) {
      case 'menu':
        return <CustomerMenu />;
      case 'cart':
        return <CustomerCart />;
      case 'status-ready':
        return <OrderStatusReady />;
      case 'status-completed':
        return <OrderStatusCompleted />;
      case 'status-cancelled':
        return <OrderStatusCancelled />;
      case 'status-offline':
        return <OrderStatusOffline />;
      default:
        return <CustomerMenu />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] p-2 sm:p-6">
      {/* Quick Screen Switcher Toolbar (Figma Flow Switcher) */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-[#EAE3DA] shadow-xs text-xs">
        <span className="text-[11px] font-semibold text-[#8A7667] px-2">Figma Screens:</span>
        {[
          { id: 'status-ready', label: '1. Order Ready (A042)' },
          { id: 'status-completed', label: '2. Completed' },
          { id: 'status-cancelled', label: '3. Cancelled (A037)' },
          { id: 'status-offline', label: '4. Connection Lost' },
          { id: 'menu', label: 'Menu & Customize' },
          { id: 'cart', label: 'Cart Checkout' },
        ].map(screen => (
          <button
            key={screen.id}
            onClick={() => {
              setCustomerScreen(screen.id as any);
            }}
            className={`px-3 py-1 rounded-xl font-medium transition-all ${
              customerScreen === screen.id
                ? 'bg-[#241812] text-white shadow-xs'
                : 'text-[#6B5A4E] hover:bg-[#F2ECE3]'
            }`}
          >
            {screen.label}
          </button>
        ))}

        <div className="h-4 w-px bg-[#EAE3DA] mx-1" />

        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className="flex items-center gap-1 px-2.5 py-1 text-[#6B5A4E] hover:bg-[#F2ECE3] rounded-xl font-medium text-[11px]"
          title="Toggle phone frame"
        >
          {isMobileFrame ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container: Phone Frame or Responsive Viewport */}
      {isMobileFrame ? (
        <div className="relative w-full max-w-[390px] h-[780px] bg-black rounded-[48px] p-3 shadow-2xl ring-1 ring-black/10 ring-offset-4 ring-offset-[#F6F4F0] flex flex-col overflow-hidden">
          {/* Speaker / Dynamic Island Bezel */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end pr-2 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] mr-1"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#111] ring-1 ring-[#333]"></div>
          </div>

          {/* Internal Phone Viewport */}
          <div className="relative w-full h-full bg-[#FAF8F5] rounded-[38px] overflow-hidden flex flex-col">
            {/* Status Bar */}
            <div className="h-10 px-6 pt-2 flex items-center justify-between text-xs font-semibold text-[#241A15] select-none shrink-0 z-40 bg-[#FAF8F5]">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 opacity-80">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Scrollable Screen Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
              {renderContent()}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="h-4 flex items-center justify-center shrink-0 bg-[#FAF8F5] pb-1">
              <div className="w-28 h-1 bg-[#241812]/30 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md min-h-[700px] bg-[#FAF8F5] rounded-3xl border border-[#EAE3DA] shadow-xl overflow-hidden flex flex-col">
          {renderContent()}
        </div>
      )}
    </div>
  );
};
