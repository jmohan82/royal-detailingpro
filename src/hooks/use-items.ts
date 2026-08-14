"use client";

import { useEffect, useState } from "react";

import { subscribeActiveItems } from "@/services/item-service";
import type { Item } from "@/types/item";

export function useItems(businessId: string | undefined) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeActiveItems(
      businessId,
      (nextItems) => {
        setItems(nextItems);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [businessId]);

  return { items, loading, error };
}
