import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

export const CustomerLoginView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTarget = searchParams.get('redirect');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.signInCustomer(email, password);
      const safeTarget = redirectTarget && redirectTarget.startsWith('/') ? redirectTarget : '/account/orders';
      navigate(safeTarget);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221611] font-sans flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 selection:bg-[#221611] selection:text-[#FAF8F5]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE5DC] shadow-sm space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE3]">
          <Link to="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <span className="font-black text-2xl tracking-tight text-[#221611]">aight .</span>
            <span className="text-[10px] font-bold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
              CAFE
            </span>
          </Link>
          <span className="text-xs font-semibold text-[#8C7A6D]">Sign In</span>
        </div>

        <div>
          <h1 className="text-2xl font-black text-[#221611]">Welcome back.</h1>
          <p className="text-xs text-[#7A695C] mt-1">
            Sign in to track your pickup orders and view your order history.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#221611] mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@domain.com"
              className="w-full px-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DFD6CC] text-xs font-medium text-[#221611] focus:outline-hidden focus:ring-1 focus:ring-[#221611]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#221611] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#FAF8F5] rounded-xl border border-[#DFD6CC] text-xs font-medium text-[#221611] focus:outline-hidden focus:ring-1 focus:ring-[#221611]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#221611] hover:bg-[#36251E] text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#8C7A6D] space-y-3">
          <p>
            Don't have an account?{' '}
            <Link
              to={redirectTarget ? `/register?redirect=${encodeURIComponent(redirectTarget)}` : '/register'}
              className="font-bold text-[#221611] hover:underline"
            >
              Create an account
            </Link>
          </p>

          <div className="border-t border-[#F2ECE3] pt-4">
            <Link to="/" className="text-xs text-[#7A695C] hover:text-[#221611]">
              ← Continue as guest to menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
