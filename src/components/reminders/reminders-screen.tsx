"use client";

import { MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllItems } from "@/hooks/use-all-items";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useInvoices } from "@/hooks/use-invoices";
import { useReminderSends } from "@/hooks/use-reminder-sends";
import { formatIsoDateShort, todayIsoDate } from "@/lib/date";
import { computeDueReminders, type DueReminder } from "@/lib/reminders";
import { buildReminderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { logReminderSent } from "@/services/reminder-service";
import { useAuthStore } from "@/store/auth-store";

function reminderKey(reminder: DueReminder): string {
  return `${reminder.customerMobile}::${reminder.itemId}`;
}

export function RemindersScreen() {
  const user = useAuthStore((state) => state.user);
  const { invoices, loading: invoicesLoading, error: invoicesError } = useInvoices(user?.businessId);
  const { items, loading: itemsLoading } = useAllItems(user?.businessId);
  const { sends, loading: sendsLoading } = useReminderSends(user?.businessId);
  const { profile } = useBusinessProfile(user?.businessId);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const loading = invoicesLoading || itemsLoading || sendsLoading;

  const dueReminders = useMemo(
    () => computeDueReminders(invoices, items, sends, todayIsoDate()),
    [invoices, items, sends],
  );

  async function handleSend(reminder: DueReminder) {
    if (!user) return;
    const key = reminderKey(reminder);
    setPendingKey(key);
    try {
      const message = buildReminderMessage({
        customerName: reminder.customerName,
        businessName: profile?.name || "Royal DetailingPro",
        itemName: reminder.itemName,
        businessPhone: profile?.phone,
      });
      window.open(buildWhatsAppLink(reminder.customerMobile, message), "_blank", "noopener,noreferrer");
      await logReminderSent(user.businessId, user.uid, {
        customerMobile: reminder.customerMobile,
        customerName: reminder.customerName,
        itemId: reminder.itemId,
        itemName: reminder.itemName,
      });
    } catch {
      toast.error("Couldn't record that this was sent — it may still show as due.");
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {invoicesError && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load reminders. Check your connection and reload.
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reminders Due</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Set a &quot;Remind Customer After&quot; interval on a product or service in Products &amp;
            Services and customers will show up here once they&apos;re due for a follow-up.
          </p>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && dueReminders.length === 0 && (
            <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
              No reminders due right now.
            </p>
          )}
          {!loading && dueReminders.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Due For</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Send</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dueReminders.map((reminder) => {
                  const key = reminderKey(reminder);
                  return (
                    <TableRow key={key}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{reminder.customerName}</span>
                          <span className="text-xs text-muted-foreground">{reminder.customerMobile}</span>
                        </div>
                      </TableCell>
                      <TableCell>{reminder.itemName}</TableCell>
                      <TableCell className="text-destructive">
                        {reminder.daysOverdue > 0
                          ? `${reminder.daysOverdue}d overdue`
                          : formatIsoDateShort(reminder.dueDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          disabled={pendingKey === key}
                          onClick={() => handleSend(reminder)}
                        >
                          <MessageCircle className="size-4" />
                          Send
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
