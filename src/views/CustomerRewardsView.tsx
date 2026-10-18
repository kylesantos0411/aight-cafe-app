import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { loyaltyService, type LoyaltySummary } from '../services/loyaltyService';
import { nfcAnalyticsService } from '../services/nfcAnalyticsService';
import type { CustomerUser } from '../types/cafe';

export const CustomerRewardsView: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const source = searchParams.get('source') || 'nfc';
    nfcAnalyticsService.logTap('rewards', source === 'qr' ? 'qr' : 'nfc', window.location.pathname);

    try {
      const user = await authService.getCustomerSession();
      setCustomer(user);

      if (user) {
        const summary = await loyaltyService.getCustomerLoyaltySummary(user.id);
        setLoyalty(summary);
      }
    } catch (err) {
      console.warn('Failed to load loyalty rewards:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const copyVoucher = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const stampsBalance = loyalty?.stampsBalance || 0;
  const stampsRequired = loyalty?.stampsRequired || 8;
  const progressPercent = Math.min(100, Math.round((stampsBalance / stampsRequired) * 100));

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans flex flex-col selection:bg-[#221611] selection:text-[#FAF8F5]">
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 md:py-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b border-[#ECE5DC]">
          <Link to="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <span className="font-extrabold text-2xl tracking-tight text-[#221611]">aight .</span>
            <span className="text-[10px] font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
              CAFE
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>☕</span>
              <span>Aight Rewards</span>
            </span>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-3 border-[#221611] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#7A695C] mt-4 font-semibold">Loading your rewards card...</p>
          </div>
        ) : (
          <div className="mt-6 flex-1 flex flex-col space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#221611] tracking-tight">
                {customer ? `Welcome back, ${customer.fullName.split(' ')[0]}.` : 'Aight Coffee Rewards.'}
              </h1>
              <p className="text-xs sm:text-sm text-[#7A695C] mt-1.5 leading-relaxed">
                Collect 8 stamps at our Silangan, San Mateo, Rizal stall. Enjoy a handcrafted beverage on us.
              </p>
            </div>

            {/* Stamp Card Component */}
            <div className="bg-[#221611] text-[#FAF8F5] rounded-3xl p-6 sm:p-7 shadow-xl border border-[#3D2D23] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#C7B9AC]">
                    Digital Stamp Card
                  </span>
                  <div className="text-lg font-bold">Silangan, San Mateo, Rizal Stall</div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black tracking-tight text-amber-200">
                    {customer ? stampsBalance : 0}
                  </span>
                  <span className="text-xs text-[#A8988B]"> / {stampsRequired}</span>
                </div>
              </div>

              {/* Stamp Grid (8 slots) */}
              <div className="grid grid-cols-4 gap-3 sm:gap-4 my-6">
                {Array.from({ length: stampsRequired }).map((_, idx) => {
                  const isEarned = customer ? idx < stampsBalance : false;
                  const isGoal = idx === stampsRequired - 1;

                  return (
                    <div
                      key={idx}
                      className={`h-16 sm:h-18 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        isEarned
                          ? 'bg-[#FAF8F5] text-[#221611] shadow-md scale-100'
                          : isGoal
                          ? 'bg-amber-900/30 border-2 border-dashed border-amber-400/50 text-amber-200'
                          : 'bg-white/5 border border-white/10 text-white/30'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">
                        {isEarned ? '☕' : isGoal ? '🎁' : '⚪'}
                      </span>
                      <span
                        className={`text-[9px] font-bold mt-1 tracking-wider ${
                          isEarned ? 'text-[#523E32]' : 'text-white/40'
                        }`}
                      >
                        {isGoal ? 'FREE' : `#${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar & Note */}
              <div className="space-y-2">
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-300 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#C7B9AC]">
                  <span>
                    {customer
                      ? stampsBalance >= stampsRequired
                        ? '🎉 Reward unlocked! Free drink ready.'
                        : `${stampsRequired - stampsBalance} more stamp${stampsRequired - stampsBalance === 1 ? '' : 's'} until free coffee`
                      : 'Sign in to start collecting stamps'}
                  </span>
                  <span className="font-bold">{customer ? `${progressPercent}%` : '0%'}</span>
                </div>
              </div>
            </div>

            {/* If NOT authenticated CTA */}
            {!customer && (
              <div className="p-6 bg-white rounded-3xl border border-[#ECE5DC] shadow-xs space-y-4">
                <div className="font-bold text-sm text-[#221611]">Start earning loyalty stamps</div>
                <p className="text-xs text-[#7A695C] leading-relaxed">
                  Stamps are automatically credited whenever your pickup order is completed at the stall. Create an account or sign in to save your rewards across devices.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    to="/login?redirect=/rewards"
                    className="py-3 px-4 bg-[#221611] hover:bg-[#3D2D23] text-white rounded-xl font-bold text-xs text-center transition-colors shadow-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="py-3 px-4 bg-[#FAF8F5] hover:bg-[#F2EDE4] text-[#221611] border border-[#DFD6CC] rounded-xl font-bold text-xs text-center transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}

            {/* Active Reward Vouchers Section (if customer has any) */}
            {customer && loyalty && loyalty.vouchers.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#7A695C] uppercase tracking-wider px-1">
                  Available Rewards ({loyalty.vouchers.filter(v => v.status === 'available').length})
                </div>

                {loyalty.vouchers.map(v => (
                  <div
                    key={v.id}
                    className={`p-5 rounded-2xl sm:rounded-3xl border transition-all ${
                      v.status === 'available'
                        ? 'bg-amber-50/60 border-amber-200/80 shadow-xs'
                        : 'bg-white border-[#ECE5DC] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">☕</span>
                          <span className="font-bold text-sm text-[#221611]">{v.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              v.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {v.status === 'available' ? 'Ready to claim' : v.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#7A695C] mt-1">
                          {v.description || 'Up to ₱180 value on any handcrafted drink.'}
                        </p>
                      </div>
                      <div className="text-right font-black text-sm text-[#221611]">
                        ₱{v.discountAmount}
                      </div>
                    </div>

                    {v.status === 'available' && (
                      <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#7A695C] block">
                            Voucher Code
                          </span>
                          <span className="font-mono font-bold text-xs text-[#221611] tracking-wider">
                            {v.voucherCode}
                          </span>
                        </div>
                        <button
                          onClick={() => copyVoucher(v.voucherCode)}
                          className="px-3.5 py-1.5 bg-[#221611] hover:bg-[#3D2D23] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                        >
                          {copiedCode === v.voucherCode ? '✓ Copied' : 'Copy Code'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* How It Works & Eligibility Rules */}
            <div className="p-5 bg-white rounded-3xl border border-[#ECE5DC] space-y-3 text-xs shadow-2xs">
              <div className="font-bold text-sm text-[#221611] flex items-center gap-2">
                <span>📋</span>
                <span>Loyalty Rules & Eligibility</span>
              </div>
              <ul className="space-y-2 text-[#7A695C] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#221611] font-bold">•</span>
                  <span><strong>1 Stamp per Order:</strong> Earned automatically whenever an order of at least ₱{loyalty?.minOrderAmount || 100} is completed with verified payment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#221611] font-bold">•</span>
                  <span><strong>8 Stamps = Free Coffee:</strong> Once you collect 8 stamps, a ₱180 drink voucher is unlocked in your account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#221611] font-bold">•</span>
                  <span><strong>Fraud-Proof:</strong> Each qualifying order is processed at most once on the database server. Balances are cryptographically secured.</span>
                </li>
              </ul>
            </div>

            {/* Recent Loyalty Transactions History (if signed in) */}
            {customer && loyalty && loyalty.transactions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#7A695C] uppercase tracking-wider px-1">
                  Rewards Activity History
                </div>
                <div className="bg-white rounded-2xl border border-[#ECE5DC] divide-y divide-[#ECE5DC]">
                  {loyalty.transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-[#221611]">{tx.description}</div>
                        <div className="text-[10px] text-[#8C7A6D]">
                          {new Date(tx.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          tx.stampsDelta > 0 ? 'text-emerald-700' : 'text-amber-800'
                        }`}
                      >
                        {tx.stampsDelta > 0 ? `+${tx.stampsDelta} stamp` : `${tx.stampsDelta} stamps`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back link */}
            <div className="pt-4 text-center text-xs text-[#8C7A6D]">
              <Link to="/" className="hover:underline font-semibold text-[#221611]">
                ← Back to Menu
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
