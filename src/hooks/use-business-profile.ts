"use client";

import { useEffect, useState } from "react";

import { subscribeBusinessProfile } from "@/services/business-service";
import type { BusinessProfile } from "@/types/business";

export function useBusinessProfile(businessId: string | undefined) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeBusinessProfile(
      businessId,
      (nextProfile) => {
        setProfile(nextProfile);
        setLoading(false);
      },
      (nextError) => {
        setError(nextError);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [businessId]);

  return { profile, loading, error };
}
