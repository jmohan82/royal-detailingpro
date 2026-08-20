"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCustomerDirectory } from "@/hooks/use-customer-directory";
import { normalizePlate } from "@/lib/normalize";
import type { Customer } from "@/types/customer";
import type { Vehicle } from "@/types/vehicle";
import type { BillingInput } from "@/validation/billing";

interface CustomerSearchPanelProps {
  setValue: UseFormSetValue<BillingInput>;
  businessId: string | undefined;
}

type SearchState =
  | { kind: "idle" }
  | { kind: "new" }
  | { kind: "multiple-customers"; matches: Customer[] }
  | { kind: "multiple-vehicles"; matches: Vehicle[] }
  | { kind: "found"; customer: Customer; vehicles: Vehicle[] };

const MAX_SUGGESTIONS = 8;

/**
 * Matches on digits/characters found ANYWHERE in the stored number/plate, not just a prefix —
 * the customer and vehicle lists are pulled once (live) for the business and filtered here in
 * memory, since Firestore can't do "contains" queries natively and this dataset is small enough
 * (a single shop's customers) for that to be instant.
 */
export function CustomerSearchPanel({ setValue, businessId }: CustomerSearchPanelProps) {
  const { customers, vehicles, loading, error } = useCustomerDirectory(businessId);
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const looksLikePlate = /[a-zA-Z]/.test(trimmed);

  const searchState: SearchState = useMemo(() => {
    if (!trimmed) return { kind: "idle" };

    if (looksLikePlate) {
      const needle = normalizePlate(trimmed);
      const matches = needle ? vehicles.filter((vehicle) => normalizePlate(vehicle.plate).includes(needle)) : [];
      if (matches.length === 0) return { kind: "new" };
      if (matches.length > 1) return { kind: "multiple-vehicles", matches };
      const vehicle = matches[0];
      const customer = customers.find((candidate) => candidate.id === vehicle.customerId);
      if (!customer) return { kind: "new" };
      return { kind: "found", customer, vehicles: [vehicle] };
    }

    const needle = trimmed.replace(/\D/g, "");
    const matches = needle
      ? customers.filter((customer) => customer.mobile.replace(/\D/g, "").includes(needle))
      : [];
    if (matches.length === 0) return { kind: "new" };
    if (matches.length > 1) return { kind: "multiple-customers", matches };
    const customer = matches[0];
    const customerVehicles = vehicles.filter((vehicle) => vehicle.customerId === customer.id);
    return { kind: "found", customer, vehicles: customerVehicles };
  }, [trimmed, looksLikePlate, customers, vehicles]);

  useEffect(() => {
    if (searchState.kind === "found") {
      setValue("customerName", searchState.customer.name);
      setValue("customerMobile", searchState.customer.mobile);
      if (searchState.vehicles.length === 1) {
        setValue("vehiclePlate", searchState.vehicles[0].plate);
      } else if (searchState.vehicles.length === 0) {
        setValue("vehiclePlate", "");
      }
    } else if (searchState.kind === "new") {
      setValue("customerName", "");
      setValue("customerMobile", looksLikePlate ? "" : trimmed.replace(/\D/g, ""));
      setValue("vehiclePlate", looksLikePlate ? normalizePlate(trimmed) : "");
    }
    // "idle" and "multiple-*" states are handled entirely by the picklist UI below — nothing to
    // prefill until the person disambiguates by tapping a suggestion.
  }, [searchState, setValue, looksLikePlate, trimmed]);

  function selectCustomer(customer: Customer) {
    setQuery(customer.mobile);
  }

  function selectVehicle(vehicle: Vehicle) {
    setQuery(vehicle.plate);
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Mobile number or vehicle plate"
          className="h-14 pl-9 text-lg"
        />
      </div>

      {loading && !error && (
        <p className="mt-1 text-xs text-muted-foreground">Loading customer list…</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-destructive">
          Couldn&apos;t load the customer list. Check your connection and reload.
        </p>
      )}
      {searchState.kind === "found" && (
        <p className="mt-1 text-xs text-success">Existing customer found.</p>
      )}
      {searchState.kind === "new" && (
        <p className="mt-1 text-xs text-muted-foreground">
          No match — enter details below to create a new customer.
        </p>
      )}
      {(searchState.kind === "multiple-customers" || searchState.kind === "multiple-vehicles") && (
        <p className="mt-1 text-xs text-muted-foreground">Multiple matches — tap the right one:</p>
      )}

      {searchState.kind === "multiple-customers" && (
        <div className="mt-2 flex flex-col gap-1">
          {searchState.matches.slice(0, MAX_SUGGESTIONS).map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => selectCustomer(customer)}
              className="rounded-md border px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <span className="font-medium">{customer.name}</span>{" "}
              <span className="text-muted-foreground">{customer.mobile}</span>
            </button>
          ))}
          {searchState.matches.length > MAX_SUGGESTIONS && (
            <p className="text-xs text-muted-foreground">
              +{searchState.matches.length - MAX_SUGGESTIONS} more — keep typing to narrow it down.
            </p>
          )}
        </div>
      )}

      {searchState.kind === "multiple-vehicles" && (
        <div className="mt-2 flex flex-col gap-1">
          {searchState.matches.slice(0, MAX_SUGGESTIONS).map((vehicle) => {
            const customer = customers.find((candidate) => candidate.id === vehicle.customerId);
            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => selectVehicle(vehicle)}
                className="rounded-md border px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{vehicle.plate}</span>{" "}
                {customer && <span className="text-muted-foreground">{customer.name}</span>}
              </button>
            );
          })}
          {searchState.matches.length > MAX_SUGGESTIONS && (
            <p className="text-xs text-muted-foreground">
              +{searchState.matches.length - MAX_SUGGESTIONS} more — keep typing to narrow it down.
            </p>
          )}
        </div>
      )}

      {searchState.kind === "found" && searchState.vehicles.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {searchState.vehicles.map((vehicle) => (
            <Badge
              key={vehicle.id}
              variant="outline"
              className="h-9 cursor-pointer px-3 text-sm"
              onClick={() => setValue("vehiclePlate", vehicle.plate)}
            >
              {vehicle.plate}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
