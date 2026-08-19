"use client";

import { Download } from "lucide-react";
import { useMemo } from "react";

import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useExpenses } from "@/hooks/use-expenses";
import { useInvoices } from "@/hooks/use-invoices";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/currency";
import { formatIsoDateShort, todayIsoDate } from "@/lib/date";
import { useAuthStore } from "@/store/auth-store";

interface LedgerEntry {
  date: string;
  createdAt: number;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export function LedgerScreen() {
  const user = useAuthStore((state) => state.user);
  const { profile, loading: profileLoading } = useBusinessProfile(user?.businessId);
  const { invoices, loading: invoicesLoading, error: invoicesError } = useInvoices(user?.businessId);
  const { expenses, loading: expensesLoading, error: expensesError } = useExpenses(user?.businessId);

  const loading = profileLoading || invoicesLoading || expensesLoading;
  const openingBalance = profile?.openingBalance ?? 0;

  const entries = useMemo<LedgerEntry[]>(() => {
    const combined = [
      ...invoices.map((invoice) => ({
        date: invoice.billingDate,
        createdAt: invoice.createdAt,
        description: `Invoice ${invoice.invoiceNumber} — ${invoice.customerName}`,
        debit: 0,
        credit: invoice.grandTotal,
      })),
      ...expenses.map((expense) => ({
        date: expense.date,
        createdAt: expense.createdAt,
        description: expense.note ? `${expense.category} — ${expense.note}` : expense.category,
        debit: expense.amount,
        credit: 0,
      })),
    ].sort((a, b) => (a.date === b.date ? a.createdAt - b.createdAt : a.date.localeCompare(b.date)));

    let running = openingBalance;
    return combined.map((entry) => {
      running = running + entry.credit - entry.debit;
      return { ...entry, balance: running };
    });
  }, [invoices, expenses, openingBalance]);

  const currentBalance = entries.length > 0 ? entries[entries.length - 1].balance : openingBalance;

  function handleExport() {
    downloadCsv(
      `ledger-${todayIsoDate()}.csv`,
      ["Date", "Description", "Debit", "Credit", "Balance"],
      [
        [profile?.openingBalanceDate ?? "", "Opening Balance", "", "", openingBalance.toFixed(2)],
        ...entries.map((entry) => [
          entry.date,
          entry.description,
          entry.debit ? entry.debit.toFixed(2) : "",
          entry.credit ? entry.credit.toFixed(2) : "",
          entry.balance.toFixed(2),
        ]),
      ],
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {(invoicesError || expensesError) && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load ledger data. Check your connection and reload.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label={`Opening Balance (${profile?.openingBalanceDate ? formatIsoDateShort(profile.openingBalanceDate) : "—"})`}
          value={loading ? "…" : formatCurrency(openingBalance)}
        />
        <StatCard
          label="Current Balance"
          value={loading ? "…" : formatCurrency(currentBalance)}
          tone={currentBalance >= 0 ? "positive" : "negative"}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Ledger</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={entries.length === 0}
          >
            <Download className="size-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && entries.length === 0 && (
            <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
              No sales or expenses recorded yet — the ledger will start filling in as you go.
            </p>
          )}
          {!loading && entries.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-muted-foreground">
                      {formatIsoDateShort(entry.date)}
                    </TableCell>
                    <TableCell className="max-w-36 truncate">{entry.description}</TableCell>
                    <TableCell className="text-right text-destructive">
                      {entry.debit ? formatCurrency(entry.debit) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-success">
                      {entry.credit ? formatCurrency(entry.credit) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(entry.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
