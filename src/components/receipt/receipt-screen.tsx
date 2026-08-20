"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ReceiptDocument } from "@/components/receipt/receipt-document";
import { Button } from "@/components/ui/button";
import { shareOrDownloadImage } from "@/lib/share-image";
import { buildThankYouMessage, buildWhatsAppLink } from "@/lib/whatsapp";
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
  const [sending, setSending] = useState(false);

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

  async function handleSendBill() {
    if (!invoice) return;
    const message = buildThankYouMessage({
      customerName: invoice.customerName,
      businessName: profile?.name || "Royal DetailingPro",
      itemNames: invoice.items.map((item) => item.name),
    });
    const whatsappLink = buildWhatsAppLink(invoice.customerMobile, message);
    const element = document.getElementById("receipt-print-area");

    if (!element) {
      window.open(whatsappLink, "_blank", "noopener,noreferrer");
      return;
    }

    setSending(true);
    try {
      const result = await shareOrDownloadImage(
        element,
        `receipt-${invoice.invoiceNumber}.png`,
        message,
      );
      if (result === "downloaded") {
        toast.info("Receipt image downloaded — attach it in the WhatsApp chat that's about to open.");
        window.open(whatsappLink, "_blank", "noopener,noreferrer");
      }
      // "shared": the native share sheet handled it — the user picks WhatsApp and a contact there.
      // "cancelled": the user backed out of the share sheet, so nothing more to do.
    } catch {
      toast.error("Couldn't prepare the receipt image — sending the text message instead.");
      window.open(whatsappLink, "_blank", "noopener,noreferrer");
    } finally {
      setSending(false);
    }
  }

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
      <div className="mb-4 flex w-full max-w-xs flex-col gap-2 px-4 print:hidden">
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/")}>
            Back
          </Button>
          <Button type="button" onClick={() => window.print()}>
            Print / Save PDF
          </Button>
        </div>
        <Button type="button" variant="outline" className="w-full" disabled={sending} onClick={handleSendBill}>
          <MessageCircle className="size-4" />
          {sending ? "Preparing…" : "Send Bill on WhatsApp"}
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border bg-white shadow-sm print:border-none print:shadow-none">
        <ReceiptDocument invoice={invoice} profile={profile} />
      </div>
    </div>
  );
}
