"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { searchCustomer } from "@/services/customer-service";
import type { Vehicle } from "@/types/vehicle";
import type { BillingInput } from "@/validation/billing";

interface CustomerSearchPanelProps {
  setValue: UseFormSetValue<BillingInput>;
}

export function CustomerSearchPanel({ setValue }: CustomerSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [vehicleOptions, setVehicleOptions] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<"idle" | "found" | "new">("idle");

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setStatus("idle");
      setVehicleOptions([]);
      return;
    }

    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const result = await searchCustomer(trimmed);

        if (result.found && result.customer) {
          setValue("customerName", result.customer.name);
          setValue("customerMobile", result.customer.mobile);
          setVehicleOptions(result.vehicles);
          if (result.vehicles.length === 1) {
            setValue("vehiclePlate", result.vehicles[0].plate);
          } else if (result.vehicles.length === 0) {
            setValue("vehiclePlate", "");
          }
          setStatus("found");
        } else {
          const looksLikePlate = /[a-zA-Z]/.test(trimmed);
          setValue("customerName", "");
          setValue("customerMobile", looksLikePlate ? "" : trimmed);
          setValue("vehiclePlate", looksLikePlate ? trimmed.toUpperCase() : "");
          setVehicleOptions([]);
          setStatus("new");
        }
      } catch {
        toast.error("Couldn't search customers. Check your connection and try again.");
        setStatus("idle");
        setVehicleOptions([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, setValue]);

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
      {searching && <p className="mt-1 text-xs text-muted-foreground">Searching…</p>}
      {!searching && status === "found" && (
        <p className="mt-1 text-xs text-success">Existing customer found.</p>
      )}
      {!searching && status === "new" && (
        <p className="mt-1 text-xs text-muted-foreground">
          No match — enter details below to create a new customer.
        </p>
      )}
      {vehicleOptions.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {vehicleOptions.map((vehicle) => (
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
