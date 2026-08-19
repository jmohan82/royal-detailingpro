"use client";

import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { downloadCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/currency";
import { formatIsoDateShort, todayIsoDate } from "@/lib/date";
import type { Expense } from "@/types/expense";

export function ExpensesReport({ expenses, loading }: { expenses: Expense[]; loading: boolean }) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  function handleExport() {
    downloadCsv(
      `expenses-${todayIsoDate()}.csv`,
      ["Date", "Category", "Note", "Amount"],
      expenses.map((expense) => [expense.date, expense.category, expense.note, expense.amount.toFixed(2)]),
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Expenses</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={expenses.length === 0}
        >
          <Download className="size-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Expenses</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && expenses.length === 0 && (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No expenses in this range.
          </p>
        )}
        {!loading && expenses.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-muted-foreground">
                    {formatIsoDateShort(expense.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-32 truncate text-muted-foreground">
                    {expense.note || "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
