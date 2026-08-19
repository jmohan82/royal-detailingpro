"use client";

import Link from "next/link";
import { useMemo } from "react";

import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenses } from "@/hooks/use-expenses";
import { useInvoices } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/currency";
import { startOfMonthIsoDate, todayIsoDate } from "@/lib/date";
import { useAuthStore } from "@/store/auth-store";

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const { invoices, loading: invoicesLoading, error: invoicesError } = useInvoices(user?.businessId);
  const { expenses, loading: expensesLoading, error: expensesError } = useExpenses(user?.businessId);

  const metrics = useMemo(() => {
    const today = todayIsoDate();
    const monthStart = startOfMonthIsoDate();

    const todaysInvoices = invoices.filter((invoice) => invoice.billingDate === today);
    const monthInvoices = invoices.filter(
      (invoice) => invoice.billingDate >= monthStart && invoice.billingDate <= today,
    );
    const todaysExpenses = expenses.filter((expense) => expense.date === today);
    const monthExpenses = expenses.filter(
      (expense) => expense.date >= monthStart && expense.date <= today,
    );

    const todaySales = sum(todaysInvoices.map((invoice) => invoice.grandTotal));
    const monthSales = sum(monthInvoices.map((invoice) => invoice.grandTotal));
    const todayExpenseTotal = sum(todaysExpenses.map((expense) => expense.amount));
    const monthExpenseTotal = sum(monthExpenses.map((expense) => expense.amount));

    return {
      today: {
        sales: todaySales,
        expenses: todayExpenseTotal,
        net: todaySales - todayExpenseTotal,
        invoiceCount: todaysInvoices.length,
      },
      month: {
        sales: monthSales,
        expenses: monthExpenseTotal,
        net: monthSales - monthExpenseTotal,
        invoiceCount: monthInvoices.length,
      },
      recentInvoices: invoices.slice(0, 5),
    };
  }, [invoices, expenses]);

  const loading = invoicesLoading || expensesLoading;

  return (
    <div className="flex flex-col gap-4">
      {(invoicesError || expensesError) && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load dashboard data. Check your connection and reload.
        </p>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Today</h2>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Sales" value={loading ? "…" : formatCurrency(metrics.today.sales)} />
          <StatCard label="Expenses" value={loading ? "…" : formatCurrency(metrics.today.expenses)} />
          <StatCard
            label="Net"
            value={loading ? "…" : formatCurrency(metrics.today.net)}
            tone={metrics.today.net >= 0 ? "positive" : "negative"}
          />
          <StatCard label="Invoices" value={loading ? "…" : String(metrics.today.invoiceCount)} />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">This Month</h2>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Sales" value={loading ? "…" : formatCurrency(metrics.month.sales)} />
          <StatCard label="Expenses" value={loading ? "…" : formatCurrency(metrics.month.expenses)} />
          <StatCard
            label="Net"
            value={loading ? "…" : formatCurrency(metrics.month.net)}
            tone={metrics.month.net >= 0 ? "positive" : "negative"}
          />
          <StatCard label="Invoices" value={loading ? "…" : String(metrics.month.invoiceCount)} />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && metrics.recentInvoices.length === 0 && (
            <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
              No invoices yet.
            </p>
          )}
          {!loading && metrics.recentInvoices.length > 0 && (
            <ul className="flex flex-col divide-y">
              {metrics.recentInvoices.map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/receipt?id=${invoice.id}`}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{invoice.customerName}</span>
                      <span className="text-xs text-muted-foreground">
                        {invoice.invoiceNumber} · {invoice.vehiclePlate}
                      </span>
                    </div>
                    <span className="font-semibold">{formatCurrency(invoice.grandTotal)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
