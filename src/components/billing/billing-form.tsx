"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AdjustmentInput } from "@/components/billing/adjustment-input";
import { BillItemsList } from "@/components/billing/bill-items-list";
import { CustomerSearchPanel } from "@/components/billing/customer-search-panel";
import { ItemSearch } from "@/components/billing/item-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useItems } from "@/hooks/use-items";
import { calculateTotals } from "@/lib/billing-math";
import { saveBill } from "@/services/billing-service";
import { useAuthStore } from "@/store/auth-store";
import type { Item } from "@/types/item";
import { type BillingInput, billingSchema, paymentModes } from "@/validation/billing";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyBill(): BillingInput {
  return {
    billingDate: todayIsoDate(),
    customerName: "",
    customerMobile: "",
    vehiclePlate: "",
    paymentMode: "Cash",
    items: [],
    taxType: "percentage",
    taxValue: 0,
    discountType: "percentage",
    discountValue: 0,
  };
}

export function BillingForm() {
  const user = useAuthStore((state) => state.user);
  const { items, error: itemsError } = useItems(user?.businessId);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<BillingInput>({
    resolver: zodResolver(billingSchema),
    defaultValues: emptyBill(),
  });

  const { control, handleSubmit, setValue, watch, reset, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items");
  const taxType = watch("taxType");
  const taxValue = watch("taxValue");
  const discountType = watch("discountType");
  const discountValue = watch("discountValue");

  const totals = useMemo(
    () => calculateTotals(watchedItems, taxType, taxValue, discountType, discountValue),
    [watchedItems, taxType, taxValue, discountType, discountValue],
  );

  function handleAddItem(item: Item) {
    const existingIndex = fields.findIndex((field) => field.itemId === item.id);
    if (existingIndex >= 0) {
      setValue(`items.${existingIndex}.quantity`, watchedItems[existingIndex].quantity + 1);
      return;
    }
    append({
      itemId: item.id,
      name: item.name,
      type: item.type,
      quantity: 1,
      price: item.defaultPrice,
    });
  }

  async function onSubmit(values: BillingInput) {
    if (!user) return;
    setSubmitting(true);
    try {
      const { invoiceNumber } = await saveBill({
        businessId: user.businessId,
        createdBy: user.uid,
        input: values,
      });
      toast.success(`Bill saved — ${invoiceNumber}`);
      reset(emptyBill());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save bill.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => {
        toast.error("Please fix the highlighted fields before saving.");
      })}
      className="flex flex-col gap-4 pb-24"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer & Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Controller
            name="billingDate"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="billing-date">Billing Date</FieldLabel>
                <Input {...field} id="billing-date" type="date" className="h-12 text-base" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field>
            <FieldLabel>Search Customer</FieldLabel>
            <CustomerSearchPanel setValue={setValue} />
          </Field>

          <Controller
            name="customerName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="customer-name">Customer Name</FieldLabel>
                <Input
                  {...field}
                  id="customer-name"
                  className="h-12 text-base"
                  placeholder="Full name"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="customerMobile"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="customer-mobile">Mobile Number</FieldLabel>
                <Input
                  {...field}
                  id="customer-mobile"
                  inputMode="numeric"
                  className="h-12 text-base"
                  placeholder="10-digit mobile number"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="vehiclePlate"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="vehicle-plate">Vehicle License Plate</FieldLabel>
                <Input
                  {...field}
                  id="vehicle-plate"
                  className="h-12 text-base uppercase"
                  placeholder="e.g. TN01AB1234"
                  aria-invalid={fieldState.invalid}
                  onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="paymentMode"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Payment Mode</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {paymentModes.map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      variant={field.value === mode ? "default" : "outline"}
                      className="h-12"
                      onClick={() => field.onChange(mode)}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {itemsError && (
            <p className="text-sm text-destructive">
              Couldn&apos;t load the item catalog. Check your connection and reload.
            </p>
          )}
          <ItemSearch items={items} onSelect={handleAddItem} />
          <BillItemsList control={control} fields={fields} remove={remove} />
          {formState.errors.items && (
            <p className="text-sm text-destructive">{formState.errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tax & Discount</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <AdjustmentInput
            label="Discount"
            type={discountType}
            value={discountValue}
            onTypeChange={(type) => setValue("discountType", type)}
            onValueChange={(value) => setValue("discountValue", value)}
          />
          <AdjustmentInput
            label="Tax"
            type={taxType}
            value={taxValue}
            onTypeChange={(type) => setValue("taxType", type)}
            onValueChange={(value) => setValue("taxValue", value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 pt-6">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Discount</span>
            <span>-₹{totals.discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax</span>
            <span>+₹{totals.taxAmount.toFixed(2)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t pt-2 text-lg font-bold">
            <span>Grand Total</span>
            <span>₹{totals.grandTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 border-t bg-background p-4">
        <Button
          type="submit"
          disabled={submitting}
          className="h-14 w-full text-lg font-semibold"
        >
          {submitting ? "Saving…" : "Save Bill"}
        </Button>
      </div>
    </form>
  );
}
