import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCafe } from '../../context/CafeContext';
import { dailyCloseService, type DailyClosureRecord } from '../../services/dailyCloseService';
import type { Order, OrderStatus } from '../../types/cafe';

interface Props {
  onOpenQueueDisplay?: () => void;
  onSignOut?: () => void;
}

export const Screen13StaffOrders: React.FC<Props> = ({ onOpenQueueDisplay, onSignOut }) => {
  const navigate = useNavigate();
  const {
    orders,
    acceptOrder,
    updateOrderStatus,
    verifyCashPayment,
    staffUser,
    resetDailyQueueAndOrders,
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCashReceived, setIsCashReceived] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Voiding Dialog State
  const [voidingOrder, setVoidingOrder] = useState<Order | null>(null);
  const [voidReason, setVoidReason] = useState<string>('Customer requested cancellation');
  const [customVoidReason, setCustomVoidReason] = useState<string>('');
  const [isVoiding, setIsVoiding] = useState<boolean>(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);

  // Daily Close & Reset Modal State
  const [showDailyCloseModal, setShowDailyCloseModal] = useState<boolean>(false);
  const [isClosingDay, setIsClosingDay] = useState<boolean>(false);
  const [closureSuccessRecord, setClosureSuccessRecord] = useState<DailyClosureRecord | null>(null);

  // Filter orders by search
  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o.code && o.code.toLowerCase().includes(q)) ||
      (o.requestReference && o.requestReference.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q))
    );
  });

  const incomingOrders = filteredOrders.filter(o => o.status === 'pending');
  const inProgressOrders = filteredOrders.filter(o => o.status === 'confirmed' || o.status === 'preparing');
  const readyOrders = filteredOrders.filter(o => o.status === 'ready');
  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled');
  const activeOrders = [...incomingOrders, ...inProgressOrders, ...readyOrders];

  // BUGFIX: Only select active orders when on Active tab. If no active orders exist, selectedOrder is null!
  let selectedOrder: Order | null = null;
  if (activeTab === 'active') {
    if (selectedOrderId) {
      selectedOrder = activeOrders.find(o => o.id === selectedOrderId || o.code === selectedOrderId) || null;
    }
    if (!selectedOrder && activeOrders.length > 0) {
      selectedOrder = readyOrders[0] || inProgressOrders[0] || incomingOrders[0] || null;
    }
  }

  const getStatusPill = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending acceptance', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200', dotClass: 'bg-amber-600' };
      case 'confirmed':
        return { label: 'Confirmed', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200', dotClass: 'bg-blue-600' };
      case 'preparing':
        return { label: 'Preparing', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200', dotClass: 'bg-purple-600' };
      case 'ready':
        return { label: 'Ready for pickup', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200', dotClass: 'bg-emerald-600' };
      case 'completed':
        return { label: 'Completed', badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200', dotClass: 'bg-zinc-400' };
      case 'cancelled':
        return { label: 'Voided / Cancelled', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200', dotClass: 'bg-rose-600' };
    }
  };

  const handleAccept = async (orderId: string) => {
    if (acceptingOrderId) return;
    setAcceptingOrderId(orderId);
    try {
      const updated = await acceptOrder(orderId);
      setSelectedOrderId(updated.id);
      showNotice(`Accepted order ${updated.code}`);
    } catch (err: any) {
      alert(err.message || 'Failed to accept order.');
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const handleVerifyCashAndComplete = async () => {
    if (!selectedOrder) return;
    try {
      await verifyCashPayment(selectedOrder.id);
      await updateOrderStatus(selectedOrder.id, 'completed');
      setIsCashReceived(false);
      setSelectedOrderId(null);
      showNotice(`Order ${selectedOrder.code} completed and cash verified!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmVoid = async () => {
    if (!voidingOrder || isVoiding) return;
    setIsVoiding(true);
    try {
      const reason = voidReason === 'Other' ? customVoidReason.trim() || 'Voided by stall operator' : voidReason;
      await updateOrderStatus(voidingOrder.id, 'cancelled', reason);
      if (selectedOrderId === voidingOrder.id) {
        setSelectedOrderId(null);
      }
      const voidedRef = voidingOrder.code || voidingOrder.requestReference;
      setVoidingOrder(null);
      setCustomVoidReason('');
      showNotice(`Order ${voidedRef} has been voided.`);
    } catch (err: any) {
      alert(err.message || 'Failed to void order.');
    } finally {
      setIsVoiding(false);
    }
  };

  const handleExecuteDailyClose = async () => {
    try {
      setIsClosingDay(true);
      const record = await dailyCloseService.executeDailyClose(
        orders,
        'Silangan, San Mateo, Rizal',
        staffUser?.fullName || 'Staff Operator'
      );
      // Automatically export and trigger CSV download
      dailyCloseService.exportDailyCloseToCSV(record);
      // Reset daily sequence and clear board
      await resetDailyQueueAndOrders();
      setClosureSuccessRecord(record);
      setIsClosingDay(false);
      showNotice('Daily sales summary saved! Queue reset to A001 for tomorrow.');
    } catch (err: any) {
      setIsClosingDay(false);
      alert('Failed to execute daily close: ' + err.message);
    }
  };

  const showNotice = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <div className="w-full max-w-7xl min-h-[85vh] bg-[#FAF8F5] text-[#221611] rounded-3xl md:rounded-[40px] flex flex-col md:flex-row shadow-2xl border border-[#EAE3DA] font-sans relative overflow-hidden select-none">
      {/* Left Sidebar */}
      <aside className="w-full md:w-[180px] bg-[#F2EDE4] p-4 sm:p-5 flex md:flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5DDD2] shrink-0">
        <div className="space-y-4 md:space-y-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#221611]">aight .</span>
              <span className="text-[9px] font-semibold tracking-widest text-[#7A695C] bg-[#EAE2D7] px-1.5 py-0.5 rounded-full">
                CAFE
              </span>
            </div>
            <div className="mt-1 md:mt-2 hidden sm:block">
              <p className="text-[10px] font-bold text-[#221611] uppercase tracking-wider">SILANGAN, SAN MATEO, RIZAL</p>
              <p className="text-[10px] text-[#8C7A6D]">Pickup Station</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => navigate('/admin/orders')}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white text-[#221611] rounded-xl shadow-xs border border-[#E5DDD2] cursor-pointer"
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
              onClick={() => navigate('/admin/history')}
              className="w-full flex items-center gap-2 px-3 py-2 text-[#7A695C] hover:bg-white/60 rounded-xl transition-colors cursor-pointer"
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
              onClick={onOpenQueueDisplay}
              className="w-full flex items-center gap-2 px-3 py-2 text-[#7A695C] hover:bg-white/60 rounded-xl transition-colors cursor-pointer"
            >
              <span>📺</span>
              <span>Queue display</span>
            </button>
          </nav>
        </div>

        {/* Staff Profile at Bottom */}
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
            onClick={onSignOut}
            className="text-[11px] text-[#8C7A6D] hover:text-[#221611] font-medium cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-[#ECE5DC]">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#221611]">Pickup orders</h1>
            <p className="text-xs text-[#8C7A6D] mt-0.5">Silangan, San Mateo, Rizal · Station 1</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {actionSuccessMsg && (
              <div className="px-3 py-1 bg-[#E8F3EB] text-[#246B3E] rounded-full text-xs font-bold border border-[#D2E7D7] animate-fade-in">
                ✓ {actionSuccessMsg}
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F3EB] text-[#246B3E] rounded-full text-xs font-semibold border border-[#D2E7D7]">
              <span className="w-2 h-2 rounded-full bg-[#246B3E] animate-pulse"></span>
              Live · updated just now
            </div>

            {/* End of Day / Daily Close & Reset Action */}
            <button
              onClick={() => setShowDailyCloseModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#221611] text-white hover:bg-[#36251E] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Close stall for the day, save all transactions to history, and reset queue for tomorrow"
            >
              <span>🌙</span>
              <span>Daily Close & Reset</span>
            </button>

            <button
              onClick={onOpenQueueDisplay}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#DFD6CC] text-[#221611] rounded-xl text-xs font-semibold hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-2xs"
            >
              <span>↗</span>
              <span>Open queue display</span>
            </button>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find number or name"
                className="pl-8 pr-3 py-1.5 bg-white border border-[#DFD6CC] rounded-xl text-xs text-[#221611] placeholder-[#A49588] focus:outline-hidden w-40 sm:w-48 shadow-2xs"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6D]">🔍</span>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedOrderId(null);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'active' ? 'bg-[#221611] text-white shadow-xs' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
            }`}
          >
            Active {activeOrders.length}
          </button>
          <button
            onClick={() => {
              setActiveTab('completed');
              setSelectedOrderId(null);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'completed' ? 'bg-[#221611] text-white shadow-xs' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
            }`}
          >
            Completed ({completedOrders.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('cancelled');
              setSelectedOrderId(null);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'cancelled' ? 'bg-[#221611] text-white shadow-xs' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
            }`}
          >
            Cancelled / Voided ({cancelledOrders.length})
          </button>
        </div>

        {activeTab === 'active' ? (
          /* Active Board + Selected Details Panel */
          <div className="mt-5 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Active Order Board (8 Cols on xl) */}
            <div className="xl:col-span-8 col-span-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* COLUMN 1: INCOMING */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-[#6E5D50] pb-1 border-b border-[#ECE5DC]">
                  <span>Incoming</span>
                  <span className="w-5 h-5 rounded-full bg-[#EAE2D7] text-[#6E5D50] flex items-center justify-center text-[10px]">
                    {incomingOrders.length}
                  </span>
                </div>

                {incomingOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`bg-white rounded-2xl p-3.5 border space-y-2 shadow-xs cursor-pointer transition-all ${
                      selectedOrder?.id === order.id ? 'border-[#221611] ring-1 ring-[#221611]' : 'border-[#ECE5DC] hover:border-[#DFD6CC]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-base font-black font-mono text-[#221611]">{order.code || order.requestReference}</span>
                        <p className="text-xs font-medium text-[#7A695C]">{order.customerName}</p>
                      </div>
                      <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                        Just in
                      </span>
                    </div>

                    <div className="text-xs space-y-0.5">
                      {order.items.map((it, idx) => (
                        <div key={idx}>
                          <p className="font-semibold text-[#221611]">{it.quantity} × {it.name}</p>
                          <p className="text-[10px] text-[#8C7A6D]">{it.size || 'Regular'} · {it.milk || 'Dairy'}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-[10px] text-[#8C7A6D]">Cash · {order.paymentStatus}</span>
                      <span className="font-bold text-[#221611]">₱{order.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleAccept(order.id)}
                        disabled={acceptingOrderId === order.id}
                        className="flex-1 py-1.5 bg-[#221611] text-white rounded-full text-xs font-bold hover:bg-[#36251E] disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {acceptingOrderId === order.id ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => setVoidingOrder(order)}
                        className="px-3 py-1.5 border border-rose-200 text-rose-700 rounded-full text-xs font-medium hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Void / Cancel this order"
                      >
                        Void
                      </button>
                    </div>
                  </div>
                ))}

                {incomingOrders.length === 0 && (
                  <div className="p-4 text-center text-xs text-[#8C7A6D] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DFD6CC]">
                    No incoming orders
                  </div>
                )}
              </div>

              {/* COLUMN 2: IN PROGRESS */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-[#6E5D50] pb-1 border-b border-[#ECE5DC]">
                  <span>In progress</span>
                  <span className="w-5 h-5 rounded-full bg-[#EAE2D7] text-[#6E5D50] flex items-center justify-center text-[10px]">
                    {inProgressOrders.length}
                  </span>
                </div>

                {inProgressOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`bg-white rounded-2xl p-3.5 border space-y-2 shadow-xs cursor-pointer transition-all ${
                      selectedOrder?.id === order.id ? 'border-[#221611] ring-1 ring-[#221611]' : 'border-[#ECE5DC] hover:border-[#DFD6CC]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-base font-black font-mono text-[#221611]">{order.code}</span>
                        <p className="text-xs font-medium text-[#7A695C]">{order.customerName}</p>
                      </div>
                      <span className="text-[10px] text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md font-semibold">
                        {order.status === 'confirmed' ? 'Accepted' : 'Preparing'}
                      </span>
                    </div>

                    <div className="text-xs space-y-0.5">
                      {order.items.map((it, idx) => (
                        <div key={idx}>
                          <p className="font-semibold text-[#221611]">{it.quantity} × {it.name}</p>
                          <p className="text-[10px] text-[#8C7A6D]">{it.size || 'Regular'} · {it.milk || 'Dairy'}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-[10px] text-[#8C7A6D]">Cash · {order.paymentStatus}</span>
                      <span className="font-bold text-[#221611]">₱{order.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
                      {order.status === 'confirmed' ? (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="flex-1 py-1.5 bg-[#FAF8F5] border border-[#DFD6CC] text-[#221611] hover:bg-[#F2EDE4] rounded-full text-xs font-bold transition-colors cursor-pointer"
                        >
                          Start preparing
                        </button>
                      ) : (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="flex-1 py-1.5 bg-[#221611] text-white hover:bg-[#36251E] rounded-full text-xs font-bold transition-colors cursor-pointer"
                        >
                          Mark as ready
                        </button>
                      )}
                      <button
                        onClick={() => setVoidingOrder(order)}
                        className="px-2.5 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-full text-xs font-medium transition-colors cursor-pointer"
                        title="Void order"
                      >
                        Void
                      </button>
                    </div>
                  </div>
                ))}

                {inProgressOrders.length === 0 && (
                  <div className="p-4 text-center text-xs text-[#8C7A6D] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DFD6CC]">
                    No orders in progress
                  </div>
                )}
              </div>

              {/* COLUMN 3: READY FOR PICKUP */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-[#6E5D50] pb-1 border-b border-[#ECE5DC]">
                  <span>Ready for pickup</span>
                  <span className="w-5 h-5 rounded-full bg-[#EAE2D7] text-[#6E5D50] flex items-center justify-center text-[10px]">
                    {readyOrders.length}
                  </span>
                </div>

                {readyOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`bg-white rounded-2xl p-3.5 border cursor-pointer transition-all space-y-2 shadow-xs ${
                        isSelected ? 'border-[#221611] ring-1 ring-[#221611]' : 'border-[#ECE5DC] hover:border-[#DFD6CC]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-base font-black font-mono text-[#221611]">{order.code}</span>
                          <p className="text-xs font-medium text-[#7A695C]">{order.customerName}</p>
                        </div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          Ready
                        </span>
                      </div>

                      <div className="text-xs space-y-0.5">
                        {order.items.map((it, idx) => (
                          <p key={idx} className="font-semibold text-[#221611]">{it.quantity} × {it.name}</p>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-[10px] text-[#8C7A6D]">Cash · {order.paymentStatus}</span>
                        <span className="font-bold text-[#221611]">₱{order.totalAmount}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
                        <div
                          className={`flex-1 text-center py-1.5 rounded-full text-xs font-bold ${
                            isSelected ? 'bg-[#F2EDE4] text-[#221611]' : 'border border-[#DFD6CC] text-[#6E5D50]'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Verify & Complete'}
                        </div>
                        <button
                          onClick={() => setVoidingOrder(order)}
                          className="px-2.5 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-full text-xs font-medium transition-colors cursor-pointer"
                          title="Void order"
                        >
                          Void
                        </button>
                      </div>
                    </div>
                  );
                })}

                {readyOrders.length === 0 && (
                  <div className="p-4 text-center text-xs text-[#8C7A6D] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DFD6CC]">
                    No orders waiting for pickup
                  </div>
                )}
              </div>
            </div>

            {/* Selected Order Details Panel (4 Cols on xl) */}
            {selectedOrder ? (
              <div className="xl:col-span-4 col-span-1 bg-white rounded-3xl p-5 border border-[#ECE5DC] shadow-xs space-y-4">
                {/* Header Status Tag */}
                <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE3]">
                  {(() => {
                    const pill = getStatusPill(selectedOrder.status);
                    return (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${pill.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pill.dotClass}`}></span>
                        {pill.label}
                      </div>
                    );
                  })()}
                  <span className="text-xs font-mono text-[#8C7A6D]">Ref: {selectedOrder.requestReference}</span>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-3xl font-black font-mono text-[#221611]">
                      {selectedOrder.code || selectedOrder.requestReference}
                    </span>
                    <p className="text-xs font-bold text-[#221611] mt-0.5">{selectedOrder.customerName}</p>
                  </div>
                  <span className="text-xs text-[#8C7A6D]">
                    {selectedOrder.acceptedAt ? 'Accepted' : 'Received just now'}
                  </span>
                </div>

                {/* Call On Display Button (for ready orders) */}
                {selectedOrder.status === 'ready' && (
                  <>
                    <button
                      onClick={() => showNotice(`Called ${selectedOrder.code} on the queue display!`)}
                      className="w-full py-2.5 border border-[#221611] text-[#221611] hover:bg-[#FAF8F5] rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>📢</span>
                      <span>Call {selectedOrder.code} on TV</span>
                    </button>
                    <p className="text-[10px] text-[#8C7A6D] text-center -mt-2">
                      Flash pickup number on the stall queue display.
                    </p>
                  </>
                )}

                {/* Items */}
                <div className="pt-2 border-t border-[#F2ECE3] space-y-2 text-xs">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-[#221611]">{it.quantity} × {it.name}</p>
                        <p className="text-[10px] text-[#7A695C]">
                          {it.size ? `${it.size} · ` : ''}
                          {it.milk ? `${it.milk} · ` : ''}
                          {it.sweetness ? `${it.sweetness} sweet` : ''}
                        </p>
                      </div>
                      <span className="font-bold text-[#221611]">₱{it.price * it.quantity}</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-[#F2ECE3] flex justify-between font-black text-sm text-[#221611]">
                    <span>Total due · Cash</span>
                    <span>₱{selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Action Box based on order status */}
                {selectedOrder.status === 'ready' && (
                  <div className="p-3.5 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] space-y-2.5 text-xs">
                    <div className="font-bold text-[#221611] flex items-center gap-2">
                      <span>💵</span>
                      Verify payment at collection
                    </div>

                    {selectedOrder.paymentStatus === 'verified' ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold">
                        ✓ Cash payment of ₱{selectedOrder.totalAmount} verified
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCashReceived}
                          onChange={e => setIsCashReceived(e.target.checked)}
                          className="rounded text-[#221611]"
                        />
                        <span className="text-xs font-semibold text-[#221611]">
                          I received ₱{selectedOrder.totalAmount} in cash
                        </span>
                      </label>
                    )}

                    <button
                      disabled={!isCashReceived && selectedOrder.paymentStatus !== 'verified'}
                      onClick={handleVerifyCashAndComplete}
                      className={`w-full py-2.5 rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                        isCashReceived || selectedOrder.paymentStatus === 'verified'
                          ? 'bg-[#221611] text-white hover:bg-[#36251E] cursor-pointer'
                          : 'bg-[#DFD6CC] text-[#8C7A6D] cursor-not-allowed'
                      }`}
                    >
                      <span>✓</span>
                      <span>Verify cash & complete</span>
                    </button>

                    <p className="text-[10px] text-[#8C7A6D] text-center">
                      Cannot complete without verifying cash received.
                    </p>
                  </div>
                )}

                {selectedOrder.status === 'pending' && (
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => handleAccept(selectedOrder!.id)}
                      disabled={acceptingOrderId === selectedOrder!.id}
                      className="w-full py-2.5 bg-[#221611] hover:bg-[#36251E] disabled:opacity-50 text-white rounded-full font-bold text-xs transition-colors cursor-pointer"
                    >
                      {acceptingOrderId === selectedOrder!.id ? 'Accepting...' : 'Accept & Assign Pickup #'}
                    </button>
                  </div>
                )}

                {selectedOrder.status === 'confirmed' && (
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder!.id, 'preparing')}
                      className="w-full py-2.5 bg-[#221611] hover:bg-[#36251E] text-white rounded-full font-bold text-xs transition-colors cursor-pointer"
                    >
                      Start Preparing Order
                    </button>
                  </div>
                )}

                {selectedOrder.status === 'preparing' && (
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder!.id, 'ready')}
                      className="w-full py-2.5 bg-[#221611] hover:bg-[#36251E] text-white rounded-full font-bold text-xs transition-colors cursor-pointer"
                    >
                      Mark Ready for Pickup
                    </button>
                  </div>
                )}

                {/* Void Action Button */}
                <div className="pt-2 border-t border-[#F2ECE3]">
                  <button
                    onClick={() => setVoidingOrder(selectedOrder)}
                    className="w-full py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>🚫</span>
                    <span>Void / Cancel this order</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CLEAN EMPTY STATE: Replaces buggy phantom card when no active order exists */
              <div className="xl:col-span-4 col-span-1 bg-white rounded-3xl p-8 border border-dashed border-[#DFD6CC] text-center space-y-3 flex flex-col items-center justify-center min-h-[360px] shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#F2EDE4] flex items-center justify-center text-xl text-[#7A695C]">
                  ☕
                </div>
                <h4 className="font-bold text-sm text-[#221611]">No active order selected</h4>
                <p className="text-xs text-[#8C7A6D] max-w-[240px] leading-relaxed">
                  {activeOrders.length === 0
                    ? 'All orders are cleared! When customers tap to order, incoming requests will appear here.'
                    : 'Select an order from Incoming, In Progress, or Ready to inspect details and verify collection.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Completed or Cancelled Table */
          <div className="mt-5 bg-white rounded-3xl p-6 border border-[#ECE5DC] shadow-xs">
            <h3 className="font-bold text-base text-[#221611] mb-4 capitalize">
              {activeTab} Orders ({activeTab === 'completed' ? completedOrders.length : cancelledOrders.length})
            </h3>
            {((activeTab === 'completed' ? completedOrders : cancelledOrders).length === 0) ? (
              <div className="py-12 text-center text-xs text-[#8C7A6D]">
                No {activeTab} orders recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-[#ECE5DC]">
                {(activeTab === 'completed' ? completedOrders : cancelledOrders).map((ord) => (
                  <div key={ord.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold font-mono text-sm text-[#221611] mr-3">{ord.code || ord.requestReference}</span>
                      <span className="font-medium text-[#7A695C]">{ord.customerName}</span>
                      <span className="text-[#8C7A6D] ml-2">({ord.items.length} items)</span>
                      {ord.cancellationReason && (
                        <span className="text-rose-700 ml-2 italic">— {ord.cancellationReason}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#221611]">₱{ord.totalAmount}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 1. VOID ORDER MODAL                                      */}
      {/* ======================================================== */}
      {voidingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#ECE5DC] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE5DC]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚫</span>
                <h3 className="font-bold text-base text-[#221611]">Void / Cancel Order</h3>
              </div>
              <button
                onClick={() => setVoidingOrder(null)}
                className="w-7 h-7 rounded-full bg-[#F2EDE4] hover:bg-[#EAE2D7] text-[#7A695C] text-xs flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
              <div className="font-bold">
                Order {voidingOrder.code || voidingOrder.requestReference} · {voidingOrder.customerName}
              </div>
              <p className="text-[11px] text-rose-700">
                Total: ₱{voidingOrder.totalAmount} · {voidingOrder.items.length} items. Voiding will cancel this order and remove it from the active queue.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#221611]">Select Reason for Voiding:</label>
              {[
                'Customer requested cancellation',
                'Out of ingredients / sold out',
                'Order placed by mistake / test',
                'Customer did not pick up / no-show',
                'Other',
              ].map(reason => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    voidReason === reason ? 'bg-[#F2EDE4] border-[#221611] font-bold text-[#221611]' : 'border-[#ECE5DC] text-[#6E5D50] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="voidReason"
                    value={reason}
                    checked={voidReason === reason}
                    onChange={() => setVoidReason(reason)}
                    className="text-[#221611]"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              {voidReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify cancellation reason..."
                  value={customVoidReason}
                  onChange={e => setCustomVoidReason(e.target.value)}
                  className="w-full mt-2 p-2.5 bg-white border border-[#DFD6CC] rounded-xl text-xs text-[#221611] focus:outline-hidden focus:border-[#221611]"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#ECE5DC]">
              <button
                onClick={() => setVoidingOrder(null)}
                className="flex-1 py-2.5 border border-[#DFD6CC] hover:bg-[#FAF8F5] text-[#6E5D50] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmVoid}
                disabled={isVoiding}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                {isVoiding ? 'Voiding...' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. DAILY CLOSE & RESET MODAL                             */}
      {/* ======================================================== */}
      {showDailyCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-[#ECE5DC] space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE5DC]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌙</span>
                  <h3 className="font-black text-lg text-[#221611]">End-of-Day Close & Daily Reset</h3>
                </div>
                <p className="text-xs text-[#8C7A6D] mt-0.5">
                  Silangan, San Mateo, Rizal · {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDailyCloseModal(false);
                  setClosureSuccessRecord(null);
                }}
                className="w-7 h-7 rounded-full bg-[#F2EDE4] hover:bg-[#EAE2D7] text-[#7A695C] text-xs flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {closureSuccessRecord ? (
              /* Success State */
              <div className="py-6 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 text-3xl flex items-center justify-center mx-auto">
                  ✓
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#221611]">Stall Closed Successfully!</h4>
                  <p className="text-xs text-[#7A695C] mt-1 max-w-sm mx-auto">
                    Today's transaction summary has been archived. The queue sequence has been reset to A001 for tomorrow.
                  </p>
                </div>

                <div className="p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs space-y-2 text-left max-w-md mx-auto">
                  <div className="flex justify-between font-bold text-[#221611]">
                    <span>Total Cash Revenue:</span>
                    <span>₱{closureSuccessRecord.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#6E5D50]">
                    <span>Completed Orders:</span>
                    <span>{closureSuccessRecord.completedOrders}</span>
                  </div>
                  <div className="flex justify-between text-[#6E5D50]">
                    <span>Voided / Cancelled:</span>
                    <span>{closureSuccessRecord.cancelledOrders}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => dailyCloseService.exportDailyCloseToCSV(closureSuccessRecord)}
                    className="px-4 py-2.5 bg-white border border-[#221611] text-[#221611] rounded-xl text-xs font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    📥 Download CSV Again
                  </button>
                  <button
                    onClick={() => {
                      setShowDailyCloseModal(false);
                      setClosureSuccessRecord(null);
                    }}
                    className="px-6 py-2.5 bg-[#221611] text-white rounded-xl text-xs font-bold hover:bg-[#36251E] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Live Closing Summary State */
              <>
                {/* Metric Summary Grid */}
                {(() => {
                  const summary = dailyCloseService.computeCurrentDaySummary(
                    orders,
                    'Silangan, San Mateo, Rizal',
                    staffUser?.fullName || 'Staff'
                  );
                  return (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#ECE5DC] text-center">
                          <p className="text-[10px] uppercase font-bold text-[#8C7A6D]">Total Sales</p>
                          <p className="text-xl font-black text-[#221611] mt-0.5">₱{summary.totalRevenue}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-emerald-900">
                          <p className="text-[10px] uppercase font-bold text-emerald-700">Completed</p>
                          <p className="text-xl font-black mt-0.5">{summary.completedOrders}</p>
                        </div>
                        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center text-rose-900">
                          <p className="text-[10px] uppercase font-bold text-rose-700">Voided</p>
                          <p className="text-xl font-black mt-0.5">{summary.cancelledOrders}</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center text-amber-900">
                          <p className="text-[10px] uppercase font-bold text-amber-700">Active</p>
                          <p className="text-xl font-black mt-0.5">{summary.pendingOrActiveOrders}</p>
                        </div>
                      </div>

                      {/* Items Sold Breakdown */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold text-[#221611]">
                          <span>Itemized Sales Today</span>
                          <span className="text-[10px] font-normal text-[#8C7A6D]">{summary.itemsSold.length} products sold</span>
                        </div>
                        <div className="max-h-40 overflow-y-auto divide-y divide-[#ECE5DC] border border-[#ECE5DC] rounded-2xl p-2 bg-[#FAF8F5] text-xs">
                          {summary.itemsSold.length === 0 ? (
                            <p className="py-4 text-center text-[#8C7A6D]">No items completed today yet.</p>
                          ) : (
                            summary.itemsSold.map((it, idx) => (
                              <div key={idx} className="py-1.5 px-2 flex justify-between items-center">
                                <div>
                                  <span className="font-semibold text-[#221611]">{it.name}</span>
                                  <span className="text-[#8C7A6D] ml-2">× {it.quantity}</span>
                                </div>
                                <span className="font-bold text-[#221611]">₱{it.revenue}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {summary.pendingOrActiveOrders > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                          <span className="text-base">⚠️</span>
                          <div>
                            <span className="font-bold">Notice: {summary.pendingOrActiveOrders} active orders still open.</span>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                              Clicking "Save & Reset for Tomorrow" will automatically archive and void any uncollected orders so the stall starts completely clean tomorrow.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-[#ECE5DC] flex flex-col sm:flex-row items-center gap-3">
                        <button
                          type="button"
                          onClick={() => dailyCloseService.exportDailyCloseToCSV(summary)}
                          className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#DFD6CC] text-[#221611] rounded-xl text-xs font-bold hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>📥</span>
                          <span>Export CSV Report</span>
                        </button>
                        <button
                          type="button"
                          disabled={isClosingDay}
                          onClick={handleExecuteDailyClose}
                          className="w-full sm:flex-1 py-3 bg-[#221611] hover:bg-[#36251E] disabled:bg-zinc-400 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                        >
                          <span>{isClosingDay ? 'Closing Day...' : '🌙 Save Daily Summary & Reset for Tomorrow'}</span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
