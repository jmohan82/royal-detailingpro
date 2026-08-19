"use client";

import { useEffect, useState } from "react";

import { subscribeExpenses } from "@/services/expense-service";
import type { Expense } from "@/types/expense";

export function useExpenses(businessId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeExpenses(
      businessId,
      (nextExpenses) => {
        setExpenses(nextExpenses);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [businessId]);

  return { expenses, loading, error };
}
