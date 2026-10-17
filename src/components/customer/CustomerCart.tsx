import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { ArrowLeft, Trash2, Plus, Minus, CreditCard, Wallet, Banknote, Coffee } from 'lucide-react';

export const CustomerCart: React.FC = () => {
  const {
    cart,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setCustomerScreen,
    createOrder,
  } = useCafe();

  const [customerName, setCustomerName] = useState('Kyle A.');
  const [orderType, setOrderType] = useState<'takeout' | 'dine-in'>('takeout');
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Maya' | 'Card' | 'Cash at Counter'>('Card');
  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsPlacing(true);

    setTimeout(() => {
      createOrder({
        customerName: customerName || 'Guest',
        orderType,
        notes,
      });
      setIsPlacing(false);
      setCustomerScreen('status-ready');
    }, 600);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-full bg-[#FAF8F5] text-[#241A15] p-5">
        <div className="flex items-center gap-2 pb-4 border-b border-[#EAE3DA]">
          <button
            onClick={() => setCustomerScreen('menu')}
            className="p-1.5 -ml-1.5 text-[#5C4A3E] hover:text-[#241A15] transition-colors rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">Your Cart</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="w-16 h-16 rounded-full bg-[#EAE3DA] flex items-center justify-center text-[#7D6B5E] mb-3">
            <Coffee className="w-8 h-8 opacity-70" />
          </div>
          <h2 className="text-base font-bold text-[#241A15]">Your cart is empty</h2>
          <p className="text-xs text-[#7A695C] mt-1 max-w-xs">
            Explore the fresh artisan drinks and pastries to get your aight order started.
          </p>
          <button
            onClick={() => setCustomerScreen('menu')}
            className="mt-6 px-6 py-2.5 bg-[#241812] text-[#FAF8F5] rounded-xl text-xs font-semibold hover:bg-[#38261D] transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAF8F5] text-[#241A15] p-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE3DA]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomerScreen('menu')}
            className="p-1.5 -ml-1.5 text-[#5C4A3E] hover:text-[#241A15] transition-colors rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">Checkout Order</span>
        </div>
        <button
          onClick={clearCart}
          className="text-[11px] text-[#8A7667] hover:text-red-600 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Cart Items List */}
      <div className="mt-4 space-y-2.5">
        {cart.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-3 border border-[#ECE5DC] flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-xl object-cover bg-[#EAE3DA] shrink-0"
              />
              <div className="min-w-0 text-xs">
                <p className="font-bold text-[#241A15] truncate">{item.name}</p>
                {(item.size || item.milk || item.sweetness) && (
                  <p className="text-[10px] text-[#7A695C] truncate mt-0.5">
                    {[item.size, item.milk, item.sweetness].filter(Boolean).join(' · ')}
                  </p>
                )}
                <span className="font-semibold text-[#241A15] font-display">₱{item.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 border border-[#E0D7CC] rounded-lg px-1.5 py-0.5 bg-[#FAF8F5]">
                <button
                  onClick={() => updateCartQuantity(item.id, -1)}
                  className="p-1 hover:bg-[#EAE3DA] rounded text-[#5C4A3E]"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.id, 1)}
                  className="p-1 hover:bg-[#EAE3DA] rounded text-[#5C4A3E]"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="p-1 text-[#9E8E81] hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dine-in vs Takeout Toggle */}
      <div className="mt-5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7A695C] block mb-2">
          Order Preference
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOrderType('takeout')}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
              orderType === 'takeout'
                ? 'bg-[#241812] text-white border-[#241812]'
                : 'bg-white text-[#5C4A3E] border-[#E8DFD5]'
            }`}
          >
            Takeout / To-Go
          </button>
          <button
            type="button"
            onClick={() => setOrderType('dine-in')}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
              orderType === 'dine-in'
                ? 'bg-[#241812] text-white border-[#241812]'
                : 'bg-white text-[#5C4A3E] border-[#E8DFD5]'
            }`}
          >
            Dine In
          </button>
        </div>
      </div>

      {/* Customer Name input */}
      <div className="mt-4">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7A695C] block mb-1.5">
          Pick up name
        </label>
        <input
          type="text"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          placeholder="e.g. Kyle"
          className="w-full px-3 py-2 bg-white rounded-xl border border-[#EAE3DA] text-xs font-medium text-[#241A15] focus:outline-hidden focus:ring-1 focus:ring-[#241812]"
        />
      </div>

      {/* Order Notes */}
      <div className="mt-4">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7A695C] block mb-1.5">
          Order Notes (Optional)
        </label>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Extra napkins, leave room for milk"
          className="w-full px-3 py-2 bg-white rounded-xl border border-[#EAE3DA] text-xs font-medium text-[#241A15] focus:outline-hidden focus:ring-1 focus:ring-[#241812]"
        />
      </div>

      {/* Payment Method Selector */}
      <div className="mt-4">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7A695C] block mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'Card', label: 'Credit / Debit', icon: CreditCard },
            { id: 'GCash', label: 'GCash e-Wallet', icon: Wallet },
            { id: 'Maya', label: 'Maya Pay', icon: Wallet },
            { id: 'Cash at Counter', label: 'Cash at Counter', icon: Banknote },
          ].map(pm => {
            const Icon = pm.icon;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethod(pm.id as any)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  paymentMethod === pm.id
                    ? 'bg-[#241812] text-white border-[#241812]'
                    : 'bg-white text-[#5C4A3E] border-[#E8DFD5] hover:border-[#C4B4A5]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span className="text-[11px] font-semibold truncate">{pm.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Box */}
      <div className="mt-5 p-3.5 bg-white rounded-2xl border border-[#ECE5DC] space-y-1.5 text-xs">
        <div className="flex justify-between text-[#7A695C]">
          <span>Subtotal</span>
          <span>₱{cartTotal}</span>
        </div>
        <div className="flex justify-between text-[#7A695C]">
          <span>VAT / Taxes</span>
          <span className="text-[10px] text-emerald-700">Included</span>
        </div>
        <div className="pt-2 border-t border-[#F0EAE1] flex justify-between font-bold text-sm text-[#241A15]">
          <span>Total</span>
          <span className="font-display">₱{cartTotal}</span>
        </div>
      </div>

      {/* Place Order CTA */}
      <div className="mt-6">
        <button
          onClick={handleCheckout}
          disabled={isPlacing}
          className="w-full py-3.5 bg-[#241812] hover:bg-[#38261D] text-[#FAF8F5] rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm disabled:opacity-75"
        >
          {isPlacing ? (
            <span>Sending to Barista...</span>
          ) : (
            <>
              <span>Confirm Order</span>
              <span>·</span>
              <span className="font-display">₱{cartTotal}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
