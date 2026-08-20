import type { Invoice } from "@/types/billing";
import type { Item } from "@/types/item";
import type { ReminderSend } from "@/types/reminder";

export interface DueReminder {
  customerMobile: string;
  customerName: string;
  itemId: string;
  itemName: string;
  intervalDays: number;
  /** The purchase or last-reminder date this due date counts from. */
  lastEventDate: string;
  dueDate: string;
  daysOverdue: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function isoToTime(iso: string): number {
  return new Date(`${iso}T00:00:00`).getTime();
}

function timeToIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Works out which customers are due a reminder for a repeat service/product. For every item with
 * a reminder interval set, finds each customer's most recent purchase (or, if later, the most
 * recent reminder already sent) and flags anyone whose next-due date has arrived.
 */
export function computeDueReminders(
  invoices: Invoice[],
  items: Item[],
  reminderSends: ReminderSend[],
  todayIso: string,
): DueReminder[] {
  const reminderItems = new Map(
    items.filter((item) => item.reminderIntervalDays > 0).map((item) => [item.id, item]),
  );
  if (reminderItems.size === 0) return [];

  const lastPurchase = new Map<string, { date: string; customerName: string }>();
  for (const invoice of invoices) {
    if (!invoice.customerMobile) continue;
    for (const line of invoice.items) {
      if (!reminderItems.has(line.itemId)) continue;
      const key = `${invoice.customerMobile}::${line.itemId}`;
      const existing = lastPurchase.get(key);
      if (!existing || invoice.billingDate > existing.date) {
        lastPurchase.set(key, { date: invoice.billingDate, customerName: invoice.customerName });
      }
    }
  }

  const lastSent = new Map<string, string>();
  for (const send of reminderSends) {
    const key = `${send.customerMobile}::${send.itemId}`;
    const sentIso = timeToIso(send.sentAt);
    const existing = lastSent.get(key);
    if (!existing || sentIso > existing) {
      lastSent.set(key, sentIso);
    }
  }

  const todayTime = isoToTime(todayIso);
  const due: DueReminder[] = [];

  for (const [key, purchase] of lastPurchase) {
    const [customerMobile, itemId] = key.split("::");
    const item = reminderItems.get(itemId);
    if (!item) continue;

    const sentIso = lastSent.get(key);
    const lastEventDate = sentIso && sentIso > purchase.date ? sentIso : purchase.date;
    const dueTime = isoToTime(lastEventDate) + item.reminderIntervalDays * DAY_MS;
    if (dueTime > todayTime) continue;

    due.push({
      customerMobile,
      customerName: purchase.customerName,
      itemId,
      itemName: item.name,
      intervalDays: item.reminderIntervalDays,
      lastEventDate,
      dueDate: timeToIso(dueTime),
      daysOverdue: Math.round((todayTime - dueTime) / DAY_MS),
    });
  }

  return due.sort((a, b) => b.daysOverdue - a.daysOverdue);
}
