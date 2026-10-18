import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { dailyCloseService, type DailyClosureRecord } from '../services/dailyCloseService';

export const AdminHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const { orders, staffUser, logoutStaff } = useCafe();
  const [activeSection, setActiveSection] = useState<'orders' | 'closures'>('orders');
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [selectedClosure, setSelectedClosure] = useState<DailyClosureRecord | null>(null);

  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  const dailyClosures = dailyCloseService.getDailyClosures();

  const filteredOrders = orders.filter(o => {
    if (filter === 'completed' && o.status !== 'completed') return false;
    if (filter === 'cancelled' && o.status !== 'cancelled') return false;
    if (filter === 'all' && o.status !== 'completed' && o.status !== 'cancelled') return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.code && o.code.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.requestReference && o.requestReference.toLowerCase().includes(q))
    );
  });

  const handleSignOut = async () => {
    await logoutStaff();
    navigate('/admin/login');
  };

  const handleOpenQueueDisplay = () => {
    window.open('/queue', '_blank');
  };

  const handleExportAllOrders = () => {
    const summary = dailyCloseService.computeCurrentDaySummary(
      orders,
      'Silangan, San Mateo, Rizal',
      staffUser?.fullName || 'Staff'
    );
    dailyCloseService.exportDailyCloseToCSV(summary);
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
                <p className="text-[10px] font-bold text-[#221611] uppercase tracking-wider">SILANGAN, SAN MATEO, RIZAL</p>
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
                onClick={() => navigate('/admin/nfc')}
                className="w-full flex items-center gap-2 px-3 py-2 text-[#7A695C] hover:bg-white/60 rounded-xl transition-colors cursor-pointer"
              >
                <span>🏷️</span>
                <span>NFC Hub</span>
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
                {staffUser?.fullName?.[0] || 'K'}
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-bold text-[#221611]">{staffUser?.fullName || 'Staff'}</div>
                <div className="text-[9px] text-[#8C7A6D] capitalize">{staffUser?.role?.replace('_', ' ') || 'Barista'}</div>
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
              <h1 className="text-xl sm:text-2xl font-black text-[#221611]">Transaction & Service History</h1>
              <p className="text-xs text-[#8C7A6D] mt-0.5">
                Silangan, San Mateo, Rizal · {completedOrders.length} completed · {cancelledOrders.length} voided/cancelled
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={handleExportAllOrders}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#221611] text-white hover:bg-[#36251E] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Download full CSV report of all transactions"
              >
                <span>📥</span>
                <span>Export CSV Report</span>
              </button>

              {activeSection === 'orders' && (
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search reference or name"
                    className="pl-8 pr-3 py-1.5 bg-white border border-[#DFD6CC] rounded-xl text-xs text-[#221611] placeholder-[#A49588] focus:outline-hidden w-40 sm:w-48 shadow-2xs"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6D]">🔍</span>
                </div>
              )}
            </div>
          </div>

          {/* Section Switcher: Individual Orders vs Daily Closures */}
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => setActiveSection('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'orders' ? 'bg-[#221611] text-white shadow-xs' : 'bg-white border border-[#DFD6CC] text-[#7A695C] hover:bg-[#F2EDE4]'
              }`}
            >
              <span>📋 Order Transactions ({completedOrders.length + cancelledOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveSection('closures')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'closures' ? 'bg-[#221611] text-white shadow-xs' : 'bg-white border border-[#DFD6CC] text-[#7A695C] hover:bg-[#F2EDE4]'
              }`}
            >
              <span>🌙 Daily Closures & Archives ({dailyClosures.length})</span>
            </button>
          </div>

          {activeSection === 'orders' ? (
            /* ======================================================== */
            /* 1. INDIVIDUAL ORDER TRANSACTIONS                        */
            /* ======================================================== */
            <div className="mt-5 space-y-4">
              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    filter === 'all' ? 'bg-[#221611] text-white shadow-xs' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
                  }`}
                >
                  All ({completedOrders.length + cancelledOrders.length})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    filter === 'completed' ? 'bg-[#221611] text-white shadow-xs' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
                  }`}
                >
                  Completed ({completedOrders.length})
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    filter === 'cancelled' ? 'bg-[#221611] text-white shadow-xs' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
                  }`}
                >
                  Voided / Cancelled ({cancelledOrders.length})
                </button>
              </div>

              {/* History List */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[#8C7A6D] bg-white rounded-2xl border border-[#ECE5DC]">
                    No orders match your filter.
                  </div>
                ) : (
                  filteredOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-4 bg-white rounded-2xl border border-[#ECE5DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#DFD6CC] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#221611]">{order.code || order.requestReference}</span>
                          <span className="text-xs font-bold text-[#5C4A3E]">· {order.customerName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {order.status === 'completed' ? '✓ Completed' : '✕ Voided / Cancelled'}
                          </span>
                        </div>
                        <div className="text-xs text-[#7A695C] flex flex-wrap items-center gap-2">
                          <span>Ref: {order.requestReference}</span>
                          <span>·</span>
                          <span>
                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                          </span>
                        </div>
                        {order.cancellationReason && (
                          <p className="text-[11px] text-rose-700 italic">
                            Reason: {order.cancellationReason}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F4EFEA]">
                        <span className="font-black text-sm text-[#221611]">₱{order.totalAmount}</span>
                        <span className="text-[10px] text-[#8C7A6D]">
                          {order.completedAt
                            ? new Date(order.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' '}· Cash ({order.paymentStatus})
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* 2. DAILY CLOSURES & ARCHIVES                            */
            /* ======================================================== */
            <div className="mt-5 space-y-4">
              {dailyClosures.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#8C7A6D] bg-white rounded-2xl border border-[#ECE5DC] space-y-2">
                  <p className="font-bold text-sm text-[#221611]">No Daily Closures Recorded Yet</p>
                  <p className="max-w-md mx-auto">
                    When you finish service and click "Daily Close & Reset" on the Orders screen, each day's financial summary, itemized sales, and audit reports will be stored here permanently.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyClosures.map(closure => (
                    <div
                      key={closure.id}
                      className="p-5 bg-white rounded-3xl border border-[#ECE5DC] shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F4EFEA] gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base">📅</span>
                            <h3 className="font-black text-base text-[#221611]">{closure.closureDate}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F2EDE4] rounded-full text-[#7A695C]">
                              {closure.stallLocation}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8C7A6D] mt-0.5">
                            Closed at {new Date(closure.closedAt).toLocaleTimeString()} by {closure.closedByName}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedClosure(selectedClosure?.id === closure.id ? null : closure)}
                            className="px-3 py-1.5 border border-[#DFD6CC] text-[#221611] rounded-xl text-xs font-semibold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                          >
                            {selectedClosure?.id === closure.id ? 'Hide Items' : 'View Items'}
                          </button>
                          <button
                            onClick={() => dailyCloseService.exportDailyCloseToCSV(closure)}
                            className="px-3 py-1.5 bg-[#221611] text-white hover:bg-[#36251E] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <span>📥</span>
                            <span>Download CSV</span>
                          </button>
                        </div>
                      </div>

                      {/* Metric Tally */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#ECE5DC]">
                          <span className="text-[9px] uppercase font-bold text-[#8C7A6D]">Total Revenue</span>
                          <p className="font-black text-base text-[#221611]">₱{closure.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                          <span className="text-[9px] uppercase font-bold text-emerald-700">Completed Orders</span>
                          <p className="font-black text-base">{closure.completedOrders}</p>
                        </div>
                        <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
                          <span className="text-[9px] uppercase font-bold text-rose-700">Voided Orders</span>
                          <p className="font-black text-base">{closure.cancelledOrders}</p>
                        </div>
                        <div className="p-2.5 bg-[#F2EDE4] rounded-xl border border-[#E5DDD2]">
                          <span className="text-[9px] uppercase font-bold text-[#7A695C]">Total Items Sold</span>
                          <p className="font-black text-base text-[#221611]">
                            {closure.itemsSold.reduce((acc, it) => acc + it.quantity, 0)}
                          </p>
                        </div>
                      </div>

                      {/* Expandable itemized details */}
                      {selectedClosure?.id === closure.id && (
                        <div className="mt-3 pt-3 border-t border-[#ECE5DC] animate-fade-in space-y-2">
                          <p className="text-xs font-bold text-[#221611]">Items Sold Breakdown:</p>
                          <div className="divide-y divide-[#ECE5DC] text-xs">
                            {closure.itemsSold.map((it, idx) => (
                              <div key={idx} className="py-1 flex justify-between">
                                <span className="font-medium text-[#221611]">{it.name} × {it.quantity}</span>
                                <span className="font-bold text-[#221611]">₱{it.revenue.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
