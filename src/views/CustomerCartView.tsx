import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const CustomerCartView: React.FC = () => {
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

        {/* Informative Guidance Card */}
        <div className="my-auto py-8 space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#221611] text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            🏪
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#221611] tracking-tight">
              Order at the Stall Counter
            </h1>
            <p className="text-xs sm:text-sm text-[#7A695C] max-w-md mx-auto leading-relaxed">
              Online self-checkout has transitioned to our <strong>Cashier-Operated POS and NFC/QR Queue Card System</strong>.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE5DC] space-y-3.5 shadow-xs text-xs">
            <div className="font-bold text-sm text-[#221611] pb-2 border-b border-[#ECE5DC] flex items-center justify-between">
              <span>How to Order</span>
              <span className="text-[11px] font-semibold text-[#8C7A6D]">Silangan, San Mateo, Rizal</span>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#221611] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-[#221611]">Choose your drinks:</strong>
                <p className="text-[#7A695C] mt-0.5">Browse handcrafted coffees, matcha, and pastries on our live digital menu.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#221611] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-[#221611]">Order & pay with the cashier:</strong>
                <p className="text-[#7A695C] mt-0.5">Visit the counter at our stall. We accept exact Cash and verified GCash transfers.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#221611] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-[#221611]">Receive your physical Queue Card (1–20):</strong>
                <p className="text-[#7A695C] mt-0.5">You'll receive a physical card with your queue number and a secure NFC/QR link.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#221611] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
              <div>
                <strong className="text-[#221611]">Tap or scan to track live prep:</strong>
                <p className="text-[#7A695C] mt-0.5">Tap the card to your phone or scan the QR code to watch the barista prep your order and download your receipt.</p>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 px-6 bg-[#221611] hover:bg-[#36251E] text-[#FAF8F5] rounded-2xl font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            >
              <span>☕</span>
              <span>Browse Digital Menu & Prices</span>
            </button>

            <button
              onClick={() => navigate('/track')}
              className="w-full py-3.5 px-6 bg-white hover:bg-[#FAF8F5] text-[#221611] border border-[#DFD6CC] rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>🏷️</span>
              <span>Track an Existing Queue Card</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-6 border-t border-[#ECE5DC] text-center text-xs text-[#8C7A6D]">
          <span>Silangan, San Mateo, Rizal · Pickup only</span>
        </footer>
      </div>
    </div>
  );
};
