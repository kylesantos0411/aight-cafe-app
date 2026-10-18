import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';

export const AdminHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const { orders, staffUser, logoutStaff } = useCafe();
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');

  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const filtered = orders.filter(o => {
    if (filter === 'completed' && o.status !== 'completed') return false;
    if (filter === 'cancelled' && o.status !== 'cancelled') return false;
    if (filter === 'all' && o.status !== 'completed' && o.status !== 'cancelled') return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.code.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.requestReference.toLowerCase().includes(q)
    );
  });

  const handleSignOut = async () => {
    await logoutStaff();
    navigate('/admin/login');
  };

  const handleOpenQueueDisplay = () => {
    window.open('/queue', '_blank');
  };

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
                <p className="text-[10px] text-[#8C7A6D]">Service History</p>
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
                onClick={() => navigate('/admin/menu')}
                className="w-full flex items-center gap-2 px-3 py-2 text-[#7A695C] hover:bg-white/60 rounded-xl transition-colors cursor-pointer"
              >
                <span>☕</span>
                <span>Availability</span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 bg-white text-[#221611] rounded-xl shadow-xs border border-[#E5DDD2] cursor-pointer"
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
              <h1 className="text-xl sm:text-2xl font-black text-[#221611]">Order History</h1>
              <p className="text-xs text-[#8C7A6D] mt-0.5">
                {completedOrders.length} completed · {cancelledOrders.length} cancelled
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search reference or name"
                className="pl-8 pr-3 py-1.5 bg-white border border-[#DFD6CC] rounded-xl text-xs text-[#221611] placeholder-[#A49588] focus:outline-hidden w-48"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6D]">🔍</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-[#221611] text-white' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
              }`}
            >
              All ({completedOrders.length + cancelledOrders.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'completed' ? 'bg-[#221611] text-white' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
              }`}
            >
              Completed ({completedOrders.length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'cancelled' ? 'bg-[#221611] text-white' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
              }`}
            >
              Cancelled ({cancelledOrders.length})
            </button>
          </div>

          {/* History List */}
          <div className="mt-6 space-y-3">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#8C7A6D] bg-white rounded-2xl border border-[#ECE5DC]">
                No orders match your filter.
              </div>
            ) : (
              filtered.map(order => (
                <div
                  key={order.id}
                  className="p-4 bg-white rounded-2xl border border-[#ECE5DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#221611]">{order.code}</span>
                      <span className="text-xs font-bold text-[#5C4A3E]">· {order.customerName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {order.status === 'completed' ? '✓ Completed' : '✕ Cancelled'}
                      </span>
                    </div>

                    <div className="text-xs text-[#7A695C]">
                      {order.items.map((it, idx) => (
                        <span key={idx}>
                          {it.quantity}× {it.name}
                          {idx < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>

                    {order.cancellationReason && (
                      <p className="text-[11px] text-rose-700 italic">
                        Reason: {order.cancellationReason}
                      </p>
                    )}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-sm font-black text-[#221611]">₱{order.totalAmount}</div>
                    <div className="text-[10px] text-[#8C7A6D]">
                      Cash · {order.paymentStatus === 'verified' ? 'Verified' : order.paymentStatus}
                    </div>
                    <div className="text-[10px] text-[#A49588] mt-0.5">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
