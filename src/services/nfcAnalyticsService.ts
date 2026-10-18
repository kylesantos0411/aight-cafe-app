import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface NfcTapRecord {
  tagId: 'order' | 'reorder' | 'track' | 'rewards';
  source: 'nfc' | 'qr' | 'direct';
  path: string;
  timestamp: string;
}

const LOCAL_TAPS_KEY = 'aight_nfc_taps_cache';

class NfcAnalyticsService {
  /**
   * Log an NFC or QR tap event safely.
   * Never throws and never blocks customer ordering.
   */
  public async logTap(
    tagId: 'order' | 'reorder' | 'track' | 'rewards',
    source: 'nfc' | 'qr' | 'direct' = 'nfc',
    path: string = window.location.pathname
  ): Promise<void> {
    const record: NfcTapRecord = {
      tagId,
      source,
      path,
      timestamp: new Date().toISOString(),
    };

    // 1. Local caching for offline / dev inspection
    try {
      const stored = localStorage.getItem(LOCAL_TAPS_KEY);
      const list: NfcTapRecord[] = stored ? JSON.parse(stored) : [];
      list.unshift(record);
      if (list.length > 50) list.pop(); // Keep last 50 taps
      localStorage.setItem(LOCAL_TAPS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('nfc_taps').insert({
          tag_id: tagId,
          source,
          path,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        });
      } catch (err) {
        console.debug('NFC tap analytics non-critical notice:', err);
      }
    }
  }

  /**
   * Retrieve tap analytics (for stall staff/admin metrics)
   */
  public async getRecentTaps(): Promise<NfcTapRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('nfc_taps')
          .select('tag_id, source, path, created_at')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          return data.map((d: any) => ({
            tagId: d.tag_id,
            source: d.source,
            path: d.path,
            timestamp: d.created_at,
          }));
        }
      } catch {
        // fallback
      }
    }

    try {
      const stored = localStorage.getItem(LOCAL_TAPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export const nfcAnalyticsService = new NfcAnalyticsService();
