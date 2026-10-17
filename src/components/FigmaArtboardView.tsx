import React, { useState } from 'react';
import { Screen01Menu } from './figma-screens/Screen01Menu';
import { Screen02Customize } from './figma-screens/Screen02Customize';
import { Screen03Cart } from './figma-screens/Screen03Cart';
import { Screen04Checkout } from './figma-screens/Screen04Checkout';
import { Screen05Pending } from './figma-screens/Screen05Pending';
import { Screen06Confirmed } from './figma-screens/Screen06Confirmed';
import { Screen07Preparing } from './figma-screens/Screen07Preparing';
import { Screen08Ready } from './figma-screens/Screen08Ready';
import { Screen09Completed } from './figma-screens/Screen09Completed';
import { Screen10Cancelled } from './figma-screens/Screen10Cancelled';
import { Screen11ConnectionLost } from './figma-screens/Screen11ConnectionLost';
import { Screen12StaffSignIn } from './figma-screens/Screen12StaffSignIn';
import { Screen13StaffOrders } from './figma-screens/Screen13StaffOrders';
import { Screen14StallQueue } from './figma-screens/Screen14StallQueue';
import { Screen15HandoffDoc } from './figma-screens/Screen15HandoffDoc';

export const FigmaArtboardView: React.FC = () => {
  const [zoom, setZoom] = useState<number>(0.65);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number | null>(null);

  const screens = [
    { title: 'Menu · Aight Cafe', component: Screen01Menu },
    { title: 'Customize · Iced oat latte', component: Screen02Customize },
    { title: 'Cart · Review order', component: Screen03Cart },
    { title: 'Checkout · Pay at pickup', component: Screen04Checkout },
    { title: 'Pending · Awaiting acceptance', component: Screen05Pending },
    { title: 'Confirmed · Order A042', component: Screen06Confirmed },
    { title: 'Preparing · Order A042', component: Screen07Preparing },
    { title: 'Ready for pickup · Order A042', component: Screen08Ready },
    { title: 'Completed · Order A042', component: Screen09Completed },
    { title: 'Cancelled · Order A037', component: Screen10Cancelled },
    { title: 'Connection lost · Order A042', component: Screen11ConnectionLost },
    { title: 'Staff sign in · Protected access', component: Screen12StaffSignIn },
    { title: 'Staff orders · Pickup management', component: Screen13StaffOrders },
    { title: 'Stall queue · Now serving A042', component: Screen14StallQueue },
    { title: 'Design handoff · Dependencies and order logic', component: Screen15HandoffDoc },
  ];

  const handleZoom = (delta: number) => {
    setZoom(z => Math.max(0.2, Math.min(1.5, Math.round((z + delta) * 100) / 100)));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F5F5] min-h-screen text-[#221611] overflow-hidden select-none">
      {/* Figma Top Toolbar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-[#E5E5E5] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#221611]">
            <span className="w-5 h-5 bg-[#221611] text-white rounded flex items-center justify-center text-xs">❖</span>
            <span>AIGHT CAFE APP.fig</span>
          </div>
          <span className="text-xs text-[#8C7A6D] bg-[#F0EDE8] px-2.5 py-0.5 rounded-full font-medium">
            15 Frames Exact from Figma
          </span>
        </div>

        {/* Screen quick jump buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-2xl py-1 no-scrollbar text-xs">
          <button
            onClick={() => setActiveScreenIndex(null)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeScreenIndex === null
                ? 'bg-[#221611] text-white'
                : 'text-[#6E5D50] hover:bg-[#EAE5DE]'
            }`}
          >
            All 15 Screens (Canvas)
          </button>
          {screens.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveScreenIndex(idx)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeScreenIndex === idx
                  ? 'bg-[#221611] text-white font-bold'
                  : 'text-[#7A695C] hover:bg-[#EAE5DE]'
              }`}
            >
              {idx + 1}. {s.title.split('·')[0].trim()}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 bg-[#F0EDE8] px-2 py-1 rounded-xl text-xs font-semibold text-[#544337]">
          <button
            onClick={() => handleZoom(-0.1)}
            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors"
            title="Zoom out"
          >
            –
          </button>
          <span className="w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => handleZoom(0.1)}
            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1.0)}
            className="px-2 py-0.5 hover:bg-white rounded-md transition-colors text-[10px]"
          >
            100%
          </button>
          <button
            onClick={() => setZoom(0.5)}
            className="px-2 py-0.5 hover:bg-white rounded-md transition-colors text-[10px]"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Main Artboard Canvas View */}
      {activeScreenIndex === null ? (
        <div className="flex-1 overflow-auto p-12 bg-[#F5F5F5] min-h-[calc(100vh-60px)]">
          <div
            className="flex items-start gap-16 transition-transform duration-150 origin-top-left"
            style={{ transform: `scale(${zoom})`, width: 'max-content' }}
          >
            {screens.map((screen, idx) => {
              const ScreenComponent = screen.component;
              return (
                <div key={idx} className="flex flex-col gap-3 group">
                  {/* Figma Frame Title on top */}
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8C7A6D] px-2 group-hover:text-[#221611] transition-colors">
                    <span className="text-[11px] font-mono opacity-60">#{idx + 1}</span>
                    <span className="tracking-tight">{screen.title}</span>
                  </div>

                  {/* Frame Body */}
                  <div
                    onClick={() => {
                      if (zoom < 0.8) setZoom(0.9);
                    }}
                    className="cursor-pointer transition-shadow hover:ring-2 hover:ring-[#221611]/30 rounded-[44px]"
                  >
                    <ScreenComponent />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Single Screen Inspection Mode */
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F5F5F5] overflow-auto">
          <div className="mb-4 flex items-center justify-between w-full max-w-4xl text-xs font-bold text-[#7A695C]">
            <button
              onClick={() => setActiveScreenIndex(null)}
              className="px-3 py-1.5 bg-white border border-[#DFD6CC] text-[#221611] rounded-xl hover:bg-[#FAF8F5] transition-colors"
            >
              ← Back to All Frames
            </button>
            <span className="text-sm text-[#221611]">{screens[activeScreenIndex].title}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={activeScreenIndex === 0}
                onClick={() => setActiveScreenIndex(i => Math.max(0, (i || 0) - 1))}
                className="px-2.5 py-1 bg-white border border-[#DFD6CC] rounded-lg disabled:opacity-40"
              >
                ‹ Prev
              </button>
              <button
                disabled={activeScreenIndex === screens.length - 1}
                onClick={() => setActiveScreenIndex(i => Math.min(screens.length - 1, (i || 0) + 1))}
                className="px-2.5 py-1 bg-white border border-[#DFD6CC] rounded-lg disabled:opacity-40"
              >
                Next ›
              </button>
            </div>
          </div>

          <div className="my-auto transform scale-95 transition-transform">
            {React.createElement(screens[activeScreenIndex].component as React.ComponentType<any>, {
              onBack: () => setActiveScreenIndex(i => Math.max(0, (i || 0) - 1)),
              onNext: () => setActiveScreenIndex(i => Math.min(screens.length - 1, (i || 0) + 1)),
              onSelectItem: () => setActiveScreenIndex(1),
              onViewCart: () => setActiveScreenIndex(2),
              onCheckout: () => setActiveScreenIndex(3),
              onPlaceOrder: () => setActiveScreenIndex(4),
              onSimulateAccept: () => setActiveScreenIndex(5),
              onBackToMenu: () => setActiveScreenIndex(0),
              onOpenQueueDisplay: () => setActiveScreenIndex(13),
              onSignOut: () => setActiveScreenIndex(11),
            })}
          </div>
        </div>
      )}
    </div>
  );
};
