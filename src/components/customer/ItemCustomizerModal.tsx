import React, { useState } from 'react';
import type { MenuItem } from '../../types/cafe';
import { X, Plus, Minus } from 'lucide-react';

interface Props {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (customizedItem: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
    milk?: string;
    sweetness?: string;
    temperature?: 'Hot' | 'Iced';
    notes?: string;
  }) => void;
}

export const ItemCustomizerModal: React.FC<Props> = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(item?.options?.sizes?.[0]?.name || '');
  const [selectedMilk, setSelectedMilk] = useState(item?.options?.milks?.[0]?.name || '');
  const [selectedSweetness, setSelectedSweetness] = useState(item?.options?.sweetness?.[0] || '');
  const [selectedTemp, setSelectedTemp] = useState<'Hot' | 'Iced'>(
    item?.options?.temperatures?.[0] || 'Iced'
  );
  const [notes, setNotes] = useState('');

  if (!item) return null;

  // Calculate base price + options
  const sizeExtra = item.options?.sizes?.find(s => s.name === selectedSize)?.price || 0;
  const milkExtra = item.options?.milks?.find(m => m.name === selectedMilk)?.price || 0;
  const unitPrice = item.price + sizeExtra + milkExtra;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart({
      menuItemId: item.id,
      name: item.name,
      price: unitPrice,
      quantity,
      image: item.image,
      size: selectedSize || undefined,
      milk: selectedMilk || undefined,
      sweetness: selectedSweetness || undefined,
      temperature: item.options?.temperatures ? selectedTemp : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] text-[#241A15] w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-[#EAE3DA]">
        {/* Modal Header */}
        <div className="relative h-44 sm:h-48 overflow-hidden bg-[#241812]">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E8D9CD]">
              {item.category}
            </span>
            <h2 className="text-xl font-bold text-white font-display">{item.name}</h2>
            <p className="text-xs text-[#DDD3CA] line-clamp-1 mt-0.5">{item.description}</p>
          </div>
        </div>

        {/* Customization Options Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Temperature Option */}
          {item.options?.temperatures && (
            <div>
              <label className="font-semibold text-[#544337] uppercase tracking-wider block mb-2">
                Temperature
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.options.temperatures.map(temp => (
                  <button
                    key={temp}
                    type="button"
                    onClick={() => setSelectedTemp(temp)}
                    className={`py-2.5 px-3 rounded-xl border text-center font-semibold transition-all ${
                      selectedTemp === temp
                        ? 'bg-[#241812] text-white border-[#241812]'
                        : 'bg-white text-[#5C4A3E] border-[#E8DFD5] hover:border-[#C4B4A5]'
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Option */}
          {item.options?.sizes && (
            <div>
              <label className="font-semibold text-[#544337] uppercase tracking-wider block mb-2">
                Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.options.sizes.map(size => (
                  <button
                    key={size.name}
                    type="button"
                    onClick={() => setSelectedSize(size.name)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      selectedSize === size.name
                        ? 'bg-[#241812] text-white border-[#241812]'
                        : 'bg-white text-[#5C4A3E] border-[#E8DFD5] hover:border-[#C4B4A5]'
                    }`}
                  >
                    <div className="font-semibold">{size.name}</div>
                    <div className={`text-[11px] ${selectedSize === size.name ? 'text-[#D9CBC0]' : 'text-[#8A786B]'}`}>
                      {size.price > 0 ? `+₱${size.price}` : 'Standard'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk Option */}
          {item.options?.milks && (
            <div>
              <label className="font-semibold text-[#544337] uppercase tracking-wider block mb-2">
                Milk Choice
              </label>
              <div className="space-y-1.5">
                {item.options.milks.map(milk => (
                  <button
                    key={milk.name}
                    type="button"
                    onClick={() => setSelectedMilk(milk.name)}
                    className={`w-full p-2.5 rounded-xl border flex justify-between items-center transition-all ${
                      selectedMilk === milk.name
                        ? 'bg-[#241812] text-white border-[#241812]'
                        : 'bg-white text-[#5C4A3E] border-[#E8DFD5] hover:border-[#C4B4A5]'
                    }`}
                  >
                    <span className="font-medium">{milk.name}</span>
                    <span className={`text-[11px] ${selectedMilk === milk.name ? 'text-[#D9CBC0]' : 'text-[#8A786B]'}`}>
                      {milk.price > 0 ? `+₱${milk.price}` : 'Included'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sweetness */}
          {item.options?.sweetness && (
            <div>
              <label className="font-semibold text-[#544337] uppercase tracking-wider block mb-2">
                Sweetness Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.options.sweetness.map(sweet => (
                  <button
                    key={sweet}
                    type="button"
                    onClick={() => setSelectedSweetness(sweet)}
                    className={`p-2 rounded-xl border text-center font-medium transition-all ${
                      selectedSweetness === sweet
                        ? 'bg-[#241812] text-white border-[#241812]'
                        : 'bg-white text-[#5C4A3E] border-[#E8DFD5] hover:border-[#C4B4A5]'
                    }`}
                  >
                    {sweet}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div>
            <label className="font-semibold text-[#544337] uppercase tracking-wider block mb-1.5">
              Special Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Extra ice, cinnamon on top"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-[#E8DFD5] text-[#241A15] placeholder-[#A49487] focus:outline-hidden focus:ring-1 focus:ring-[#241812]"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#EAE3DA] flex items-center justify-between gap-3">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 border border-[#E0D7CC] rounded-xl px-2 py-1.5 bg-[#FAF8F5]">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-1 hover:bg-[#EAE3DA] rounded-lg transition-colors text-[#5C4A3E]"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold w-5 text-center text-xs">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="p-1 hover:bg-[#EAE3DA] rounded-lg transition-colors text-[#5C4A3E]"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            className="flex-1 py-3 bg-[#241812] hover:bg-[#38261D] text-[#FAF8F5] rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Add to order</span>
            <span className="opacity-75 font-normal">·</span>
            <span className="font-display font-bold">₱{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
