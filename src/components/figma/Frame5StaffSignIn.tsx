import React from 'react';

export const Frame5StaffSignIn: React.FC<{ onSignIn?: () => void }> = ({ onSignIn }) => {
  return (
    <div className="w-[340px] min-h-[680px] bg-[#FAF8F5] text-[#221611] rounded-[36px] p-6 flex flex-col shadow-xl border border-[#ECE5DC] relative overflow-hidden font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 pt-1 border-b border-[#ECE5DC]">
        <div className="flex items-center gap-1">
          <span className="font-bold text-sm tracking-tight">aight.</span>
          <span className="text-[10px] text-[#8C7A6D] ml-0.5">· cafe</span>
        </div>
        <span className="text-[9px] uppercase tracking-wider font-bold text-[#8C7A6D] bg-[#EAE2D7] px-2 py-0.5 rounded-full">
          PROTECTED ACCESS
        </span>
      </div>

      {/* Headline */}
      <div className="mt-8">
        <h1 className="text-2xl font-black tracking-tight text-[#221611]">
          Good morning, team.
        </h1>
        <p className="text-[11px] text-[#7A695C] mt-1.5 leading-snug">
          Sign in with your staff account to manage the Aight Cafe queue.
        </p>
      </div>

      {/* Form Fields */}
      <div className="mt-6 space-y-4 text-xs">
        <div>
          <label className="text-[11px] font-semibold text-[#544337] block mb-1">Work email</label>
          <div className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#DFD6CC] text-[#221611] font-medium text-xs">
            orders@aight.cafe
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-[#544337] block mb-1">Password</label>
          <div className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-[#DFD6CC] text-[#221611] font-medium text-xs flex justify-between items-center">
            <span>••••••••••••</span>
            <span className="text-[#8C7A6D] text-[10px]">👁</span>
          </div>
        </div>

        <button
          onClick={onSignIn}
          className="w-full py-3 bg-[#221611] hover:bg-[#36251E] text-[#FAF8F5] rounded-full font-semibold text-xs transition-colors mt-2"
        >
          Sign in to orders
        </button>

        <div className="text-center pt-1">
          <span className="text-[11px] text-[#8C7A6D] hover:underline cursor-pointer">
            Forgot your password?
          </span>
        </div>
      </div>

      {/* Callout Box */}
      <div className="mt-auto pt-6">
        <div className="p-3.5 bg-[#F2ECE3] rounded-2xl border border-[#E5DDD2] text-[11px]">
          <div className="font-bold text-[#221611] flex items-center gap-1.5 mb-1">
            <span>🔒</span>
            Authorized staff only
          </div>
          <p className="text-[10px] text-[#69584B] leading-relaxed">
            If you need access to this station, speak with a manager to be added to the roster.
          </p>
        </div>

        <div className="text-center text-[10px] text-[#A59588] mt-4">
          Aight Cafe · Silangan, San Mateo, Rizal
        </div>
      </div>

      {/* Home indicator */}
      <div className="h-3 flex items-center justify-center pt-2">
        <div className="w-24 h-1 bg-[#221611]/25 rounded-full"></div>
      </div>
    </div>
  );
};
