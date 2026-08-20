"use client";

import { useEffect, useState } from "react";

import { subscribeReminderSends } from "@/services/reminder-service";
import type { ReminderSend } from "@/types/reminder";

export function useReminderSends(businessId: string | undefined) {
  const [sends, setSends] = useState<ReminderSend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeReminderSends(
      businessId,
      (nextSends) => {
        setSends(nextSends);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [businessId]);

  return { sends, loading, error };
}
