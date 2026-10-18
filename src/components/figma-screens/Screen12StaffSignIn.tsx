import React, { useState } from 'react';

interface Props {
  onSignIn?: () => void;
}

export const Screen12StaffSignIn: React.FC<Props> = ({ onSignIn }) => {
  const [email, setEmail] = useState('kylesantos0411@gmail.com');
  const [password, setPassword] = useState('Kyl3$ant0s');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-[480px] min-h-[840px] bg-[#FAF8F5] text-[#221611] rounded-[44px] p-10 flex flex-col shadow-2xl border border-[#EAE3DA] font-sans relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#ECE5DC]">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-2xl tracking-tight text-[#221611]">aight .</span>
          <span className="text-[10px] font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
            CAFE
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A6D] bg-[#ECE5DC] px-2.5 py-1 rounded-full">
          STAFF ONLY
        </span>
      </div>

      {/* Lock Icon */}
      <div className="mt-8">
        <div className="w-12 h-12 rounded-2xl bg-[#F2EDE4] flex items-center justify-center text-xl text-[#7A695C]">
          🔒
        </div>
      </div>

      {/* Headline */}
      <div className="mt-4">
        <h1 className="text-3xl font-black text-[#221611]">Good morning, team.</h1>
        <p className="text-xs text-[#7A695C] mt-2 leading-relaxed max-w-[340px]">
          Sign in with your staff account to manage the Aight Cafe queue.
        </p>
      </div>

      {/* Form */}
      <div className="mt-8 space-y-4 text-xs">
        <div>
          <label className="font-bold text-[#221611] block mb-1.5">Work email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-2xl border border-[#DFD6CC] text-xs font-medium text-[#221611] focus:outline-hidden focus:ring-1 focus:ring-[#221611]"
          />
        </div>

        <div>
          <label className="font-bold text-[#221611] block mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-2xl border border-[#DFD6CC] text-xs font-medium text-[#221611] pr-10 focus:outline-hidden focus:ring-1 focus:ring-[#221611]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8C7A6D]"
            >
              👁
            </button>
          </div>
        </div>

        <button
          onClick={onSignIn}
          className="w-full py-4 bg-[#523E32] hover:bg-[#3D2D23] text-[#FAF8F5] rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10 mt-2"
        >
          <span>→</span>
          <span>Sign in to orders</span>
        </button>

        <div className="text-left pt-1">
          <button className="text-xs text-[#8C7A6D] hover:underline">
            Forgot password?
          </button>
        </div>
      </div>

      {/* Authorized staff card */}
      <div className="mt-auto pt-8">
        <div className="p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] text-xs space-y-1">
          <div className="font-bold text-[#221611] flex items-center gap-2">
            <span>🛡</span>
            Authorized staff only
          </div>
          <p className="text-[11px] text-[#69584B] leading-relaxed">
            Need access? Ask your stall manager. Customer order links don't grant staff access.
          </p>
        </div>

        <div className="text-center text-[11px] text-[#A59588] mt-6">
          Aight Cafe · The Courtyard
        </div>
      </div>
    </div>
  );
};
