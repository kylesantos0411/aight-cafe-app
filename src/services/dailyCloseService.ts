import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order } from '../types/cafe';

export interface DailyItemSold {
  name: string;
  quantity: number;
  revenue: number;
}

export interface DailyClosureRecord {
  id: string;
  closureDate: string; // YYYY-MM-DD
  closedAt: string;    // ISO string
  closedByName: string;
  stallLocation: string;
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrActiveOrders: number;
  itemsSold: DailyItemSold[];
  orders: Array<{
    code: string;
    customerName: string;
    amount: number;
    status: string;
    paymentStatus: string;
    time: string;
  }>;
  notes?: string;
}

const STORAGE_DAILY_CLOSURES_KEY = 'aight_cafe_daily_closures_v1';
const STORAGE_QUEUE_SEQ_KEY = 'aight_cafe_queue_seq';

class DailyCloseService {
  /**
   * Retrieve all saved daily closure records from local persistent storage.
   */
  public getDailyClosures(): DailyClosureRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_DAILY_CLOSURES_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      console.warn('Failed to parse daily closures from storage:', err);
    }
    return [];
  }

  /**
   * Save closures list to local persistent storage.
   */
  private saveDailyClosures(closures: DailyClosureRecord[]): void {
    try {
      localStorage.setItem(STORAGE_DAILY_CLOSURES_KEY, JSON.stringify(closures));
    } catch (err) {
      console.warn('Failed to save daily closures to storage:', err);
    }
  }

  /**
   * Compute the live daily summary metrics for the day.
   */
  public computeCurrentDaySummary(
    orders: Order[],
    stallLocation: string = 'Silangan, San Mateo, Rizal',
    staffName: string = 'Staff Operator'
  ): DailyClosureRecord {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Tally items sold
    const itemMap = new Map<string, { quantity: number; revenue: number }>();
    let totalRevenue = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let activeCount = 0;

    orders.forEach(ord => {
      if (ord.status === 'completed') {
        completedCount++;
        totalRevenue += ord.totalAmount;

        ord.items.forEach(it => {
          const existing = itemMap.get(it.name) || { quantity: 0, revenue: 0 };
          existing.quantity += it.quantity;
          existing.revenue += it.price * it.quantity;
          itemMap.set(it.name, existing);
        });
      } else if (ord.status === 'cancelled') {
        cancelledCount++;
      } else {
        activeCount++;
      }
    });

    const itemsSold: DailyItemSold[] = Array.from(itemMap.entries()).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue,
    })).sort((a, b) => b.quantity - a.quantity);

    const orderSnapshots = orders.map(o => ({
      code: o.code || o.requestReference,
      customerName: o.customerName,
      amount: o.totalAmount,
      status: o.status,
      paymentStatus: o.paymentStatus,
      time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
    }));

    return {
      id: `closure_${todayStr}_${Date.now()}`,
      closureDate: todayStr,
      closedAt: new Date().toISOString(),
      closedByName: staffName,
      stallLocation,
      totalRevenue,
      totalOrders: orders.length,
      completedOrders: completedCount,
      cancelledOrders: cancelledCount,
      pendingOrActiveOrders: activeCount,
      itemsSold,
      orders: orderSnapshots,
    };
  }

  /**
   * Finalize and commit daily close:
   * 1. Saves summary to closure history
   * 2. Resets the daily queue sequence back to 0 (so tomorrow's first order is A001)
   * 3. Syncs with Supabase if connected
   */
  public async executeDailyClose(
    orders: Order[],
    stallLocation: string = 'Silangan, San Mateo, Rizal',
    staffName: string = 'Staff Operator',
    notes?: string
  ): Promise<DailyClosureRecord> {
    const summary = this.computeCurrentDaySummary(orders, stallLocation, staffName);
    if (notes) summary.notes = notes;

    // 1. Save to local daily closures
    const existing = this.getDailyClosures();
    const updated = [summary, ...existing.filter(c => c.closureDate !== summary.closureDate)];
    this.saveDailyClosures(updated);

    // 2. Reset local queue counter to 0 so next sequence starts at A001
    try {
      localStorage.setItem(STORAGE_QUEUE_SEQ_KEY, '0');
    } catch {
      // ignore
    }

    // 3. Sync with Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        // Reset Supabase daily_queue_sequences for tomorrow
        await supabase
          .from('daily_queue_sequences')
          .upsert({
            service_date: todayStr,
            last_number: 0,
            prefix: 'A',
          });

        // Set store_settings is_open to false for closing
        await supabase
          .from('store_settings')
          .update({ is_open: false, updated_at: new Date().toISOString() })
          .neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('Supabase daily close sync note:', err);
      }
    }

    return summary;
  }

  /**
   * Export Daily Closure Record as a downloadable CSV spreadsheet.
   */
  public exportDailyCloseToCSV(closure: DailyClosureRecord): void {
    const lines: string[] = [];

    // Header metadata
    lines.push(`"AIGHT CAFE — DAILY SALES & TRANSACTION REPORT"`);
    lines.push(`"Stall Location","${closure.stallLocation}"`);
    lines.push(`"Closure Date","${closure.closureDate}"`);
    lines.push(`"Closed At","${new Date(closure.closedAt).toLocaleString()}"`);
    lines.push(`"Closed By","${closure.closedByName}"`);
    lines.push(``);

    // Metrics summary
    lines.push(`"FINANCIAL & OPERATIONAL SUMMARY"`);
    lines.push(`"Metric","Value"`);
    lines.push(`"Total Revenue (PHP)","₱${closure.totalRevenue.toFixed(2)}"`);
    lines.push(`"Total Orders Processed","${closure.totalOrders}"`);
    lines.push(`"Completed & Paid Orders","${closure.completedOrders}"`);
    lines.push(`"Voided / Cancelled Orders","${closure.cancelledOrders}"`);
    lines.push(`"Pending / Leftover Orders","${closure.pendingOrActiveOrders}"`);
    lines.push(``);

    // Items sold breakdown
    lines.push(`"ITEMIZED SALES BREAKDOWN"`);
    lines.push(`"Product Name","Quantity Sold","Total Revenue (PHP)"`);
    closure.itemsSold.forEach(it => {
      lines.push(`"${it.name.replace(/"/g, '""')}","${it.quantity}","₱${it.revenue.toFixed(2)}"`);
    });
    lines.push(``);

    // Order transactions detail
    lines.push(`"INDIVIDUAL ORDER TRANSACTIONS"`);
    lines.push(`"Order / Pickup #","Customer Name","Amount (PHP)","Status","Payment","Timestamp"`);
    closure.orders.forEach(o => {
      lines.push(
        `"${o.code}","${o.customerName.replace(/"/g, '""')}","₱${o.amount.toFixed(2)}","${o.status}","${o.paymentStatus}","${o.time}"`
      );
    });

    const csvContent = lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aight-cafe-daily-report-${closure.closureDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const dailyCloseService = new DailyCloseService();
