/**
 * AIGHT CAFE — Centralized NFC & QR Configuration
 *
 * Configures the 4 physical NFC stall touchpoints:
 * 1. ORDER HERE (Ordering counter) -> /menu?source=nfc&tag=order
 * 2. ORDER AGAIN (Counter & Takeaway cups/bags) -> /reorder?source=nfc&tag=reorder
 * 3. TRACK MY ORDER (Pickup counter) -> /track?source=nfc&tag=track
 * 4. AIGHT REWARDS (Counter stand) -> /rewards?source=nfc&tag=rewards
 *
 * Compatible with NTAG213 chips (144 bytes user capacity).
 */

export interface NfcTagConfig {
  id: 'order' | 'reorder' | 'track' | 'rewards';
  name: string;
  tagline: string;
  stallPosition: string;
  routePath: string;
  queryParam: string;
  recommendedTagType: string;
  ntagCapacityBytes: number;
  description: string;
}

export const NFC_TAGS: Record<'order' | 'reorder' | 'track' | 'rewards', NfcTagConfig> = {
  order: {
    id: 'order',
    name: 'ORDER HERE',
    tagline: 'Tap to browse drinks & food',
    stallPosition: 'Counter Menu & Table Stands',
    routePath: '/menu',
    queryParam: 'source=nfc&tag=order',
    recommendedTagType: 'NTAG213 (144 bytes) or NTAG215',
    ntagCapacityBytes: 144,
    description: 'Directs customers directly to the live pickup menu to customize and place orders.',
  },
  reorder: {
    id: 'reorder',
    name: 'ORDER AGAIN',
    tagline: 'Reorder your usual in 1 tap',
    stallPosition: 'Takeaway Cups, Bakery Bags & Counter Sign',
    routePath: '/reorder',
    queryParam: 'source=nfc&tag=reorder',
    recommendedTagType: 'NTAG213 (144 bytes) or NTAG215',
    ntagCapacityBytes: 144,
    description: 'Allows repeat customers to re-add their recent favorites with real-time stock revalidation.',
  },
  track: {
    id: 'track',
    name: 'TRACK MY ORDER',
    tagline: 'Live brewing & pickup status',
    stallPosition: 'Pickup Station Counter & Waiting Benches',
    routePath: '/track',
    queryParam: 'source=nfc&tag=track',
    recommendedTagType: 'NTAG213 (144 bytes) or NTAG215',
    ntagCapacityBytes: 144,
    description: 'Instantly opens the customer’s active order ticket and queue number for pickup.',
  },
  rewards: {
    id: 'rewards',
    name: 'AIGHT REWARDS',
    tagline: 'Collect stamps & earn free coffee',
    stallPosition: 'Checkout Counter Stand & Loyalty Card Sign',
    routePath: '/rewards',
    queryParam: 'source=nfc&tag=rewards',
    recommendedTagType: 'NTAG213 (144 bytes) or NTAG215',
    ntagCapacityBytes: 144,
    description: 'Digital stamp card: 8 stamps = 1 free coffee. View stamps balance and active vouchers.',
  },
};

/**
 * Returns the authoritative base domain of the app.
 * Prioritizes VITE_APP_URL, falls back to window.location.origin, and defaults to production domain.
 */
export function getAuthoritativeBaseUrl(): string {
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    return envUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return 'https://aight-cafe-app.vercel.app';
}

/**
 * Get the full canonical URL for an NFC tag.
 */
export function getNfcTagUrl(tagId: 'order' | 'reorder' | 'track' | 'rewards', source: 'nfc' | 'qr' = 'nfc'): string {
  const base = getAuthoritativeBaseUrl();
  const tag = NFC_TAGS[tagId];
  return `${base}${tag.routePath}?source=${source}&tag=${tag.id}`;
}

/**
 * Generates an SVG QR code data URI or SVG string for the given destination.
 * Uses a deterministic standard QR generator endpoint or SVG template.
 */
export function getQrCodeImageUrl(url: string, size = 280): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=FAF8F5&color=221611&margin=1`;
}
