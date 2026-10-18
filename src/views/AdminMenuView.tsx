import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { menuService } from '../services/menuService';
import type { MenuItem } from '../types/cafe';

export const AdminMenuView: React.FC = () => {
  const navigate = useNavigate();
  const { staffUser, logoutStaff } = useCafe();
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    menuService.getAllProducts().then(items => {
      setProducts(items);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (product: MenuItem) => {
    setTogglingId(product.id);
    const newStatus = !product.isAvailable;
    try {
      await menuService.toggleProductAvailability(product.id, newStatus);
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, isAvailable: newStatus } : p))
      );
      setSuccessMsg(`Updated ${product.name} to ${newStatus ? 'In Stock' : 'Sold Out'}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update availability.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSignOut = async () => {
    await logoutStaff();
    navigate('/admin/login');
  };

  const handleOpenQueueDisplay = () => {
    window.open('/queue', '_blank');
  };

  const categories = ['All', 'Coffee', 'Non-Coffee', 'Matcha', 'Pastries'];

  const filtered = products.filter(p => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Coffee') return p.category === 'Coffee';
    if (activeCategory === 'Non-Coffee') return p.category === 'Cold Brew' || p.name.toLowerCase().includes('chocolate');
    if (activeCategory === 'Matcha') return p.category === 'Tea & Matcha' || p.name.toLowerCase().includes('matcha');
    if (activeCategory === 'Pastries') return p.category === 'Pastries';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-start p-3 sm:p-6 font-sans">
      <div className="w-full max-w-7xl min-h-[85vh] bg-[#FAF8F5] text-[#221611] rounded-3xl md:rounded-[40px] flex flex-col md:flex-row shadow-2xl border border-[#EAE3DA] relative overflow-hidden select-none">
        {/* Left Sidebar */}
        <aside className="w-full md:w-[200px] bg-[#F2EDE4] p-4 sm:p-5 flex md:flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5DDD2] shrink-0">
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#221611]">aight .</span>
                <span className="text-[9px] font-semibold tracking-widest text-[#7A695C] bg-[#EAE2D7] px-1.5 py-0.5 rounded-full">
                  ADMIN
                </span>
              </div>
              <div className="mt-1 md:mt-2 hidden sm:block">
                <p className="text-[10px] font-bold text-[#221611] uppercase tracking-wider">THE COURTYARD</p>
                <p className="text-[10px] text-[#8C7A6D]">Menu Management</p>
              </div>
            </div>

            <nav className="space-y-1.5 text-xs font-semibold">
              <button
                onClick={() => navigate('/admin/orders')}
                className="w-full flex items-center gap-2 px-3 py-2 text-[#7A695C] hover:bg-white/60 rounded-xl transition-colors cursor-pointer"
              >
                <span>📋</span>
                <span>Orders</span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 bg-white text-[#221611] rounded-xl shadow-xs border border-[#E5DDD2] cursor-pointer"
              >
                <span>☕</span>
                <span>Availability</span>
              </button>
              <button
                onClick={() => navigate('/admin/history')}
                className="w-full flex items-center gap-2 px-3 py-2 text-[#7A695C] hover:bg-white/60 rounded-xl transition-colors cursor-pointer"
              >
                <span>📜</span>
                <span>History</span>
              </button>
              <button
                onClick={handleOpenQueueDisplay}
                className="w-full flex items-center gap-2 px-3 py-2 text-[#7A695C] hover:bg-white/60 rounded-xl transition-colors cursor-pointer"
              >
                <span>📺</span>
                <span>Queue display</span>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-[#E5DDD2] space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#221611] text-white flex items-center justify-center font-bold text-xs uppercase">
                {staffUser?.fullName?.[0] || 'M'}
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-bold text-[#221611]">{staffUser?.fullName || 'Mia'}</div>
                <div className="text-[9px] text-[#8C7A6D] capitalize">{staffUser?.role?.replace('_', ' ') || 'Staff operator'}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-[11px] text-[#8C7A6D] hover:text-[#221611] font-medium cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-[#ECE5DC]">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#221611]">Item Availability</h1>
              <p className="text-xs text-[#8C7A6D] mt-0.5">Toggle products in-stock or sold-out in realtime</p>
            </div>

            {successMsg && (
              <div className="px-3.5 py-1.5 bg-[#E8F3EB] text-[#246B3E] rounded-full text-xs font-bold border border-[#D2E7D7] animate-fade-in">
                ✓ {successMsg}
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat ? 'bg-[#221611] text-white' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="my-auto py-12 text-center text-xs text-[#8C7A6D]">Loading product catalog...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {filtered.map(product => {
                const isAvail = product.isAvailable !== false;
                return (
                  <div
                    key={product.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                      isAvail ? 'bg-white border-[#ECE5DC]' : 'bg-[#F7F4F0] border-[#DFD6CC] opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-[#EAE3DA] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-sm text-[#221611] truncate">{product.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAvail ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isAvail ? 'In Stock' : 'Sold Out'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#5C4A3E] mt-1">₱{product.price}</p>
                        <p className="text-[11px] text-[#8C7A6D] mt-0.5 line-clamp-1">{product.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F2ECE3] flex items-center justify-between">
                      <span className="text-[11px] text-[#7A695C]">
                        {isAvail ? 'Available to order' : 'Hidden from checkout'}
                      </span>
                      <button
                        onClick={() => handleToggle(product)}
                        disabled={togglingId === product.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isAvail
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {togglingId === product.id
                          ? 'Updating...'
                          : isAvail
                          ? 'Mark Sold Out'
                          : 'Mark Available'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
