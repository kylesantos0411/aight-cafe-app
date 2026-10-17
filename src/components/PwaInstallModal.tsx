import React, { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Capture Chrome/Edge install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] text-[#221611] rounded-[36px] max-w-md w-full p-6 shadow-2xl border border-[#EAE3DA] font-sans space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE5DC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#221611] text-[#FAF8F5] flex items-center justify-center font-black text-sm">
              a.
            </div>
            <div>
              <h3 className="font-extrabold text-base">Install Aight Cafe</h3>
              <p className="text-[11px] text-[#7A695C]">Progressive Web App (PWA)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#7A695C] hover:text-[#221611] flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Benefits list */}
        <div className="space-y-2 text-xs text-[#5C4A3E]">
          <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-[#ECE5DC]">
            <span>⚡</span>
            <span>Installs directly from your browser — no App Store required</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-[#ECE5DC]">
            <span>📦</span>
            <span>Works offline: saved local order tracking & menu caching</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-[#ECE5DC]">
            <span>🔔</span>
            <span>Live order status tracking directly on your home screen</span>
          </div>
        </div>

        {/* OS Specific Instructions */}
        {isIOS ? (
          <div className="p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] space-y-2 text-xs">
            <div className="font-bold text-[#221611]">Installing on iPhone / iPad:</div>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-[#69584B]">
              <li>Tap the <strong>Share</strong> button (box with arrow) at the bottom of Safari.</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
              <li>Tap <strong>"Add"</strong> in the top right corner.</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3">
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 bg-[#221611] hover:bg-[#36251E] text-white rounded-2xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>📥</span>
                <span>Install App on this Device</span>
              </button>
            ) : (
              <div className="p-4 bg-[#F2EDE4] rounded-2xl border border-[#E5DDD2] space-y-1.5 text-xs">
                <div className="font-bold text-[#221611]">Installing on Android / Chrome:</div>
                <p className="text-[11px] text-[#69584B]">
                  Tap the browser menu (<strong>⋮</strong> in Chrome) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-[#8C7A6D]">
            Note: Background audio and push alerts are subject to iOS Safari web app policies.
          </p>
        </div>
      </div>
    </div>
  );
};
