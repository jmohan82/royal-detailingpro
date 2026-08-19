"use client";

import { useEffect, useState } from "react";

import { subscribeUsers } from "@/services/user-service";
import type { AppUser } from "@/types/user";

export function useUsers(businessId: string | undefined) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeUsers(
      businessId,
      (nextUsers) => {
        setUsers(nextUsers);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [businessId]);

  return { users, loading, error };
}
