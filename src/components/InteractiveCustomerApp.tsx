import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';
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

export const InteractiveCustomerApp: React.FC = () => {
  const { isOffline } = useCafe();
  const [screen, setScreen] = useState<
    'menu' | 'customize' | 'cart' | 'checkout' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  >('menu');

  // If user simulated offline or network lost, render Screen 11 Connection Lost!
  if (isOffline) {
    return (
      <div className="flex justify-center p-6 bg-[#F5F5F5] min-h-[calc(100vh-64px)] overflow-auto">
        <Screen11ConnectionLost onRetry={() => setScreen('menu')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#F5F5F5] min-h-[calc(100vh-64px)] overflow-auto">
      {/* Quick customer navigation indicator / status bar */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-semibold text-[#8C7A6D] max-w-md">
        <button
          onClick={() => setScreen('menu')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${screen === 'menu' ? 'bg-[#221611] text-white' : 'hover:bg-[#EAE5DE]'}`}
        >
          1. Menu
        </button>
        <button
          onClick={() => setScreen('customize')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${screen === 'customize' ? 'bg-[#221611] text-white' : 'hover:bg-[#EAE5DE]'}`}
        >
          2. Customize
        </button>
        <button
          onClick={() => setScreen('cart')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${screen === 'cart' ? 'bg-[#221611] text-white' : 'hover:bg-[#EAE5DE]'}`}
        >
          3. Cart
        </button>
        <button
          onClick={() => setScreen('checkout')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${screen === 'checkout' ? 'bg-[#221611] text-white' : 'hover:bg-[#EAE5DE]'}`}
        >
          4. Checkout
        </button>
        <button
          onClick={() => setScreen('pending')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${screen === 'pending' ? 'bg-[#221611] text-white' : 'hover:bg-[#EAE5DE]'}`}
        >
          5. Pending
        </button>
        <button
          onClick={() => setScreen('confirmed')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${screen === 'confirmed' ? 'bg-[#221611] text-white' : 'hover:bg-[#EAE5DE]'}`}
        >
          6. Confirmed
        </button>
        <button
          onClick={() => setScreen('ready')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${screen === 'ready' ? 'bg-[#221611] text-white' : 'hover:bg-[#EAE5DE]'}`}
        >
          8. Ready
        </button>
      </div>

      {/* Screen Frame */}
      <div className="transition-all duration-200">
        {screen === 'menu' && (
          <Screen01Menu
            onSelectItem={() => setScreen('customize')}
            onViewCart={() => setScreen('cart')}
          />
        )}

        {screen === 'customize' && (
          <Screen02Customize
            onBack={() => setScreen('menu')}
            onAddToCart={() => setScreen('cart')}
          />
        )}

        {screen === 'cart' && (
          <Screen03Cart
            onBack={() => setScreen('menu')}
            onAddMore={() => setScreen('menu')}
            onCheckout={() => setScreen('checkout')}
          />
        )}

        {screen === 'checkout' && (
          <Screen04Checkout
            onBack={() => setScreen('cart')}
            onPlaceOrder={() => setScreen('pending')}
          />
        )}

        {screen === 'pending' && (
          <Screen05Pending
            onSimulateAccept={() => setScreen('confirmed')}
          />
        )}

        {screen === 'confirmed' && (
          <Screen06Confirmed
            onNext={() => setScreen('preparing')}
          />
        )}

        {screen === 'preparing' && (
          <Screen07Preparing
            onNext={() => setScreen('ready')}
          />
        )}

        {screen === 'ready' && (
          <Screen08Ready
            onNext={() => setScreen('completed')}
          />
        )}

        {screen === 'completed' && (
          <Screen09Completed
            onBackToMenu={() => setScreen('menu')}
          />
        )}

        {screen === 'cancelled' && (
          <Screen10Cancelled
            onBackToMenu={() => setScreen('menu')}
          />
        )}
      </div>
    </div>
  );
};
