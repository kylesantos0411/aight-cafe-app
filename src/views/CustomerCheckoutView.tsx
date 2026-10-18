import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const CustomerCheckoutView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans flex flex-col selection:bg-[#221611] selection:text-[#FAF8F5]">
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 flex-1 flex flex-col justify-between">
        {/* Navigation Header */}
        <header className="flex items-center justify-between pb-4 border-b border-[#ECE5DC]">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold text-[#221611] hover:text-[#5C4A3E] p-1 -ml-1 transition-colors"
          >
            <span>←</span>
            <span>Back to menu</span>
          </Link>
          <span className="font-bold text-xs uppercase tracking-wider text-[#7A695C]">Counter Ordering</span>
        </header>

        {/* Counter Notice Box */}
        <div className="my-auto py-8 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#221611] text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            ☕
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#221611] tracking-tight">
              Counter Checkout Only
            </h1>
            <p className="text-xs sm:text-sm text-[#7A695C] max-w-md mx-auto leading-relaxed">
              To guarantee drink freshness and immediate card allocation, all order tickets and payments are handled exclusively at our counter POS in <strong>Silangan, San Mateo, Rizal</strong>.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE5DC] space-y-3 shadow-xs text-xs">
            <div className="font-bold text-sm text-[#221611] pb-2 border-b border-[#ECE5DC] flex items-center justify-between">
              <span>Payment & Card Dispatch</span>
              <span className="text-[11px] font-semibold text-emerald-700">Cash / GCash</span>
            </div>
            <p className="text-[#69584B] leading-relaxed">
              When ordering with the barista, you will pay by cash or verified GCash. Once confirmed, you will receive one of our 20 physical NFC/QR queue cards.
            </p>
            <p className="text-[#69584B] leading-relaxed">
              Tap or scan the card anytime to view live queue progress and your downloadable receipt.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 px-6 bg-[#221611] hover:bg-[#36251E] text-[#FAF8F5] rounded-2xl font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            >
              <span>☕</span>
              <span>View Coffee & Pastry Menu</span>
            </button>

            <button
              onClick={() => navigate('/track')}
              className="w-full py-3.5 px-6 bg-white hover:bg-[#FAF8F5] text-[#221611] border border-[#DFD6CC] rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>🏷️</span>
              <span>Track Queue Card</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-6 border-t border-[#ECE5DC] text-center text-xs text-[#8C7A6D]">
          <span>Aight Cafe · Silangan, San Mateo, Rizal</span>
        </footer>
      </div>
    </div>
  );
};
