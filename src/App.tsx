import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CafeProvider, useCafe } from './context/CafeContext';

// Real Application Route Views
import { CustomerMenuView } from './views/CustomerMenuView';
import { CustomerCustomizeView } from './views/CustomerCustomizeView';
import { CustomerCartView } from './views/CustomerCartView';
import { CustomerCheckoutView } from './views/CustomerCheckoutView';
import { CustomerOrderTrackerView } from './views/CustomerOrderTrackerView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { StaffLoginView } from './views/StaffLoginView';
import { StaffOrdersView } from './views/StaffOrdersView';
import { PublicQueueView } from './views/PublicQueueView';
import { DesignReferenceView } from './views/DesignReferenceView';

import { PwaInstallModal } from './components/PwaInstallModal';

const AppTopNav: React.FC = () => {
  const location = useLocation();
  const { isOffline, toggleOffline } = useCafe();
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // Hide the global banner on public queue TV display to keep it 100% full screen
  if (location.pathname === '/queue') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-[#221611]/95 backdrop-blur-md text-[#FAF8F5] px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#3D2C24] text-xs">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-6 h-6 rounded-md bg-[#FAF8F5] text-[#221611] font-black text-xs flex items-center justify-center">
            a.
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">aight.</span>
        </Link>

        <nav className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg text-[11px] font-semibold">
          <Link
            to="/"
            className={`px-2.5 py-1 rounded-md transition-colors ${
              location.pathname === '/' || location.pathname.startsWith('/customize') || location.pathname === '/cart' || location.pathname === '/checkout'
                ? 'bg-[#FAF8F5] text-[#221611]'
                : 'text-[#D9CEC5] hover:text-white'
            }`}
          >
            Menu
          </Link>

          <Link
            to="/staff/orders"
            className={`px-2.5 py-1 rounded-md transition-colors ${
              location.pathname.startsWith('/staff')
                ? 'bg-[#FAF8F5] text-[#221611]'
                : 'text-[#D9CEC5] hover:text-white'
            }`}
          >
            Staff Portal
          </Link>

          <Link
            to="/queue"
            className="px-2.5 py-1 rounded-md text-[#D9CEC5] hover:text-white transition-colors"
          >
            TV Queue
          </Link>

          <Link
            to="/account"
            className={`px-2.5 py-1 rounded-md transition-colors ${
              location.pathname === '/account'
                ? 'bg-[#FAF8F5] text-[#221611]'
                : 'text-[#D9CEC5] hover:text-white'
            }`}
          >
            Account
          </Link>

          <Link
            to="/design-reference"
            className={`px-2.5 py-1 rounded-md transition-colors ${
              location.pathname === '/design-reference'
                ? 'bg-[#FAF8F5] text-[#221611]'
                : 'text-[#D9CEC5] hover:text-white'
            }`}
          >
            ❖ Artboards
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleOffline}
          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all flex items-center gap-1 ${
            isOffline
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
              : 'bg-white/5 text-[#C4B4A5] border-white/10 hover:text-white'
          }`}
          title="Simulate network disconnect (Screen 11)"
        >
          <span>⚡</span>
          <span>{isOffline ? 'Offline Active' : 'Test Offline'}</span>
        </button>

        <button
          onClick={() => setIsInstallOpen(true)}
          className="px-2.5 py-1 rounded-md bg-[#523E32] hover:bg-[#685041] text-white font-semibold transition-colors flex items-center gap-1 text-[10px]"
        >
          <span>📥</span>
          <span>Install PWA</span>
        </button>
      </div>

      <PwaInstallModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />
    </header>
  );
};

export default function App() {
  return (
    <CafeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans text-[#221611]">
          <AppTopNav />
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Customer Flow */}
              <Route path="/" element={<CustomerMenuView />} />
              <Route path="/customize/:id" element={<CustomerCustomizeView />} />
              <Route path="/cart" element={<CustomerCartView />} />
              <Route path="/checkout" element={<CustomerCheckoutView />} />
              <Route path="/order/:token" element={<CustomerOrderTrackerView />} />
              <Route path="/account" element={<CustomerAccountView />} />

              {/* Staff Portal */}
              <Route path="/staff/login" element={<StaffLoginView />} />
              <Route path="/staff/orders" element={<StaffOrdersView />} />

              {/* Public Stall Queue TV Display */}
              <Route path="/queue" element={<PublicQueueView />} />

              {/* Development Design Reference */}
              <Route path="/design-reference" element={<DesignReferenceView />} />

              {/* Fallback to root */}
              <Route path="*" element={<CustomerMenuView />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CafeProvider>
  );
}
