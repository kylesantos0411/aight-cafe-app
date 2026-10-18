import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { queueCardService, type CardActiveOrderResult } from '../services/queueCardService';
import { realtimeHub } from '../services/realtimeService';
import { OrderReceiptCard } from '../components/OrderReceiptCard';
import type { Order } from '../types/cafe';

export const CustomerCardTrackerView: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [cardData, setCardData] = useState<CardActiveOrderResult | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(() => new Date());
  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean>(false);

  const fetchActiveOrder = useCallback(async () => {
    if (!cardId) return;
    try {
      const res = await queueCardService.getCardActiveOrder(cardId);
      setCardData(res);
      setLastRefreshed(new Date());
      setErrorNotice(null);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to resolve queue card.');
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    fetchActiveOrder();

    // Listen to realtime order and queue events
    const unsubOrder = realtimeHub.subscribeToOrders(() => {
      fetchActiveOrder();
    });
    const unsubQueue = realtimeHub.subscribeToQueue(() => {
      fetchActiveOrder();
    });

    // Fallback polling every 4 seconds
    const interval = setInterval(() => {
      fetchActiveOrder();
    }, 4000);

    return () => {
      unsubOrder();
      unsubQueue();
      clearInterval(interval);
    };
  }, [fetchActiveOrder]);

  // Request browser notification when status is ready
  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationsAllowed(true);
        new Notification('Aight Cafe Alerts Enabled', {
          body: `We will notify you here when Card #${cardData?.cardNumber || cardId} is ready for pickup!`,
          icon: '/favicon.ico',
        });
      }
    }
  };

  useEffect(() => {
    if (cardData?.order?.status === 'ready' && notificationsAllowed && 'Notification' in window) {
      try {
        new Notification('Order Ready for Pickup! ☕', {
          body: `${cardData.order.queueNumber} is ready at the counter. Please approach for pickup!`,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore
      }
    }
  }, [cardData?.order?.status, cardData?.order?.queueNumber, notificationsAllowed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-[#221611] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-bold text-[#7A695C]">Reading queue card...</p>
      </div>
    );
  }

  const cardNumber = cardData?.cardNumber || queueCardService.parseCardNumber(cardId || '') || '?';
  const paddedCard = typeof cardNumber === 'number' && cardNumber < 10 ? `0${cardNumber}` : `${cardNumber}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans pb-16 flex flex-col items-center">
      {/* Brand Header */}
      <header className="w-full bg-[#FAF8F5] border-b border-[#ECE5DC] py-4 px-4 sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-[#221611]">aight .</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
              Live Pickup Card
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#8C7A6D]">
            Silangan, San Mateo
          </span>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto px-4 pt-6 space-y-5">
        {errorNotice && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Physical Card Badge */}
        <div className="bg-white rounded-3xl p-6 border border-[#ECE5DC] shadow-xs text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F5] border border-[#DFD6CC] rounded-full text-xs font-bold text-[#7A695C]">
            <span>🏷️</span>
            <span>Physical Queue Card</span>
          </div>

          <div className="text-4xl font-black tracking-tight text-[#221611] font-mono">
            Card #{paddedCard}
          </div>

          <p className="text-xs text-[#7A695C]">
            Permanent NFC & QR Touchpoint · Stall Counter Reusable
          </p>

          {/* Connection / Live Status Indicator */}
          <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-[#8C7A6D]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live updates connected · {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        {/* State A: NO ACTIVE ORDER */}
        {(!cardData?.active || !cardData.order) && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#ECE5DC] shadow-xs text-center space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center text-2xl mx-auto border border-amber-200">
              ☕
            </div>

            <div>
              <h2 className="text-lg font-black text-[#221611]">No Active Order</h2>
              <p className="text-xs text-[#7A695C] mt-1.5 leading-relaxed">
                Card #{paddedCard} is currently idle at the stall counter. When you place your order with the cashier, your live drinks and pickup alert will appear right here.
              </p>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#ECE5DC] text-left text-xs space-y-1 text-[#7A695C]">
              <div className="font-bold text-[#221611] flex items-center gap-1.5">
                <span>🔒</span>
                <span>Privacy & Reusability Protected</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Aight Cafe queue cards are reusable touchpoints. When an order completes, all customer information is cleared from this URL to safeguard your privacy.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/menu"
                className="w-full inline-block py-3 bg-[#221611] hover:bg-[#36251E] text-white rounded-full font-bold text-xs transition-colors shadow-xs"
              >
                Browse Stall Menu
              </Link>
            </div>
          </div>
        )}

        {/* State B: ACTIVE ORDER IN PROGRESS OR READY */}
        {cardData?.active && cardData.order && (
          <div className="space-y-4">
            {/* Live Progress Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#ECE5DC] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A6D]">
                  Current Status
                </span>
                <span className="text-xs font-mono font-bold text-[#7A695C]">
                  Ref: {cardData.order.requestReference}
                </span>
              </div>

              {/* Status Banner */}
              {cardData.order.status === 'ready' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1.5 animate-pulse">
                  <div className="text-2xl">✨</div>
                  <div className="text-base font-black text-emerald-900">
                    Ready for Pickup!
                  </div>
                  <p className="text-xs text-emerald-700">
                    Please show Card #{paddedCard} to the barista at the counter.
                  </p>
                </div>
              ) : cardData.order.status === 'completed' ? (
                <div className="p-4 bg-zinc-100 border border-zinc-200 rounded-2xl text-center space-y-1.5">
                  <div className="text-2xl">✓</div>
                  <div className="text-base font-black text-zinc-900">
                    Order Completed
                  </div>
                  <p className="text-xs text-zinc-600">
                    Enjoy your coffee! Card #{paddedCard} has been returned.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-center space-y-1.5">
                  <div className="text-2xl animate-spin">☕</div>
                  <div className="text-base font-black text-purple-950">
                    Preparing Your Order
                  </div>
                  <p className="text-xs text-purple-800">
                    Your handcrafted drinks and fresh bakes are currently being prepared.
                  </p>
                </div>
              )}

              {/* Push Notification Opt-in if supported and not yet ready */}
              {'Notification' in window && !notificationsAllowed && cardData.order.status !== 'ready' && (
                <button
                  onClick={handleEnableNotifications}
                  type="button"
                  className="w-full py-2.5 px-3 bg-[#FAF8F5] border border-[#DFD6CC] text-[#221611] rounded-2xl text-xs font-bold hover:bg-[#F2EDE4] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🔔</span>
                  <span>Notify me on this phone when ready</span>
                </button>
              )}
            </div>

            {/* Official Order Receipt */}
            <OrderReceiptCard
              order={{
                id: cardData.order.id,
                requestReference: cardData.order.requestReference,
                code: cardData.order.queueNumber,
                queueNumber: cardData.order.queueNumber,
                privateToken: cardData.order.id,
                customerName: cardData.order.customerName,
                orderType: 'takeout',
                items: cardData.order.items,
                subtotal: cardData.order.subtotal,
                totalAmount: cardData.order.totalAmount,
                paymentMethod: cardData.order.paymentMethod,
                paymentStatus: cardData.order.paymentStatus,
                status: cardData.order.status,
                createdAt: cardData.order.createdAt,
              } as Order}
            />
          </div>
        )}

        {/* Stall Location Footer */}
        <div className="text-center text-xs text-[#8C7A6D] pt-4 space-y-1">
          <p className="font-semibold text-[#221611]">Aight Cafe Popup Stall</p>
          <p>Silangan, San Mateo, Rizal · Open 8:00 AM – 6:00 PM</p>
        </div>
      </main>
    </div>
  );
};
