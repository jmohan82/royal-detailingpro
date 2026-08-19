"use client";

import { useEffect, useState } from "react";

import { subscribeInvoices } from "@/services/invoice-service";
import type { Invoice } from "@/types/billing";

export function useInvoices(businessId: string | undefined) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeInvoices(
      businessId,
      (nextInvoices) => {
        setInvoices(nextInvoices);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [businessId]);

  return { invoices, loading, error };
}
