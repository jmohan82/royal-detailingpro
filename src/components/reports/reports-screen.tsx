"use client";

import { useMemo, useState } from "react";

import { DateRangePicker } from "@/components/reports/date-range-picker";
import { ExpensesReport } from "@/components/reports/expenses-report";
import { InvoicesReport } from "@/components/reports/invoices-report";
import { StatCard } from "@/components/shared/stat-card";
import { useExpenses } from "@/hooks/use-expenses";
import { useInvoices } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/currency";
import { startOfMonthIsoDate, todayIsoDate } from "@/lib/date";
import { useAuthStore } from "@/store/auth-store";

export function ReportsScreen() {
  const user = useAuthStore((state) => state.user);
  const { invoices, loading: invoicesLoading, error: invoicesError } = useInvoices(user?.businessId);
  const { expenses, loading: expensesLoading, error: expensesError } = useExpenses(user?.businessId);

  const [startDate, setStartDate] = useState(startOfMonthIsoDate());
  const [endDate, setEndDate] = useState(todayIsoDate());

  function handlePreset(preset: "today" | "month" | "all") {
    const today = todayIsoDate();
    if (preset === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "month") {
      setStartDate(startOfMonthIsoDate());
      setEndDate(today);
    } else {
      setStartDate("2000-01-01");
      setEndDate(today);
    }
  }

  const filteredInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.billingDate >= startDate && invoice.billingDate <= endDate),
    [invoices, startDate, endDate],
  );
  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => expense.date >= startDate && expense.date <= endDate),
    [expenses, startDate, endDate],
  );

  const totalSales = filteredInvoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const net = totalSales - totalExpenses;

  const loading = invoicesLoading || expensesLoading;

  return (
    <div className="flex flex-col gap-4">
      {(invoicesError || expensesError) && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load report data. Check your connection and reload.
        </p>
      )}

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onPreset={handlePreset}
      />

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Sales" value={loading ? "…" : formatCurrency(totalSales)} />
        <StatCard label="Expenses" value={loading ? "…" : formatCurrency(totalExpenses)} />
        <StatCard
          label="Net"
          value={loading ? "…" : formatCurrency(net)}
          tone={net >= 0 ? "positive" : "negative"}
        />
      </div>

      <InvoicesReport invoices={filteredInvoices} loading={loading} />
      <ExpensesReport expenses={filteredExpenses} loading={loading} />
    </div>
  );
}
