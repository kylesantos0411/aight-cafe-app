import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { useCafe } from '../context/CafeContext';
import { calculateAuthoritativeItemPrice } from '../services/orderCalculator';
import type { MenuItem, CartItem, ReceiptSnapshot, QueueCard } from '../types/cafe';

const createPosCartItemId = () => `pos_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

export const AdminPosView: React.FC = () => {
  const {
    menuItems,
    createDraftOrder,
    confirmPosPaymentAndAllocateCard,
    queueCards,
    staffUser,
  } = useCafe();

  // Selected Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // POS Current Ticket
  const [ticketItems, setTicketItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [orderType, setOrderType] = useState<'takeout' | 'dine-in'>('takeout');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'Cash at Counter' | 'GCash'>('Cash at Counter');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [gcashVerified, setGcashVerified] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Modal State
  const [successReceipt, setSuccessReceipt] = useState<{
    receipt: ReceiptSnapshot;
    queueNumber: string;
    card: QueueCard;
  } | null>(null);

  // Item Customizer Modal for POS
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customSize, setCustomSize] = useState<string>('Regular (12 oz)');
  const [customMilk, setCustomMilk] = useState<string>('Dairy');
  const [customSweetness, setCustomSweetness] = useState<string>('25%');
  const [customExtraShot, setCustomExtraShot] = useState<boolean>(false);
  const [customQuantity, setCustomQuantity] = useState<number>(1);

  // Filter menu items
  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    menuItems.forEach(i => set.add(i.category));
    return Array.from(set);
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Ticket totals
  const subtotal = ticketItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = subtotal; // No extra fees at pickup stall
  const totalItemsCount = ticketItems.reduce((sum, item) => sum + item.quantity, 0);

  // Capacity calculation from 20 registered physical queue cards
  const availableCardsCount = queueCards.filter(c => c.status === 'available').length;
  const occupiedCardsCount = queueCards.filter(c => c.status === 'occupied').length;
  const heldCardsCount = queueCards.filter(c => c.status === 'held_for_recovery').length;

  // Change calculation
  const tenderedNum = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - totalAmount);

  // Add Item to Ticket
  const handleOpenCustomizer = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCustomizingItem(item);
    setCustomSize(item.options?.sizes?.[0]?.name || 'Regular (12 oz)');
    setCustomMilk(item.options?.milks?.[0]?.name || 'Dairy');
    setCustomSweetness('25%');
    setCustomExtraShot(false);
    setCustomQuantity(1);
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;

    const priceCalc = calculateAuthoritativeItemPrice(customizingItem, {
      size: customSize,
      milk: customMilk,
      sweetness: customSweetness,
      extraShot: customExtraShot,
      quantity: customQuantity,
    });

    const notesSummary = [
      customSize,
      customMilk !== 'Dairy' ? customMilk : null,
      customSweetness ? `${customSweetness} sweet` : null,
      customExtraShot ? '+Shot' : null,
    ].filter(Boolean).join(' · ');

    const newCartItem: CartItem = {
      id: `pos_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: customizingItem.id,
      name: customizingItem.name,
      price: priceCalc.unitPrice,
      basePrice: customizingItem.price,
      quantity: customQuantity,
      image: customizingItem.image,
      size: customSize,
      milk: customMilk,
      sweetness: customSweetness,
      extraShot: customExtraShot,
      notes: notesSummary || undefined,
    };

    setTicketItems(prev => [...prev, newCartItem]);
    setCustomizingItem(null);
  };

  // Quick Add for items without options (like pastries)
  const handleQuickAdd = (item: MenuItem) => {
    if (!item.isAvailable) return;
    if (item.options?.sizes?.length || item.options?.milks?.length) {
      handleOpenCustomizer(item);
      return;
    }
    const newCartItem: CartItem = {
      id: createPosCartItemId(),
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      basePrice: item.price,
      quantity: 1,
      image: item.image,
    };
    setTicketItems(prev => [...prev, newCartItem]);
  };

  const updateItemQty = (id: string, delta: number) => {
    setTicketItems(prev =>
      prev
        .map(i => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setTicketItems(prev => prev.filter(i => i.id !== id));
  };

  const clearTicket = () => {
    setTicketItems([]);
    setCustomerName('');
    setOrderNotes('');
    setAmountTendered('');
    setGcashVerified(false);
    setErrorMessage(null);
  };

  // 1. Hold as Unpaid Draft
  const handleSaveDraft = async () => {
    if (ticketItems.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await createDraftOrder(ticketItems, {
        customerName: customerName.trim() || 'Counter Guest',
        orderType,
        notes: orderNotes.trim() || undefined,
        expiresInMinutes: 15,
      });
      alert('Draft created successfully. It will remain unpaid until customer tenders payment.');
      clearTicket();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create draft order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Confirm Payment & Allocate Card
  const handleConfirmPaymentAndAllocate = async () => {
    if (ticketItems.length === 0 || isSubmitting) return;

    if (availableCardsCount === 0) {
      setErrorMessage('All 20 physical queue cards are currently occupied. Cannot accept new orders until an active order completes.');
      return;
    }

    if (paymentMethod === 'Cash at Counter' && tenderedNum < totalAmount) {
      setErrorMessage(`Tendered cash (₱${tenderedNum}) is less than order total (₱${totalAmount}).`);
      return;
    }

    if (paymentMethod === 'GCash' && !gcashVerified) {
      setErrorMessage('Please confirm that you have visually verified the customer\'s GCash transfer.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Step 1: Create draft order
      const draft = await createDraftOrder(ticketItems, {
        customerName: customerName.trim() || 'Counter Guest',
        orderType,
        notes: orderNotes.trim() || undefined,
      });

      // Step 2: Confirm payment & atomically allocate card
      const paymentAmount = paymentMethod === 'Cash at Counter' ? tenderedNum : totalAmount;
      const res = await confirmPosPaymentAndAllocateCard(
        draft.id,
        paymentMethod,
        paymentAmount
      );

      // Step 3: Show receipt modal
      setSuccessReceipt({
        receipt: res.receipt,
        queueNumber: res.queueNumber,
        card: res.card,
      });

      clearTicket();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete checkout and allocate card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Cashier POS" subtitle="Stall counter ordering & queue card dispatch">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        {/* Top Operational Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#ECE5DC] shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏪</span>
            <div>
              <div className="font-bold text-xs text-[#221611]">
                Aight Cafe Counter POS · Cashier: <strong>{staffUser?.fullName || 'Kyle Santos'}</strong>
              </div>
              <p className="text-[11px] text-[#7A695C]">
                Silangan, San Mateo, Rizal · Direct physical queue card dispatch
              </p>
            </div>
          </div>

          {/* 20 Physical Cards Capacity Gauge */}
          <div className="flex items-center gap-3 bg-[#FAF8F5] px-3.5 py-2 rounded-xl border border-[#DFD6CC] text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span>🏷️ Cards:</span>
              <span className={`px-2 py-0.5 rounded-md font-mono ${
                availableCardsCount > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
              }`}>
                {availableCardsCount} / 20 Available
              </span>
            </div>
            <div className="text-[10px] text-[#8C7A6D] hidden md:block">
              ({occupiedCardsCount} in prep · {heldCardsCount} held)
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-900 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main POS Split Layout: Menu Browser (Left) vs Current Ticket (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Menu Catalog & Categories (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search and Category Filter */}
            <div className="bg-white p-4 rounded-3xl border border-[#ECE5DC] shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search coffee, drinks, pastries..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DFD6CC] rounded-xl px-3.5 py-2 text-xs text-[#221611] focus:outline-hidden focus:border-[#221611]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-[#8C7A6D]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Categories Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#221611] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-[#7A695C] border border-[#DFD6CC] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {filteredMenuItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleQuickAdd(item)}
                  className={`bg-white rounded-2xl p-3 border border-[#ECE5DC] shadow-2xs flex flex-col justify-between transition-all select-none ${
                    item.isAvailable
                      ? 'hover:border-[#221611] hover:shadow-xs cursor-pointer active:scale-[0.98]'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#FAF8F5] mb-2.5 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {!item.isAvailable && (
                      <span className="absolute inset-0 bg-black/60 text-white font-bold text-[10px] flex items-center justify-center uppercase tracking-wider">
                        Sold Out
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-[#221611] leading-tight line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-[#8C7A6D] mt-0.5 line-clamp-1">{item.category}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F2ECE3]">
                    <span className="font-mono font-black text-xs text-[#221611]">
                      ₱{item.price}
                    </span>
                    <button
                      type="button"
                      disabled={!item.isAvailable}
                      className="w-6 h-6 rounded-lg bg-[#221611] text-white text-xs font-bold flex items-center justify-center hover:bg-[#36251E] disabled:bg-[#DFD6CC]"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: POS Register / Current Order Ticket (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#ECE5DC] shadow-xs p-4 sm:p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE5DC]">
              <div>
                <h2 className="font-black text-base text-[#221611]">Current Order Ticket</h2>
                <span className="text-[10px] text-[#8C7A6D]">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
                </span>
              </div>
              {ticketItems.length > 0 && (
                <button
                  onClick={clearTicket}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Customer Details & Order Type */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#8C7A6D] block mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Counter Guest"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DFD6CC] rounded-xl px-2.5 py-1.5 text-xs text-[#221611] focus:outline-hidden focus:border-[#221611]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8C7A6D] block mb-1">
                  Order Type
                </label>
                <div className="grid grid-cols-2 gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#DFD6CC]">
                  <button
                    type="button"
                    onClick={() => setOrderType('takeout')}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      orderType === 'takeout' ? 'bg-[#221611] text-white shadow-2xs' : 'text-[#7A695C]'
                    }`}
                  >
                    Takeout
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('dine-in')}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      orderType === 'dine-in' ? 'bg-[#221611] text-white shadow-2xs' : 'text-[#7A695C]'
                    }`}
                  >
                    Dine-in
                  </button>
                </div>
              </div>
            </div>

            {/* Ticket Items List */}
            <div className="flex-1 max-h-64 overflow-y-auto space-y-2 pr-1 border-b border-[#ECE5DC] pb-3">
              {ticketItems.length === 0 ? (
                <div className="text-center py-8 text-[#8C7A6D]">
                  <div className="text-2xl mb-1">🧾</div>
                  <p className="text-xs font-semibold">No items added yet</p>
                  <p className="text-[10px]">Click menu items on the left to build order</p>
                </div>
              ) : (
                ticketItems.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#ECE5DC] flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-[#221611] line-clamp-1">{item.name}</div>
                      {item.notes && <div className="text-[10px] text-[#7A695C]">{item.notes}</div>}
                      <div className="font-mono text-[11px] text-[#8C7A6D] mt-0.5">
                        ₱{item.price} each
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-[#DFD6CC] rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateItemQty(item.id, -1)}
                          className="px-2 py-0.5 text-xs font-bold text-[#221611] hover:bg-[#F2EDE4]"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQty(item.id, 1)}
                          className="px-2 py-0.5 text-xs font-bold text-[#221611] hover:bg-[#F2EDE4]"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-mono font-bold text-xs text-[#221611] min-w-[50px] text-right">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-[#8C7A6D] hover:text-rose-600 px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-[#7A695C]">
                <span>Subtotal</span>
                <span className="font-mono font-medium">₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#221611] pt-1 border-t border-[#ECE5DC]">
                <span>Total Amount Due</span>
                <span className="font-mono text-lg text-[#221611]">₱{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector: Cash vs GCash */}
            <div className="space-y-2 pt-2 border-t border-[#ECE5DC]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6D] block">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('Cash at Counter');
                    setAmountTendered(totalAmount.toString());
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'Cash at Counter'
                      ? 'bg-[#221611] text-white border-[#221611] shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#7A695C] border-[#DFD6CC] hover:bg-[#F2EDE4]'
                  }`}
                >
                  <span>💵</span>
                  <span>Cash at Counter</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('GCash');
                    setAmountTendered(totalAmount.toString());
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'GCash'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#7A695C] border-[#DFD6CC] hover:bg-[#F2EDE4]'
                  }`}
                >
                  <span>📱</span>
                  <span>GCash Transfer</span>
                </button>
              </div>

              {/* Cash Tendered & Change Computation */}
              {paymentMethod === 'Cash at Counter' && (
                <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#DFD6CC] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-[#7A695C]">Cash Tendered:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold">₱</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amountTendered}
                        onChange={e => setAmountTendered(e.target.value)}
                        className="w-24 bg-white border border-[#DFD6CC] rounded-lg px-2 py-1 text-right font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  {/* Preset Cash Buttons */}
                  <div className="flex gap-1.5 justify-end">
                    {[totalAmount, 200, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountTendered(amt.toString())}
                        className="px-2 py-0.5 bg-white border border-[#DFD6CC] rounded-md text-[10px] font-mono font-bold hover:bg-[#F2EDE4] cursor-pointer"
                      >
                        ₱{amt}
                      </button>
                    ))}
                  </div>

                  {/* Change Due */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#DFD6CC]">
                    <span className="font-bold text-[#221611]">Change Due:</span>
                    <span className={`font-mono text-sm font-black ${changeDue >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      ₱{changeDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* GCash Verification Checkbox */}
              {paymentMethod === 'GCash' && (
                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gcashVerified}
                      onChange={e => setGcashVerified(e.target.checked)}
                      className="mt-0.5 rounded-sm text-blue-600"
                    />
                    <span className="text-[11px] leading-tight font-medium">
                      <strong>Cashier visual confirmation:</strong> I have personally checked the customer's GCash receipt for <strong>₱{totalAmount.toFixed(2)}</strong>.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Action Buttons: Hold Draft vs Confirm Payment & Allocate Card */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={ticketItems.length === 0 || isSubmitting || availableCardsCount === 0}
                onClick={handleConfirmPaymentAndAllocate}
                className="w-full py-3.5 bg-[#221611] hover:bg-[#36251E] disabled:bg-[#DFD6CC] text-white rounded-2xl font-bold text-xs transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>🏷️</span>
                <span>
                  {isSubmitting
                    ? 'Processing & Allocating...'
                    : `Confirm Payment & Allocate Card (#${queueCards.find(c => c.status === 'available')?.cardNumber || '?'})`}
                </span>
              </button>

              <button
                type="button"
                disabled={ticketItems.length === 0 || isSubmitting}
                onClick={handleSaveDraft}
                className="w-full py-2 bg-white border border-[#DFD6CC] hover:bg-[#FAF8F5] text-[#7A695C] rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Hold as Unpaid Draft (15m auto-expire)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. CUSTOMIZATION MODAL                                  */}
      {/* ======================================================== */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#ECE5DC] space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE5DC]">
              <div>
                <h3 className="font-black text-base text-[#221611]">{customizingItem.name}</h3>
                <p className="text-xs text-[#7A695C]">Customize drinks for order ticket</p>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#7A695C] flex items-center justify-center font-bold hover:bg-[#F2EDE4]"
              >
                ✕
              </button>
            </div>

            {/* Size Options */}
            {customizingItem.options?.sizes && (
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#8C7A6D] block">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {customizingItem.options.sizes.map(s => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setCustomSize(s.name)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        customSize === s.name
                          ? 'border-[#221611] bg-[#FAF8F5] text-[#221611]'
                          : 'border-[#DFD6CC] text-[#7A695C]'
                      }`}
                    >
                      {s.name} {s.price > 0 && `(+₱${s.price})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Milk Options */}
            {customizingItem.options?.milks && (
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#8C7A6D] block">Milk Option</label>
                <div className="grid grid-cols-3 gap-2">
                  {customizingItem.options.milks.map(m => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setCustomMilk(m.name)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        customMilk === m.name
                          ? 'border-[#221611] bg-[#FAF8F5] text-[#221611]'
                          : 'border-[#DFD6CC] text-[#7A695C]'
                      }`}
                    >
                      {m.name} {m.price > 0 && `(+₱${m.price})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sweetness */}
            {customizingItem.options?.sweetness && (
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#8C7A6D] block">Sweetness Level</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {customizingItem.options.sweetness.map(sw => (
                    <button
                      key={sw}
                      type="button"
                      onClick={() => setCustomSweetness(sw)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        customSweetness === sw
                          ? 'border-[#221611] bg-[#FAF8F5] text-[#221611]'
                          : 'border-[#DFD6CC] text-[#7A695C]'
                      }`}
                    >
                      {sw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Extra Shot */}
            <div className="pt-1">
              <label className="flex items-center gap-2 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#DFD6CC] cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={customExtraShot}
                  onChange={e => setCustomExtraShot(e.target.checked)}
                  className="rounded-sm text-[#221611]"
                />
                <span className="font-bold text-[#221611]">Add Extra Espresso Shot (+₱30)</span>
              </label>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between pt-2 border-t border-[#ECE5DC]">
              <span className="text-xs font-bold text-[#221611]">Quantity</span>
              <div className="flex items-center border border-[#DFD6CC] rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCustomQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-1 font-bold text-xs text-[#221611] hover:bg-[#F2EDE4]"
                >
                  -
                </button>
                <span className="px-3 font-mono font-bold text-xs">{customQuantity}</span>
                <button
                  type="button"
                  onClick={() => setCustomQuantity(q => q + 1)}
                  className="px-3 py-1 font-bold text-xs text-[#221611] hover:bg-[#F2EDE4]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmCustomization}
                className="w-full py-3 bg-[#221611] hover:bg-[#36251E] text-white rounded-xl font-bold text-xs transition-colors"
              >
                Add to Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SUCCESS RECEIPT MODAL                                */}
      {/* ======================================================== */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#ECE5DC] space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center text-2xl mx-auto border border-emerald-200">
              ✓
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Payment Verified & Order Accepted
              </span>
              <h2 className="text-2xl font-black text-[#221611] mt-2 font-mono">
                {successReceipt.queueNumber}
              </h2>
              <p className="text-xs text-[#7A695C] mt-1">
                Hand Physical <strong>Card #{successReceipt.card.cardNumber}</strong> to customer now.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#ECE5DC] text-left text-xs space-y-2">
              <div className="flex justify-between text-[#8C7A6D] text-[11px]">
                <span>Order Ref: {successReceipt.receipt.requestReference}</span>
                <span>{successReceipt.receipt.paymentMethod}</span>
              </div>
              <div className="font-bold text-[#221611]">
                Customer: {successReceipt.receipt.customerName}
              </div>

              <div className="border-t border-[#ECE5DC] pt-2 space-y-1">
                {successReceipt.receipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity}x {it.name}</span>
                    <span className="font-mono">₱{it.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#ECE5DC] pt-2 flex justify-between font-black text-sm text-[#221611]">
                <span>Total Paid</span>
                <span className="font-mono">₱{successReceipt.receipt.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-white border border-[#DFD6CC] hover:bg-[#FAF8F5] text-[#221611] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                🖨️ Print Slip
              </button>
              <button
                type="button"
                onClick={() => setSuccessReceipt(null)}
                className="flex-1 py-2.5 bg-[#221611] hover:bg-[#36251E] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Next Order
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
