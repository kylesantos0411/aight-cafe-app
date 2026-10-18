import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { menuService } from '../services/menuService';
import type { MenuItem } from '../types/cafe';

export const CustomerMenuView: React.FC = () => {
  const navigate = useNavigate();
  const { cartCount } = useCafe();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'Coffee' | 'Non-Coffee' | 'Matcha' | 'Pastries'>('Coffee');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuService.getMenu().then(items => {
      setMenuItems(items);
      setLoading(false);
    });
  }, []);

  const filteredItems = menuItems.filter(item => {
    if (activeCategory === 'Coffee') return item.category === 'Coffee';
    if (activeCategory === 'Non-Coffee') return item.category === 'Cold Brew' || item.name.toLowerCase().includes('chocolate');
    if (activeCategory === 'Matcha') return item.category === 'Tea & Matcha' || item.name.toLowerCase().includes('matcha');
    if (activeCategory === 'Pastries') return item.category === 'Pastries';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans flex flex-col selection:bg-[#221611] selection:text-[#FAF8F5]">
      {/* Main Content Container - fluid on mobile, comfortable max-w-4xl on desktop */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-5 md:py-8 flex-1 flex flex-col">
        {/* Brand Header */}
        <header className="flex items-center justify-between pb-6 border-b border-[#ECE5DC]/80">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-black text-2xl sm:text-3xl tracking-tight text-[#221611]">aight .</span>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2.5 py-0.5 rounded-full">
              CAFE
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/account/orders"
              className="text-xs font-semibold text-[#8C7A6D] hover:text-[#221611] bg-[#F0EDE8] hover:bg-[#E8E2DA] px-3.5 py-1.5 rounded-full transition-colors"
            >
              My orders
            </Link>

            <button
              onClick={() => navigate('/cart')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#DFD6CC] flex items-center justify-center text-[#5C4A3E] relative hover:bg-[#F2EDE4] active:scale-95 transition-all shadow-xs cursor-pointer"
              title="View Cart"
            >
              <span className="text-base">👜</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#221611] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Store Status & Announcement Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-xs font-medium">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ECEAE3] text-[#4A4036] rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Open until 6 PM
          </div>
          <span className="text-[#8C7A6D] text-xs font-medium">Pickup only · The Courtyard</span>
        </div>

        {/* Hero Section */}
        <div className="mt-6 md:mt-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#221611] leading-tight">
            Good coffee.<br />Your kind of day.
          </h1>
          <p className="text-xs sm:text-sm text-[#7A695C] mt-2.5 flex items-center gap-1.5 font-medium">
            <span>📍</span>
            Aight popup · The Courtyard, Manila
          </p>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-6 sm:gap-8 mt-7 pb-2.5 border-b border-[#ECE5DC] text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar">
          {(['Coffee', 'Non-Coffee', 'Matcha', 'Pastries'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-2 -mb-2.5 transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'text-[#221611] border-b-2 border-[#221611] font-bold text-sm sm:text-base'
                  : 'text-[#8C7A6D] hover:text-[#221611]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid - 2 cols on mobile, 3 on tablet, 4 on desktop */}
        <div className="mt-6 sm:mt-8 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#221611]">{activeCategory}</h2>
            <span className="text-xs text-[#8C7A6D]">Made fresh to order</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-[#8C7A6D]">Loading fresh menu...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/customize/${item.id}`)}
                  className="bg-white rounded-2xl p-3 border border-[#ECE5DC] hover:border-[#CFC3B5] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-[#EAE3DA]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="mt-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#221611] leading-snug group-hover:text-[#6E3C1B] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#7A695C] line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-[#F2ECE3] flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#221611]">₱{item.price}</span>
                      <span className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#DFD6CC] text-[#221611] text-xs font-bold flex items-center justify-center group-hover:bg-[#221611] group-hover:text-white transition-colors">
                        +
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Cart Pill if cart has items */}
        {cartCount > 0 && (
          <div className="sticky bottom-6 mt-8 z-20 max-w-md mx-auto w-full">
            <button
              onClick={() => navigate('/cart')}
              className="w-full py-4 px-6 bg-[#221611] hover:bg-[#36251E] text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer"
            >
              <span>View Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
              <span className="flex items-center gap-1">Proceed to Checkout →</span>
            </button>
          </div>
        )}

        {/* Clean Customer Footer */}
        <footer className="mt-12 pt-6 border-t border-[#ECE5DC] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8C7A6D]">
          <div>
            <span className="font-bold text-[#221611]">Aight Cafe</span> · The Courtyard · All orders for pickup only
          </div>
          <div className="flex items-center gap-4">
            <Link to="/account/orders" className="hover:text-[#221611] transition-colors underline-offset-2 hover:underline">
              My orders
            </Link>
            <Link to="/login" className="hover:text-[#221611] transition-colors underline-offset-2 hover:underline">
              Sign in
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};
