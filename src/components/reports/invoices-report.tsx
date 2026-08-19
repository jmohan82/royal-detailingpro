"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";

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
import type { Invoice } from "@/types/billing";

export function InvoicesReport({ invoices, loading }: { invoices: Invoice[]; loading: boolean }) {
  const router = useRouter();
  const total = invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);

  function handleExport() {
    downloadCsv(
      `invoices-${todayIsoDate()}.csv`,
      ["Date", "Invoice #", "Customer", "Mobile", "Vehicle", "Payment Mode", "Amount"],
      invoices.map((invoice) => [
        invoice.billingDate,
        invoice.invoiceNumber,
        invoice.customerName,
        invoice.customerMobile,
        invoice.vehiclePlate,
        invoice.paymentMode,
        invoice.grandTotal.toFixed(2),
      ]),
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Invoices</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={invoices.length === 0}
        >
          <Download className="size-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Sales</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && invoices.length === 0 && (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No invoices in this range.
          </p>
        )}
        {!loading && invoices.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/receipt?id=${invoice.id}`)}
                  >
                    <TableCell className="text-muted-foreground">
                      {formatIsoDateShort(invoice.billingDate)}
                    </TableCell>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell className="max-w-32 truncate">{invoice.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">{invoice.paymentMode}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.grandTotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-center text-xs text-muted-foreground">Tap a row to view or print its receipt.</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
