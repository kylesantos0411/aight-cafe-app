import React from 'react';
import { Screen14StallQueue } from '../components/figma-screens/Screen14StallQueue';

export const PublicQueueView: React.FC = () => {

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#221611] flex flex-col items-center justify-center p-4 md:p-8 font-sans select-none">
      {/* Discreet status bar for TV Display Operators */}
      <div className="w-full max-w-7xl flex justify-between items-center pb-3 text-xs text-[#C4B4A5]">
        <div className="flex items-center gap-2 font-medium">
          <span className="font-bold text-white">aight . CAFE</span>
          <span className="text-[#8C7A6D]">· Stall Pickup Queue</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Public TV Feed · Zero PII
          </span>
          <button
            onClick={handleToggleFullscreen}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
          >
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl my-auto transition-transform">
        <Screen14StallQueue />
      </div>
    </div>
  );
};
