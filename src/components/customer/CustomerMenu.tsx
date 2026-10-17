import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import type { MenuItem } from '../../types/cafe';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { Search, Plus, Clock, ArrowRight } from 'lucide-react';

export const CustomerMenu: React.FC = () => {
  const { menuItems, cartCount, cartTotal, setCustomerScreen, addToCart, activeOrder } = useCafe();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  const categories = ['All', 'Coffee', 'Cold Brew', 'Tea & Matcha', 'Pastries'];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-full bg-[#FAF8F5] text-[#241A15] p-5 pb-24">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE3DA]">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-2xl text-[#241A15] tracking-tight">aight.</span>
            <span className="text-[10px] font-bold tracking-widest text-[#7D6B5E] bg-[#EBE4DC] px-2 py-0.5 rounded-full">
              CAFE
            </span>
          </div>
          <p className="text-[11px] text-[#7A695C] mt-0.5">Specialty coffee & fresh artisan bakes</p>
        </div>

        {/* Active order quick button if exists */}
        {activeOrder && (
          <button
            onClick={() => {
              if (activeOrder.status === 'ready') setCustomerScreen('status-ready');
              else if (activeOrder.status === 'completed') setCustomerScreen('status-completed');
              else if (activeOrder.status === 'cancelled') setCustomerScreen('status-cancelled');
              else setCustomerScreen('status-ready');
            }}
            className="flex items-center gap-1.5 bg-[#241812] text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[#38261D] transition-colors shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Order {activeOrder.code}</span>
            <ArrowRight className="w-3 h-3 opacity-60" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="mt-4 relative">
        <Search className="w-4 h-4 text-[#8A7667] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search iced latte, matcha, pastries..."
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl border border-[#EAE3DA] text-xs text-[#241A15] placeholder-[#9E8E81] focus:outline-hidden focus:ring-1 focus:ring-[#241812] shadow-xs"
        />
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-[#241812] text-white shadow-xs'
                : 'bg-white text-[#6B5A4E] border border-[#EBE4DC] hover:border-[#CFC3B5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="mt-2 space-y-3">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => setCustomizingItem(item)}
            className="bg-white rounded-2xl p-3 border border-[#ECE5DC] hover:border-[#D5C7B8] transition-all cursor-pointer flex gap-3 shadow-xs hover:shadow-sm group"
          >
            {/* Image */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#EAE3DA] shrink-0 relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {item.tags?.[0] && (
                <span className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white px-1 py-0.5 rounded text-center truncate">
                  {item.tags[0]}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-bold text-xs text-[#241A15] group-hover:text-[#5E3F2E] transition-colors truncate">
                    {item.name}
                  </h3>
                  <span className="font-bold text-xs font-display text-[#241A15]">₱{item.price}</span>
                </div>
                <p className="text-[11px] text-[#7A695C] line-clamp-2 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1">
                <span className="text-[10px] text-[#9A8779] uppercase tracking-wider font-medium">
                  {item.category}
                </span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setCustomizingItem(item);
                  }}
                  className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#E0D7CC] hover:bg-[#241812] hover:text-white hover:border-[#241812] flex items-center justify-center transition-colors text-[#5C4A3E]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:absolute sm:bottom-4 sm:left-4 sm:right-4 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={() => setCustomerScreen('cart')}
            className="w-full py-3.5 px-4 bg-[#241812] hover:bg-[#38261D] text-white rounded-2xl shadow-xl flex items-center justify-between transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                {cartCount}
              </div>
              <span className="font-semibold text-xs text-[#EAE3DA]">View your cart</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm">₱{cartTotal}</span>
              <ArrowRight className="w-4 h-4 text-[#D5C7B8]" />
            </div>
          </button>
        </div>
      )}

      {/* Item Customizer Modal */}
      {customizingItem && (
        <ItemCustomizerModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={item => {
            addToCart(item);
          }}
        />
      )}
    </div>
  );
};
