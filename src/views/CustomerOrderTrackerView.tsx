import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { orderService } from '../services/orderService';
import { realtimeHub } from '../services/realtimeService';
import type { Order } from '../types/cafe';

import { Screen05Pending } from '../components/figma-screens/Screen05Pending';
import { Screen06Confirmed } from '../components/figma-screens/Screen06Confirmed';
import { Screen07Preparing } from '../components/figma-screens/Screen07Preparing';
import { Screen08Ready } from '../components/figma-screens/Screen08Ready';
import { Screen09Completed } from '../components/figma-screens/Screen09Completed';
import { Screen10Cancelled } from '../components/figma-screens/Screen10Cancelled';
import { Screen11ConnectionLost } from '../components/figma-screens/Screen11ConnectionLost';

export const CustomerOrderTrackerView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isOffline, setActiveOrder } = useCafe();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!token) return;
    try {
      const fetched = await orderService.getOrderByPrivateToken(token);
      if (fetched) {
        setOrder(fetched);
        setActiveOrder(fetched);
      }
    } catch (err) {
      console.warn('Failed to fetch order by token:', err);
    } finally {
      setLoading(false);
    }
  }, [token, setActiveOrder]);

  useEffect(() => {
    fetchOrder();

    // Subscribe to realtime updates for this order
    const unsubscribeOrders = realtimeHub.subscribeToOrders((updatedOrder) => {
      if (updatedOrder.privateToken === token || updatedOrder.id === order?.id) {
        setOrder(updatedOrder);
        setActiveOrder(updatedOrder);
      }
    });

    const unsubscribeQueue = realtimeHub.subscribeToQueue(() => {
      fetchOrder();
    });

    return () => {
      unsubscribeOrders();
      unsubscribeQueue();
    };
  }, [fetchOrder, token, order?.id, setActiveOrder]);

  if (isOffline) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 font-sans">
        <Screen11ConnectionLost onRetry={fetchOrder} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-sm text-[#8C7A6D]">
        Retrieving order status...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="text-4xl">🔍</div>
        <h2 className="text-lg font-bold text-[#221611]">Order not found</h2>
        <p className="text-sm text-[#7A695C] max-w-xs">
          This order link may be expired or invalid. Please check your link or place a new order.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-6 py-3 bg-[#221611] text-white rounded-xl text-xs font-bold hover:bg-[#36251E] cursor-pointer"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 font-sans">
      {order.status === 'pending' && <Screen05Pending />}
      {order.status === 'confirmed' && <Screen06Confirmed />}
      {order.status === 'preparing' && <Screen07Preparing />}
      {order.status === 'ready' && <Screen08Ready />}
      {order.status === 'completed' && <Screen09Completed onBackToMenu={() => navigate('/')} />}
      {order.status === 'cancelled' && <Screen10Cancelled onBackToMenu={() => navigate('/')} />}
    </div>
  );
};
