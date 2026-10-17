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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-start p-4 md:p-8 font-sans">
      <div className="w-full max-w-[420px] bg-[#FAF8F5] text-[#221611] rounded-[44px] p-6 flex flex-col shadow-2xl border border-[#EAE3DA] relative overflow-hidden select-none">
        {/* Device Status Bar */}
        <div className="flex justify-between items-center text-[12px] font-semibold text-[#221611] pb-3 pt-1 px-2">
          <span>9:40</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">●●●</span>
            <div className="w-4 h-2.5 border border-current rounded-xs flex items-center p-0.5">
              <div className="w-full h-full bg-current rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-2xl tracking-tight text-[#221611]">aight .</span>
            <span className="text-[10px] font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
              CAFE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/staff/login"
              className="text-[10px] font-bold text-[#8C7A6D] hover:text-[#221611] bg-[#F0EDE8] px-2.5 py-1 rounded-full transition-colors"
            >
              Staff portal
            </Link>
            <button
              onClick={() => navigate('/cart')}
              className="w-8 h-8 rounded-full border border-[#DFD6CC] flex items-center justify-center text-[#5C4A3E] relative hover:bg-[#F2EDE4] transition-colors"
              title="View Cart"
            >
              <span className="text-sm">👜</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#221611] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Status Tags */}
        <div className="flex items-center justify-between mt-1 text-xs font-medium">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ECEAE3] text-[#4A4036] rounded-full text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Open until 6 PM
          </div>
          <span className="text-[#8C7A6D] text-[11px]">Pickup only</span>
        </div>

        {/* Headline */}
        <div className="mt-6">
          <h1 className="text-3xl font-black tracking-tight text-[#221611] leading-tight">
            Good coffee.<br />Your kind of day.
          </h1>
          <p className="text-xs text-[#7A695C] mt-2 flex items-center gap-1 font-medium">
            <span>📍</span>
            Aight popup · The Courtyard
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-6 mt-6 pb-2 border-b border-[#ECE5DC] text-xs font-semibold overflow-x-auto no-scrollbar">
          {(['Coffee', 'Non-Coffee', 'Matcha', 'Pastries'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-2 -mb-2 transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'text-[#221611] border-b-2 border-[#221611] font-bold'
                  : 'text-[#8C7A6D] hover:text-[#221611]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="mt-6 flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#221611]">{activeCategory}</h2>
            <span className="text-[11px] text-[#8C7A6D]">Made to order</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#8C7A6D]">Loading fresh menu...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/customize/${item.id}`)}
                  className="bg-white rounded-2xl p-2.5 border border-[#ECE5DC] hover:border-[#CFC3B5] transition-all cursor-pointer shadow-xs flex flex-col justify-between group"
                >
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-[#EAE3DA]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="mt-2.5">
                    <h3 className="font-bold text-xs text-[#221611] leading-snug">{item.name}</h3>
                    <p className="text-[10px] text-[#7A695C] line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#F2ECE3] flex items-center justify-between">
                    <span className="font-bold text-xs text-[#221611]">₱{item.price}</span>
                    <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#DFD6CC] text-[#221611] text-[10px] font-bold flex items-center justify-center group-hover:bg-[#221611] group-hover:text-white transition-colors">
                      +
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Cart Pill if cart has items */}
        {cartCount > 0 && (
          <div className="sticky bottom-6 mt-6 z-10">
            <button
              onClick={() => navigate('/cart')}
              className="w-full py-3.5 px-6 bg-[#221611] hover:bg-[#36251E] text-white rounded-2xl font-bold text-xs shadow-xl flex items-center justify-between transition-transform active:scale-[0.99]"
            >
              <span>View cart ({cartCount})</span>
              <span>Checkout →</span>
            </button>
          </div>
        )}

        {/* Home indicator */}
        <div className="h-4 flex items-center justify-center pt-4">
          <div className="w-32 h-1 bg-[#221611]/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
