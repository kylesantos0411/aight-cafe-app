import React, { useState } from 'react';
import { NFC_TAGS, getNfcTagUrl, getQrCodeImageUrl, getAuthoritativeBaseUrl, type NfcTagConfig } from '../config/nfcConfig';
import { AdminLayout } from '../components/admin/AdminLayout';

export const AdminNfcView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const baseUrl = getAuthoritativeBaseUrl();

  const handleCopy = (id: 'order' | 'reorder' | 'track' | 'rewards') => {
    const url = getNfcTagUrl(id, 'nfc');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const tagList = Object.values(NFC_TAGS) as NfcTagConfig[];

  return (
    <AdminLayout title="NFC & QR Tag Hub" subtitle="Physical stall touchpoints setup">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ECE5DC]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#221611]">NFC & QR Tag Hub</h1>
              <span className="text-[10px] font-bold bg-[#ECE5DC] text-[#7A695C] px-2.5 py-0.5 rounded-full uppercase">
                Hardware Setup
              </span>
            </div>
            <p className="text-xs text-[#7A695C] mt-1">
              Program NTAG213 stickers and print QR standees for your physical popup stall at Silangan, San Mateo, Rizal.
            </p>
          </div>

          <div className="text-xs bg-white px-3.5 py-2 rounded-xl border border-[#DFD6CC] text-[#7A695C]">
            Target Domain: <strong className="text-[#221611] font-mono">{baseUrl}</strong>
          </div>
        </div>

        {/* NTAG213 Hardware Specs Guide */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏷️</span>
            <div>
              <span className="font-bold">Hardware Compatibility: NTAG213 Verified</span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                All 4 destinations require ~55–65 bytes, fitting well inside NTAG213's 144-byte memory limit.
              </p>
            </div>
          </div>
          <a
            href="https://apps.apple.com/us/app/nfc-tools/id1252962749"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-900 transition-colors whitespace-nowrap text-center"
          >
            NFC Tools Guide →
          </a>
        </div>

        {/* 4 Tags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tagList.map(tag => {
            const nfcUrl = getNfcTagUrl(tag.id, 'nfc');
            const qrUrl = getNfcTagUrl(tag.id, 'qr');
            const qrImage = getQrCodeImageUrl(qrUrl, 260);
            const byteLength = new TextEncoder().encode(nfcUrl).length;

            return (
              <div
                key={tag.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE5DC] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#DFD6CC] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#8C7A6D] bg-[#F2EDE4] px-2 py-0.5 rounded-md">
                        Tag #{tag.id.toUpperCase()}
                      </span>
                      <h2 className="text-base font-black text-[#221611] mt-1.5">{tag.name}</h2>
                      <p className="text-xs text-[#7A695C]">{tag.tagline}</p>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {byteLength}B / 144B
                    </span>
                  </div>

                  {/* Stall Position */}
                  <div className="mt-3 text-[11px] text-[#7A695C] flex items-center gap-1.5 font-medium">
                    <span>📍</span>
                    <span>Stall Placement: <strong>{tag.stallPosition}</strong></span>
                  </div>

                  {/* QR Preview & URL Box */}
                  <div className="mt-4 p-3 bg-[#FAF8F5] rounded-2xl border border-[#ECE5DC] flex items-center gap-4">
                    <img
                      src={qrImage}
                      alt={`${tag.name} QR Code`}
                      className="w-20 h-20 rounded-xl bg-white p-1 border border-[#DFD6CC] shadow-2xs"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-[#8C7A6D]">HTTPS Destination</span>
                      <div className="font-mono text-[11px] text-[#221611] truncate font-semibold" title={nfcUrl}>
                        {nfcUrl}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(tag.id)}
                          className="px-2.5 py-1 bg-[#221611] hover:bg-[#3D2D23] text-white rounded-md font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          {copiedId === tag.id ? '✓ Copied URL' : 'Copy NFC URL'}
                        </button>
                        <a
                          href={qrImage}
                          download={`AightCafe-QR-${tag.id}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-white border border-[#DFD6CC] text-[#221611] hover:bg-[#F2EDE4] rounded-md font-bold text-[10px] transition-colors"
                        >
                          Print QR
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F2ECE3] text-[11px] text-[#8C7A6D]">
                  {tag.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* How to Encode Physical Tags Guide */}
        <div className="p-6 bg-white rounded-3xl border border-[#ECE5DC] shadow-xs space-y-3 text-xs">
          <h2 className="font-bold text-sm text-[#221611] flex items-center gap-2">
            <span>🛠️</span>
            <span>How to program physical NTAG213 stickers (2 minutes)</span>
          </h2>
          <ol className="list-decimal list-inside space-y-1.5 text-[#69584B] leading-relaxed">
            <li>Download the free <strong>NFC Tools</strong> app on your iPhone or Android phone.</li>
            <li>Tap <strong>Write</strong> → <strong>Add a record</strong> → <strong>URL / URI</strong>.</li>
            <li>Paste the exact NFC URL copied above (e.g. <code>{getNfcTagUrl('order', 'nfc')}</code>).</li>
            <li>Tap <strong>Write / 144 Bytes</strong> and hold the back of your phone to your blank NTAG213 sticker.</li>
            <li>Stall sticker is immediately programmed and opens in Safari / Chrome with zero installation required!</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
};
