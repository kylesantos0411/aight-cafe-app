import React from 'react';

export const Frame6StaffOrders: React.FC = () => {
  return (
    <div className="w-[880px] bg-[#FAF8F5] text-[#221611] rounded-[36px] p-8 flex flex-col shadow-xl border border-[#ECE5DC] font-sans">
      {/* Header */}
      <div className="flex items-start justify-between pb-6 border-b border-[#ECE5DC]">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xl tracking-tight">aight.</span>
            <span className="text-xs text-[#8C7A6D]">· cafe</span>
          </div>
          <p className="text-xs text-[#8C7A6D] mt-0.5">Silangan, San Mateo, Rizal · Station 01</p>
        </div>

        <div className="text-right">
          <h2 className="text-xl font-bold tracking-tight text-[#221611]">Pickup orders</h2>
          <p className="text-xs text-[#8C7A6D] mt-0.5">Sep 17, 9:41 AM · Silangan, San Mateo, Rizal</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-5">
        <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#221611] text-white">
          Active (4)
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-medium text-[#7A695C] hover:bg-[#F2ECE3]">
          Completed (12)
        </button>
        <button className="px-4 py-1.5 rounded-full text-xs font-medium text-[#7A695C] hover:bg-[#F2ECE3]">
          Cancelled (1)
        </button>
      </div>

      {/* 3 Columns: Incoming, In Progress, Ready */}
      <div className="grid grid-cols-3 gap-5 mt-5">
        {/* COLUMN 1: INCOMING */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#6E5D50] flex items-center justify-between pb-1">
            <span>Incoming</span>
            <span className="text-[10px] text-[#A59588]">2</span>
          </div>

          {/* Card R-910 */}
          <div className="bg-white rounded-2xl p-4 border border-[#ECE5DC] space-y-2.5 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-base font-black font-mono">R-910</span>
                <p className="text-xs font-medium text-[#7A695C]">Sam</p>
              </div>
              <span className="text-[10px] text-[#A59588] bg-[#FAF8F5] px-2 py-0.5 rounded-md">
                Takeout · 9:38 AM
              </span>
            </div>

            <div className="text-xs">
              <p className="font-semibold text-[#221611]">1x Macchiato</p>
              <p className="text-[11px] text-[#8C7A6D]">Regular · Daily · 50% sweet</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button className="flex-1 py-1.5 bg-[#221611] text-white rounded-full text-xs font-semibold hover:bg-[#36251E]">
                Accept
              </button>
              <button className="px-3 py-1.5 border border-[#DFD6CC] text-[#6E5D50] rounded-full text-xs font-medium hover:bg-[#FAF8F5]">
                Reject
              </button>
            </div>
          </div>

          {/* Second card */}
          <div className="bg-white rounded-2xl p-4 border border-[#ECE5DC] space-y-2.5 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-base font-black font-mono">R-911</span>
                <p className="text-xs font-medium text-[#7A695C]">Chloe</p>
              </div>
              <span className="text-[10px] text-[#A59588] bg-[#FAF8F5] px-2 py-0.5 rounded-md">
                Dine in · 9:40 AM
              </span>
            </div>

            <div className="text-xs">
              <p className="font-semibold text-[#221611]">1x Caramel Macchiato</p>
              <p className="text-[11px] text-[#8C7A6D]">Regular · Oat milk</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button className="flex-1 py-1.5 bg-[#221611] text-white rounded-full text-xs font-semibold hover:bg-[#36251E]">
                Accept
              </button>
              <button className="px-3 py-1.5 border border-[#DFD6CC] text-[#6E5D50] rounded-full text-xs font-medium hover:bg-[#FAF8F5]">
                Reject
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: IN PROGRESS */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#6E5D50] flex items-center justify-between pb-1">
            <span>In progress</span>
            <span className="text-[10px] text-[#A59588]">2</span>
          </div>

          {/* Card A041 */}
          <div className="bg-white rounded-2xl p-4 border border-[#ECE5DC] space-y-2.5 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-base font-black font-mono">A041</span>
                <p className="text-xs font-medium text-[#7A695C]">Mia</p>
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                ● Preparing · 6m
              </span>
            </div>

            <div className="text-xs">
              <p className="font-semibold text-[#221611]">1x Iced Americano</p>
              <p className="text-[11px] text-[#8C7A6D]">Regular · 0% sweet</p>
            </div>

            <div className="pt-1">
              <button className="w-full py-1.5 border border-[#221611] text-[#221611] hover:bg-[#221611] hover:text-white rounded-full text-xs font-semibold transition-colors">
                Mark ready
              </button>
            </div>
          </div>

          {/* Card A044 */}
          <div className="bg-white rounded-2xl p-4 border border-[#ECE5DC] space-y-2.5 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-base font-black font-mono">A044</span>
                <p className="text-xs font-medium text-[#7A695C]">Leo</p>
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                ● Preparing
              </span>
            </div>

            <div className="text-xs">
              <p className="font-semibold text-[#221611]">1x Iced Matcha</p>
              <p className="text-[11px] text-[#8C7A6D]">Large · Oat milk</p>
            </div>

            <div className="pt-1">
              <button className="w-full py-1.5 border border-[#221611] text-[#221611] hover:bg-[#221611] hover:text-white rounded-full text-xs font-semibold transition-colors">
                Mark ready
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: READY */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#6E5D50] flex items-center justify-between pb-1">
            <span>Ready</span>
            <span className="text-[10px] text-[#A59588]">2</span>
          </div>

          {/* Card A042 */}
          <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/40 space-y-2.5 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-base font-black font-mono">A042</span>
                <p className="text-xs font-medium text-[#7A695C]">Kyle</p>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                Ready at counter
              </span>
            </div>

            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-[#221611]">1x Iced Latte</p>
              <p className="font-semibold text-[#221611]">1x Chocolate cookie</p>
              <p className="text-[11px] text-[#8C7A6D]">Large · Oat milk</p>
            </div>

            <div className="pt-1">
              <button className="w-full py-1.5 bg-[#221611] text-white rounded-full text-xs font-semibold hover:bg-[#36251E]">
                Delivered order
              </button>
            </div>
          </div>

          {/* Card A040 */}
          <div className="bg-white rounded-2xl p-4 border border-[#ECE5DC] space-y-2.5 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-base font-black font-mono">A040</span>
                <p className="text-xs font-medium text-[#7A695C]">Kai</p>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                Ready
              </span>
            </div>

            <div className="text-xs">
              <p className="font-semibold text-[#221611]">1x Spanish Latte</p>
              <p className="text-[11px] text-[#8C7A6D]">Regular · Daily</p>
            </div>

            <div className="pt-1">
              <button className="w-full py-1.5 border border-[#DFD6CC] text-[#544337] rounded-full text-xs font-medium hover:bg-[#FAF8F5]">
                View order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Closed Table */}
      <div className="mt-8 pt-5 border-t border-[#ECE5DC]">
        <h3 className="text-xs font-bold text-[#6E5D50] mb-3">Recently closed</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] text-[#A59588] uppercase border-b border-[#F2ECE3]">
              <th className="pb-2 font-medium">ORDER #</th>
              <th className="pb-2 font-medium">PICK UP NAME</th>
              <th className="pb-2 font-medium">STATUS</th>
              <th className="pb-2 font-medium text-right">PAYMENT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5EFE8] text-[11px]">
            <tr>
              <td className="py-2.5 font-bold font-mono">A039</td>
              <td className="py-2.5 text-[#544337]">Eric</td>
              <td className="py-2.5">
                <span className="text-emerald-700 font-medium">● Completed</span>
              </td>
              <td className="py-2.5 text-right text-[#6E5D50]">Cash verified · P180</td>
            </tr>
            <tr>
              <td className="py-2.5 font-bold font-mono">A038</td>
              <td className="py-2.5 text-[#544337]">Pat</td>
              <td className="py-2.5">
                <span className="text-emerald-700 font-medium">● Completed</span>
              </td>
              <td className="py-2.5 text-right text-[#6E5D50]">Cash verified · P305</td>
            </tr>
            <tr>
              <td className="py-2.5 font-bold font-mono">A037</td>
              <td className="py-2.5 text-[#544337]">Dan</td>
              <td className="py-2.5">
                <span className="text-red-600 font-medium">● Cancelled</span>
              </td>
              <td className="py-2.5 text-right text-[#6E5D50]">No payment collected</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
