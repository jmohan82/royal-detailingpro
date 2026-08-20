"use client";

import { useEffect, useState } from "react";

import { subscribeCustomers, subscribeVehicles } from "@/services/customer-service";
import type { Customer } from "@/types/customer";
import type { Vehicle } from "@/types/vehicle";

/**
 * Live customer + vehicle directory for the current business, used to power partial-match search
 * in the billing form (see customer-search-panel.tsx). Both collections are small enough for a
 * single shop that keeping the full list in memory and filtering client-side is the simplest way
 * to support "contains" matching, which Firestore can't do natively.
 */
export function useCustomerDirectory(businessId: string | undefined) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    setError(null);

    let customersReady = false;
    let vehiclesReady = false;
    const markReady = () => {
      if (customersReady && vehiclesReady) setLoading(false);
    };

    const unsubscribeCustomers = subscribeCustomers(
      businessId,
      (nextCustomers) => {
        setCustomers(nextCustomers);
        customersReady = true;
        markReady();
      },
      (nextError) => {
        setError(nextError);
        customersReady = true;
        markReady();
      },
    );

    const unsubscribeVehicles = subscribeVehicles(
      businessId,
      (nextVehicles) => {
        setVehicles(nextVehicles);
        vehiclesReady = true;
        markReady();
      },
      (nextError) => {
        setError(nextError);
        vehiclesReady = true;
        markReady();
      },
    );

    return () => {
      unsubscribeCustomers();
      unsubscribeVehicles();
    };
  }, [businessId]);

  return { customers, vehicles, loading, error };
}
