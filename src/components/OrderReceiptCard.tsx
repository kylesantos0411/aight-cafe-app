import React, { useState } from 'react';
import type { Order } from '../types/cafe';

interface OrderReceiptCardProps {
  order: Order;
  compact?: boolean;
}

export const OrderReceiptCard: React.FC<OrderReceiptCardProps> = ({ order, compact = false }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/order/${order.privateToken}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(order.requestReference || order.code);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Just now';

  const isAssigned = Boolean(order.queueNumber);

  return (
    <div className="w-full bg-white rounded-3xl border border-[#ECE5DC] p-5 sm:p-6 shadow-xs text-xs font-sans text-[#221611]">
      {/* Top Receipt Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#ECE5DC]">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#8C7A6D] font-bold block">
            Official Order Receipt
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono font-black text-sm text-[#221611]">
              {order.requestReference || order.code}
            </span>
            <button
              onClick={handleCopyRef}
              type="button"
              className="text-[10px] text-[#7A695C] hover:text-[#221611] font-bold bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E5DDD2] cursor-pointer"
            >
              {copiedRef ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Queue Number / Status Badge */}
        <div className="text-right">
          {isAssigned ? (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold block">
                Pickup Number
              </span>
              <span className="font-mono text-xl font-black text-[#221611]">
                {order.queueNumber}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-[10px] font-bold border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
              Queue number pending acceptance
            </div>
          )}
        </div>
      </div>

      {/* Meta Details */}
      <div className="grid grid-cols-2 gap-3 py-3 border-b border-[#F2ECE3] text-[11px]">
        <div>
          <span className="text-[#8C7A6D] block">Customer</span>
          <span className="font-bold text-[#221611] truncate block">{order.customerName}</span>
          {order.phone && <span className="text-[#7A695C] text-[10px] block">{order.phone}</span>}
        </div>
        <div>
          <span className="text-[#8C7A6D] block">Placed At</span>
          <span className="font-medium text-[#221611] block">{formattedDate}</span>
        </div>
        <div className="col-span-2">
          <span className="text-[#8C7A6D] block">Pickup Location</span>
          <span className="font-medium text-[#221611] flex items-center gap-1">
            <span>📍</span>
            <span>Silangan, San Mateo, Rizal · Aight Cafe popup</span>
          </span>
        </div>
      </div>

      {/* Itemized Order Items */}
      <div className="py-3 border-b border-[#F2ECE3] space-y-2.5">
        <span className="text-[10px] uppercase tracking-wider text-[#8C7A6D] font-bold block">
          Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
        </span>
        {order.items.map((item, idx) => {
          const itemSubtotal = item.price * item.quantity;
          return (
            <div key={item.id || idx} className="flex justify-between items-start text-xs">
              <div className="flex-1 pr-3">
                <div className="font-bold text-[#221611]">
                  <span>{item.quantity}x </span>
                  <span>{item.name}</span>
                </div>
                {/* Customizations summary */}
                {item.notes ? (
                  <div className="text-[11px] text-[#7A695C] mt-0.5">{item.notes}</div>
                ) : (
                  (item.size || item.milk || item.sweetness) && (
                    <div className="text-[10px] text-[#7A695C] mt-0.5">
                      {[item.size, item.milk, item.sweetness ? `${item.sweetness} sweet` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  )
                )}
              </div>
              <div className="font-mono font-bold text-[#221611]">
                ₱{itemSubtotal.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary */}
      <div className="py-3 border-b border-[#F2ECE3] space-y-1.5 text-xs">
        <div className="flex justify-between text-[#7A695C]">
          <span>Subtotal</span>
          <span className="font-mono font-medium text-[#221611]">₱{order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-black text-[#221611] pt-1">
          <span>Total Amount</span>
          <span className="font-mono text-base text-[#221611]">₱{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Status Pill */}
      <div className="py-3 border-b border-[#F2ECE3] flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#8C7A6D] font-bold block">
            Payment Method
          </span>
          <span className="font-bold text-xs text-[#221611]">Cash at pickup counter</span>
        </div>
        <div>
          {order.paymentStatus === 'verified' ? (
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center gap-1">
              <span>✓</span> Paid / Verified
            </span>
          ) : order.paymentStatus === 'voided' ? (
            <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-[10px] font-bold">
              Voided
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold flex items-center gap-1">
              <span>💵</span> Unpaid · Pay at counter
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: Copy Link & Print Receipt */}
      {!compact && (
        <div className="pt-3.5 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleCopyLink}
            type="button"
            className="flex-1 py-2.5 px-3 bg-[#FAF8F5] border border-[#DFD6CC] text-[#221611] rounded-xl text-xs font-bold hover:bg-[#F2EDE4] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>🔗</span>
            <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Order Tracking Link'}</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="py-2.5 px-4 bg-white border border-[#DFD6CC] text-[#221611] rounded-xl text-xs font-bold hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>🖨️</span>
            <span>Print Receipt</span>
          </button>
        </div>
      )}
    </div>
  );
};
