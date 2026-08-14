"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import type { Control, UseFieldArrayRemove } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BillingInput } from "@/validation/billing";

interface BillItemsListProps {
  control: Control<BillingInput>;
  fields: Array<{ id: string; itemId: string; name: string; type: string }>;
  remove: UseFieldArrayRemove;
}

export function BillItemsList({ control, fields, remove }: BillItemsListProps) {
  if (fields.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        No items added yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {fields.map((field, index) => (
        <li key={field.id} className="rounded-md border p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{field.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{field.type}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-destructive"
              onClick={() => remove(index)}
              aria-label={`Remove ${field.name}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Controller
              name={`items.${index}.quantity`}
              control={control}
              render={({ field: qtyField }) => (
                <div className="flex items-center rounded-md border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-none"
                    onClick={() => qtyField.onChange(Math.max(1, Number(qtyField.value) - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </Button>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={qtyField.value}
                    onChange={(event) => qtyField.onChange(Number(event.target.value))}
                    className="h-10 w-14 rounded-none border-x-0 text-center"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-none"
                    onClick={() => qtyField.onChange(Number(qtyField.value) + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              )}
            />
            <Controller
              name={`items.${index}.price`}
              control={control}
              render={({ field: priceField }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={priceField.value}
                  onChange={(event) => priceField.onChange(Number(event.target.value))}
                  className="h-10 flex-1"
                />
              )}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
