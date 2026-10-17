import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import type { Order } from '../../types/cafe';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Search,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    logoutStaff,
    setActiveOrder,
    setCustomerScreen,
    setViewMode,
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [filterQuery, setFilterQuery] = useState('');

  const matchesFilter = (o: Order) =>
    !filterQuery.trim() ||
    o.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    o.items.some(i => i.name.toLowerCase().includes(filterQuery.toLowerCase()));

  // Orders segregation with filter
  const pendingOrders = orders.filter(o => o.status === 'pending' && matchesFilter(o));
  const preparingOrders = orders.filter(o => o.status === 'preparing' && matchesFilter(o));
  const readyOrders = orders.filter(o => o.status === 'ready' && matchesFilter(o));
  const completedOrders = orders.filter(o => o.status === 'completed' && matchesFilter(o));
  const cancelledOrders = orders.filter(o => o.status === 'cancelled' && matchesFilter(o));

  const handleInspectInCustomerView = (order: Order) => {
    setActiveOrder(order);
    if (order.status === 'ready') setCustomerScreen('status-ready');
    else if (order.status === 'completed') setCustomerScreen('status-completed');
    else if (order.status === 'cancelled') setCustomerScreen('status-cancelled');
    else setCustomerScreen('status-ready');
    setViewMode('customer');
  };

  return (
    <div className="flex-1 bg-[#F5F2EB] text-[#241A15] min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header matching Figma */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E3DBD0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl tracking-tight text-[#241A15]">aight.</span>
              <span className="text-xs font-semibold text-[#8A7667] bg-[#EAE2D7] px-2.5 py-0.5 rounded-full">
                CAFE
              </span>
              <span className="text-sm font-semibold text-[#544337] ml-2">Pickup management</span>
            </div>
            <p className="text-xs text-[#7A695C] mt-1">
              Today · 9:41 AM · The Courtyard Branch · Station 1
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-[#E0D7CC] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-[#544337]">Barista: Kyle A.</span>
            </div>

            <button
              onClick={logoutStaff}
              className="p-2 text-[#7A695C] hover:text-[#241A15] hover:bg-white rounded-xl border border-transparent hover:border-[#E0D7CC] transition-colors"
              title="Sign out of staff terminal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab & Metric Counters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-white/70 p-1 rounded-2xl border border-[#E0D7CC]">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-[#241812] text-white shadow-xs'
                  : 'text-[#6B5A4E] hover:text-[#241A15]'
              }`}
            >
              Active Queue ({pendingOrders.length + preparingOrders.length + readyOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'bg-[#241812] text-white shadow-xs'
                  : 'text-[#6B5A4E] hover:text-[#241A15]'
              }`}
            >
              Completed ({completedOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'cancelled'
                  ? 'bg-[#241812] text-white shadow-xs'
                  : 'text-[#6B5A4E] hover:text-[#241A15]'
              }`}
            >
              Cancelled ({cancelledOrders.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8A7667] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder="Search ticket code or name..."
              className="w-full pl-8 pr-3 py-1.5 bg-white rounded-xl border border-[#E0D7CC] text-xs text-[#241A15] placeholder-[#9E8E81] focus:outline-hidden focus:ring-1 focus:ring-[#241812]"
            />
          </div>
        </div>

        {/* If Active Tab: Show Kanban Columns matching Figma */}
        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* COLUMN 1: INCOMING ORDERS */}
            <div className="bg-[#EFE9DF] rounded-3xl p-4 border border-[#E2D8CC] flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2D8CC]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#544337]">
                    Incoming ({pendingOrders.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#8A7667]">Requires accept</span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px]">
                {pendingOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8A7667]">No new pending orders</div>
                ) : (
                  pendingOrders.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 border border-[#DFD6CA] shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xl font-black font-display text-[#241812]">
                            {order.code}
                          </span>
                          <p className="text-xs font-semibold text-[#544337] mt-0.5">
                            {order.customerName} ·{' '}
                            <span className="uppercase text-[10px] text-[#8A7667]">
                              {order.orderType}
                            </span>
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {order.paymentMethod}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="bg-[#FAF8F5] rounded-xl p-2.5 text-xs space-y-1 border border-[#EFE8DF]">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[#241A15]">
                            <span>
                              {it.quantity}x {it.name}
                              {(it.size || it.milk) && (
                                <span className="text-[10px] text-[#7A695C] block">
                                  {[it.size, it.milk].filter(Boolean).join(', ')}
                                </span>
                              )}
                            </span>
                            <span className="font-semibold">₱{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="flex-1 py-2 bg-[#241812] hover:bg-[#38261D] text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Accept & Brew
                        </button>
                        <button
                          onClick={() =>
                            updateOrderStatus(order.id, 'cancelled', 'Order declined by store bar')
                          }
                          className="px-3 py-2 border border-[#E0D7CC] hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-semibold transition-all text-[#6B5A4E]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: IN PROGRESS / BREWING */}
            <div className="bg-[#EFE9DF] rounded-3xl p-4 border border-[#E2D8CC] flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2D8CC]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#544337]">
                    In Progress ({preparingOrders.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#8A7667]">At the espresso bar</span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px]">
                {preparingOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8A7667]">No orders in progress</div>
                ) : (
                  preparingOrders.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 border border-[#DFD6CA] shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xl font-black font-display text-[#241812]">
                            {order.code}
                          </span>
                          <p className="text-xs font-semibold text-[#544337] mt-0.5">
                            {order.customerName}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Preparing
                        </span>
                      </div>

                      {/* Items */}
                      <div className="bg-[#FAF8F5] rounded-xl p-2.5 text-xs space-y-1 border border-[#EFE8DF]">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[#241A15]">
                            <span>
                              {it.quantity}x {it.name}
                              {(it.size || it.milk) && (
                                <span className="text-[10px] text-[#7A695C] block">
                                  {[it.size, it.milk, it.temperature].filter(Boolean).join(', ')}
                                </span>
                              )}
                            </span>
                            <span className="font-semibold">₱{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Ready for Pickup
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: READY FOR PICKUP */}
            <div className="bg-[#EFE9DF] rounded-3xl p-4 border border-[#E2D8CC] flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2D8CC]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#544337]">
                    Ready ({readyOrders.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#8A7667]">On the counter</span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px]">
                {readyOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8A7667]">No orders waiting for pickup</div>
                ) : (
                  readyOrders.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 border-2 border-emerald-500/50 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-2xl font-black font-display text-[#241812]">
                            {order.code}
                          </span>
                          <p className="text-xs font-semibold text-[#544337] mt-0.5">
                            {order.customerName}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Ready at Bar
                        </span>
                      </div>

                      {/* Items */}
                      <div className="bg-[#FAF8F5] rounded-xl p-2.5 text-xs space-y-1 border border-[#EFE8DF]">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[#241A15]">
                            <span>
                              {it.quantity}x {it.name}
                            </span>
                            <span className="font-semibold">₱{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="flex-1 py-2 bg-[#241812] hover:bg-[#38261D] text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Delivered / Complete
                        </button>
                        <button
                          onClick={() => handleInspectInCustomerView(order)}
                          className="p-2 border border-[#E0D7CC] hover:bg-[#FAF8F5] rounded-xl text-xs text-[#544337]"
                          title="View customer pickup ticket"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* RECENTLY CLOSED ORDERS TABLE (matching Figma table) */}
        <div className="bg-white rounded-3xl p-6 border border-[#E0D7CC] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
            <div>
              <h2 className="font-bold text-sm text-[#241A15]">Recently Closed Orders</h2>
              <p className="text-xs text-[#7A695C] mt-0.5">Completed and cancelled tickets log</p>
            </div>
            <span className="text-xs font-semibold text-[#8A7667]">
              {completedOrders.length + cancelledOrders.length} records
            </span>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-semibold text-[#8A7667] uppercase border-b border-[#F0EAE1]">
                  <th className="py-3 px-3">Order #</th>
                  <th className="py-3 px-3">Pick Up Name</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Payment / Amount</th>
                  <th className="py-3 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F2EC]">
                {orders
                  .filter(o => o.status === 'completed' || o.status === 'cancelled')
                  .slice(0, 8)
                  .map(order => (
                    <tr key={order.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-3 font-bold font-display text-sm text-[#241A15]">
                        {order.code}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#38261D]">{order.customerName}</td>
                      <td className="py-3 px-3 text-[#6B5A4E]">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-3 px-3">
                        {order.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-800 text-[11px] font-semibold border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#241A15]">
                        {order.status === 'cancelled'
                          ? 'No payment collected'
                          : `${order.paymentMethod} · ₱${order.totalAmount}`}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleInspectInCustomerView(order)}
                          className="px-2.5 py-1 rounded-lg border border-[#E0D7CC] hover:bg-[#241812] hover:text-white transition-colors text-[11px] font-medium"
                        >
                          View Screen
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
