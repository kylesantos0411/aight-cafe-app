import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const StaffLogin: React.FC = () => {
  const { loginStaff } = useCafe();
  const [email, setEmail] = useState('team@aight.cafe');
  const [password, setPassword] = useState('barista2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginStaff(password);
    if (!success) {
      setError('Please provide a valid work email and password.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#EAE3DA] p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5EFE8] text-[#5C4A3E] rounded-full text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5" />
            Staff sign in · Protected access
          </div>
          <div>
            <span className="font-display font-black text-3xl tracking-tight text-[#241A15]">aight.</span>
            <span className="text-xs font-bold text-[#8A7667] ml-1.5 tracking-widest">CAFE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#241A15] mt-3">
            Good morning, team.
          </h1>
          <p className="text-xs text-[#7A695C] mt-1 leading-relaxed">
            Sign in with your staff account to manage the Aight Cafe queue.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#544337] block mb-1">Work email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="barista@aight.cafe"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE3DA] text-xs text-[#241A15] focus:outline-hidden focus:ring-1 focus:ring-[#241812]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#544337] block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE3DA] text-xs text-[#241A15] pr-10 focus:outline-hidden focus:ring-1 focus:ring-[#241812]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7667] hover:text-[#241A15]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-[11px] text-[#8A7667] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#241812] hover:bg-[#38261D] text-[#FAF8F5] rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
          >
            Sign in to orders
          </button>
        </form>

        {/* Footer Notice */}
        <div className="mt-6 pt-4 border-t border-[#F0EAE1] flex items-center justify-center gap-1.5 text-[11px] text-[#8A7667]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Authorized staff only</span>
        </div>
      </div>
    </div>
  );
};
