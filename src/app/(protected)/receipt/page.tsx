"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ReceiptScreen } from "@/components/receipt/receipt-screen";

function ReceiptPageContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("id");

  if (!invoiceId) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 text-center">
        <p className="text-sm text-destructive">No invoice specified.</p>
      </div>
    );
  }

  return <ReceiptScreen invoiceId={invoiceId} />;
}

export default function ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ReceiptPageContent />
    </Suspense>
  );
}
