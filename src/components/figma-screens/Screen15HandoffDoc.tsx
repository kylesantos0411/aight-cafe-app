import React from 'react';

export const Screen15HandoffDoc: React.FC = () => {
  return (
    <div className="w-[1000px] min-h-[1132px] bg-[#FAF8F5] text-[#221611] rounded-[44px] p-12 flex flex-col justify-between shadow-2xl border border-[#EAE3DA] font-sans relative overflow-hidden select-none">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-[#ECE5DC]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-tight text-[#221611]">aight .</span>
            <span className="text-xs font-semibold tracking-widest text-[#7A695C] bg-[#ECE5DC] px-2 py-0.5 rounded-full">
              CAFE
            </span>
          </div>
          <span className="text-xs font-semibold text-[#8C7A6D] bg-[#F2EDE4] px-3 py-1 rounded-full border border-[#E5DDD2]">
            Static design · not a live app
          </span>
        </div>

        {/* Title */}
        <div className="mt-8">
          <h1 className="text-3xl font-black text-[#221611] tracking-tight">
            A simple front. A dependable foundation.
          </h1>
          <p className="text-xs text-[#7A695C] mt-2 leading-relaxed max-w-3xl">
            Customer pickup, staff operations and the public queue are illustrated here. No app, backend, authentication, payments or notifications have been implemented.
          </p>
        </div>

        {/* Contract Card */}
        <div className="mt-6 p-6 bg-white rounded-3xl border border-[#ECE5DC] space-y-4 shadow-xs">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#221611]">
              One order, end to end · R-8F2 → A042
            </span>
            <p className="text-xs text-[#544337] mt-1">
              1 large iced oat latte, oat milk, 25% sweet, no add-ons · ₱180<br />
              1 brown butter cookie · ₱85 / Pickup free / Total ₱265
            </p>
          </div>

          <div className="grid grid-cols-5 gap-3 pt-3 border-t border-[#F2ECE3] text-xs">
            <div>
              <div className="font-bold text-[#221611]">Pending</div>
              <div className="text-[11px] text-[#8C7A6D]">9:40 AM</div>
            </div>
            <div>
              <div className="font-bold text-[#221611]">Confirmed</div>
              <div className="text-[11px] text-[#8C7A6D]">9:41 AM</div>
            </div>
            <div>
              <div className="font-bold text-[#221611]">Preparing</div>
              <div className="text-[11px] text-[#8C7A6D]">9:42 AM</div>
            </div>
            <div>
              <div className="font-bold text-[#221611]">Ready</div>
              <div className="text-[11px] text-[#8C7A6D]">9:48 AM</div>
            </div>
            <div>
              <div className="font-bold text-[#221611]">Completed</div>
              <div className="text-[11px] text-[#8C7A6D]">9:52 AM</div>
            </div>
          </div>

          <p className="text-[11px] text-[#8C7A6D] pt-2 border-t border-[#F2ECE3] leading-relaxed">
            No queue number before acceptance. A042 stays unpaid until staff verifies cash at collection. Staff and public displays show the 9:48 AM snapshot; completed shows 9:52 AM. A037 is a separate cancelled order.
          </p>
        </div>

        {/* 6 Dependencies list */}
        <div className="mt-6 space-y-3">
          {[
            {
              icon: '🗄️',
              title: 'Order persistence & totals',
              desc: 'Build the order API and database. Recalculate prices on the server, persist selected options and keep a status-change audit trail.',
            },
            {
              icon: '🛡️',
              title: 'Private orders & staff access',
              desc: "Use private, unguessable order links. Add staff authentication, role-based authorization and protected admin routes; don't expose names or payment data publicly.",
            },
            {
              icon: '🔢',
              title: 'Queue allocation & safe submission',
              desc: 'Allocate queue numbers atomically on acceptance. Keep them unique among active orders. Use idempotency keys for submission and acceptance; prevent repeated staff actions.',
            },
            {
              icon: '💳',
              title: 'Payment & verification',
              desc: 'This flow illustrates cash at pickup, verified by staff before completion. No provider is connected. Configure a payment provider and verified webhooks before adding digital payment.',
            },
            {
              icon: '🔄',
              title: 'Realtime status & recovery',
              desc: 'Sync customer, staff and display from one order state. Show stale timestamps offline; disable staff mutations while disconnected. Retry safely without creating another order.',
            },
            {
              icon: '🔔',
              title: 'Ready alerts & audio permissions',
              desc: 'Route ready events to the correct private order. Visual status comes first. Sound needs supported browser audio permissions; push needs explicit opt-in and service configuration.',
            },
          ].map(d => (
            <div
              key={d.title}
              className="p-4 bg-white rounded-2xl border border-[#ECE5DC] flex items-start gap-4 shadow-xs"
            >
              <span className="text-xl shrink-0 mt-0.5">{d.icon}</span>
              <div>
                <h3 className="text-xs font-bold text-[#221611]">{d.title}</h3>
                <p className="text-[11px] text-[#69584B] mt-0.5 leading-relaxed">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scope note at bottom */}
      <div className="pt-6 border-t border-[#ECE5DC] text-[11px] text-[#8C7A6D] leading-relaxed">
        Scope: pickup only. No tables, delivery, waiters or analytics. No existing application or integrations were available to preserve; production architecture must be established before development.
      </div>
    </div>
  );
};
