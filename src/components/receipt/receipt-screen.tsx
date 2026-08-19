"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ReceiptDocument } from "@/components/receipt/receipt-document";
import { Button } from "@/components/ui/button";
import { fetchBusinessProfile } from "@/services/business-service";
import { getInvoiceById } from "@/services/invoice-service";
import { useAuthStore } from "@/store/auth-store";
import type { BusinessProfile } from "@/types/business";
import type { Invoice } from "@/types/billing";

export function ReceiptScreen({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedInvoice, fetchedProfile] = await Promise.all([
          getInvoiceById(invoiceId),
          fetchBusinessProfile(user.businessId),
        ]);
        if (cancelled) return;
        if (!fetchedInvoice) {
          setError("Invoice not found.");
        } else {
          setInvoice(fetchedInvoice);
          setProfile(fetchedProfile);
        }
      } catch {
        if (!cancelled) setError("Couldn't load the receipt. Check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [invoiceId, user]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-destructive">{error ?? "Invoice not found."}</p>
        <Button onClick={() => router.push("/")}>Back to Billing</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center bg-muted/20 py-6">
      <div className="mb-4 flex w-full max-w-xs items-center justify-between gap-2 px-4 print:hidden">
        <Button type="button" variant="outline" onClick={() => router.push("/")}>
          Back
        </Button>
        <Button type="button" onClick={() => window.print()}>
          Print / Save PDF
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border bg-white shadow-sm print:border-none print:shadow-none">
        <ReceiptDocument invoice={invoice} profile={profile} />
      </div>
    </div>
  );
}
