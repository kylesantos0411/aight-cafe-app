import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';

interface Props {
  onOpenQueueDisplay?: () => void;
  onSignOut?: () => void;
}

export const Screen13StaffOrders: React.FC<Props> = ({ onOpenQueueDisplay, onSignOut }) => {
  const { orders, acceptOrder, updateOrderStatus, verifyCashPayment } = useCafe();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ord_sample_a042');
  const [isCashReceived, setIsCashReceived] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders by search
  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.code.toLowerCase().includes(q) ||
      o.requestReference.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q)
    );
  });

  const incomingOrders = filteredOrders.filter(o => o.status === 'pending');
  const inProgressOrders = filteredOrders.filter(o => o.status === 'confirmed' || o.status === 'preparing');
  const readyOrders = filteredOrders.filter(o => o.status === 'ready');
  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled');

  const selectedOrder = orders.find(o => o.id === selectedOrderId || o.code === selectedOrderId) || readyOrders[0] || orders[0];

  const handleAccept = async (orderId: string) => {
    try {
      const updated = await acceptOrder(orderId);
      setSelectedOrderId(updated.id);
      showNotice(`Accepted order ${updated.code}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'cancelled', 'Rejected by stall operator');
      showNotice('Order rejected');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVerifyCashAndComplete = async () => {
    if (!selectedOrder) return;
    try {
      await verifyCashPayment(selectedOrder.id);
      await updateOrderStatus(selectedOrder.id, 'completed');
      setIsCashReceived(false);
      showNotice(`Order ${selectedOrder.code} completed and verified!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const showNotice = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="w-[1440px] min-h-[1144px] bg-[#FAF8F5] text-[#221611] rounded-[44px] flex shadow-2xl border border-[#EAE3DA] font-sans relative overflow-hidden select-none">
      {/* Left Sidebar (180px) */}
      <aside className="w-[180px] bg-[#F2EDE4] p-5 flex flex-col justify-between border-r border-[#E5DDD2] shrink-0">
        <div className="space-y-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#221611]">aight .</span>
              <span className="text-[9px] font-semibold tracking-widest text-[#7A695C] bg-[#EAE2D7] px-1.5 py-0.5 rounded-full">
                CAFE
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-bold text-[#221611] uppercase tracking-wider">THE COURTYARD</p>
              <p className="text-[10px] text-[#8C7A6D]">Saturday service</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <button className="w-full flex items-center gap-2 px-3 py-2 bg-white text-[#221611] rounded-xl shadow-xs border border-[#E5DDD2]">
              <span>📋</span>
              <span>Orders</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-[#7A695C] hover:bg-white/60 rounded-xl transition-colors">
              <span>☕</span>
              <span>Availability</span>
            </button>
            <button
              onClick={onOpenQueueDisplay}
              className="w-full flex items-center gap-2 px-3 py-2 text-[#7A695C] hover:bg-white/60 rounded-xl transition-colors"
            >
              <span>📺</span>
              <span>Queue display</span>
            </button>
          </nav>
        </div>

        {/* User Info at Bottom */}
        <div className="pt-4 border-t border-[#E5DDD2] space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#221611] text-white flex items-center justify-center font-bold text-xs">
              M
            </div>
            <div className="text-[11px] leading-tight">
              <div className="font-bold text-[#221611]">Mia</div>
              <div className="text-[9px] text-[#8C7A6D]">Stall operator</div>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="text-[11px] text-[#8C7A6D] hover:text-[#221611] font-medium"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area (1260px) */}
      <main className="flex-1 flex flex-col p-8 overflow-x-auto">
        {/* Workspace Header */}
        <div className="flex justify-between items-center pb-5 border-b border-[#ECE5DC]">
          <div>
            <h1 className="text-2xl font-black text-[#221611]">Pickup orders</h1>
            <p className="text-xs text-[#8C7A6D] mt-0.5">Sat, 17 Oct · 9:48 AM · The Courtyard</p>
          </div>

          <div className="flex items-center gap-3">
            {actionSuccessMsg && (
              <div className="px-3 py-1 bg-[#E8F3EB] text-[#246B3E] rounded-full text-xs font-bold border border-[#D2E7D7] animate-fade-in">
                ✓ {actionSuccessMsg}
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F3EB] text-[#246B3E] rounded-full text-xs font-semibold border border-[#D2E7D7]">
              <span className="w-2 h-2 rounded-full bg-[#246B3E] animate-pulse"></span>
              Live · updated just now
            </div>

            <button
              onClick={onOpenQueueDisplay}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#DFD6CC] text-[#221611] rounded-xl text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
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
                className="pl-8 pr-3 py-1.5 bg-white border border-[#DFD6CC] rounded-xl text-xs text-[#221611] placeholder-[#A49588] focus:outline-hidden w-48"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6D]">🔍</span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'active' ? 'bg-[#221611] text-white' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
            }`}
          >
            Active {incomingOrders.length + inProgressOrders.length + readyOrders.length}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'completed' ? 'bg-[#221611] text-white' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
            }`}
          >
            Completed ({completedOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'cancelled' ? 'bg-[#221611] text-white' : 'text-[#7A695C] hover:bg-[#F2EDE4]'
            }`}
          >
            Cancelled ({cancelledOrders.length})
          </button>
        </div>

        {activeTab === 'active' ? (
          /* Active Board + Selected Details Panel */
          <div className="mt-5 grid grid-cols-12 gap-6 items-start">
            {/* Active Order Board (8 Cols) */}
            <div className="col-span-8 grid grid-cols-3 gap-4">
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
                      selectedOrder?.id === order.id ? 'border-[#221611] ring-1 ring-[#221611]' : 'border-[#ECE5DC]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-base font-black font-mono text-[#221611]">{order.code}</span>
                        <p className="text-xs font-medium text-[#7A695C]">{order.customerName}</p>
                      </div>
                      <span className="text-[10px] text-[#8C7A6D] bg-[#FAF8F5] px-2 py-0.5 rounded-md">
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
                        className="flex-1 py-1.5 bg-[#221611] text-white rounded-full text-xs font-bold hover:bg-[#36251E] transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        className="px-3 py-1.5 border border-[#DFD6CC] text-[#6E5D50] rounded-full text-xs font-medium hover:bg-[#FAF8F5] transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                    <p className="text-[9px] text-[#A59588] text-center pt-0.5">
                      Accept to assign a unique pickup number.
                    </p>
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
                      selectedOrder?.id === order.id ? 'border-[#221611] ring-1 ring-[#221611]' : 'border-[#ECE5DC]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-base font-black font-mono text-[#221611]">{order.code}</span>
                        <p className="text-xs font-medium text-[#7A695C]">{order.customerName}</p>
                      </div>
                      <span className="text-[10px] text-[#8C7A6D] bg-[#FAF8F5] px-2 py-0.5 rounded-md">
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

                    <div className="pt-1" onClick={e => e.stopPropagation()}>
                      {order.status === 'confirmed' ? (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="w-full py-1.5 bg-[#FAF8F5] border border-[#DFD6CC] text-[#221611] hover:bg-[#F2EDE4] rounded-full text-xs font-bold transition-colors"
                        >
                          Start preparing
                        </button>
                      ) : (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="w-full py-1.5 bg-[#221611] text-white hover:bg-[#36251E] rounded-full text-xs font-bold transition-colors"
                        >
                          Mark as ready
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
                        isSelected ? 'border-[#221611] ring-1 ring-[#221611]' : 'border-[#ECE5DC]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-base font-black font-mono text-[#221611]">{order.code}</span>
                          <p className="text-xs font-medium text-[#7A695C]">{order.customerName}</p>
                        </div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
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

                      <div className={`text-center py-1.5 rounded-full text-xs font-bold ${
                        isSelected ? 'bg-[#F2EDE4] text-[#221611]' : 'border border-[#DFD6CC] text-[#6E5D50]'
                      }`}>
                        {isSelected ? 'Selected order' : 'View pickup'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Order Details Panel (4 Cols) */}
            {selectedOrder ? (
              <div className="col-span-4 bg-white rounded-3xl p-5 border border-[#ECE5DC] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE3]">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F3EB] text-[#246B3E] rounded-full text-[10px] font-bold border border-[#D2E7D7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#246B3E]"></span>
                    {selectedOrder.status === 'ready'
                      ? 'Ready for pickup'
                      : selectedOrder.status === 'preparing'
                      ? 'Preparing'
                      : selectedOrder.status === 'confirmed'
                      ? 'Confirmed'
                      : 'Pending acceptance'}
                  </div>
                  <span className="text-xs font-mono text-[#8C7A6D]">Ref: {selectedOrder.requestReference}</span>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-3xl font-black font-mono text-[#221611]">{selectedOrder.code}</span>
                    <p className="text-xs font-bold text-[#221611] mt-0.5">{selectedOrder.customerName}</p>
                  </div>
                  <span className="text-xs text-[#8C7A6D]">
                    {selectedOrder.acceptedAt ? 'Accepted' : 'Received just now'}
                  </span>
                </div>

                {selectedOrder.status === 'ready' && (
                  <>
                    <button
                      onClick={() => showNotice(`Called ${selectedOrder.code} on the queue display!`)}
                      className="w-full py-2.5 border border-[#221611] text-[#221611] hover:bg-[#FAF8F5] rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>📢</span>
                      <span>Call {selectedOrder.code} again</span>
                    </button>
                    <p className="text-[10px] text-[#8C7A6D] text-center -mt-2">
                      Called on the stall queue display screen.<br />Stall sound is muted.
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

                {/* Cash Verification Box */}
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
                        ? 'bg-[#221611] text-white hover:bg-[#36251E]'
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
              </div>
            ) : null}
          </div>
        ) : (
          /* Completed or Cancelled Table */
          <div className="mt-5 bg-white rounded-3xl p-6 border border-[#ECE5DC] shadow-xs">
            <h3 className="font-bold text-base text-[#221611] mb-4 capitalize">
              {activeTab} Orders ({activeTab === 'completed' ? completedOrders.length : cancelledOrders.length})
            </h3>
            <div className="divide-y divide-[#ECE5DC]">
              {(activeTab === 'completed' ? completedOrders : cancelledOrders).map((ord) => (
                <div key={ord.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold font-mono text-sm text-[#221611] mr-3">{ord.code}</span>
                    <span className="font-medium text-[#7A695C]">{ord.customerName}</span>
                    <span className="text-[#8C7A6D] ml-2">({ord.items.length} items)</span>
                    {ord.cancellationReason && (
                      <span className="text-rose-700 ml-2 italic">— {ord.cancellationReason}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#221611]">₱{ord.totalAmount}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.status === 'completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
