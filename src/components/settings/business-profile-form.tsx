"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { saveBusinessProfile } from "@/services/business-service";
import { useAuthStore } from "@/store/auth-store";
import { todayIsoDate } from "@/lib/date";
import { type BusinessProfileInput, businessProfileSchema } from "@/validation/business";

function emptyProfile(): BusinessProfileInput {
  return {
    name: "",
    address: "",
    phone: "",
    gstNumber: "",
    openingBalance: 0,
    openingBalanceDate: todayIsoDate(),
  };
}

export function BusinessProfileForm() {
  const user = useAuthStore((state) => state.user);
  const { profile, loading: profileLoading } = useBusinessProfile(user?.businessId);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: emptyProfile(),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        address: profile.address,
        phone: profile.phone,
        gstNumber: profile.gstNumber,
        openingBalance: profile.openingBalance ?? 0,
        openingBalanceDate: profile.openingBalanceDate || todayIsoDate(),
      });
    }
  }, [profile, reset]);

  async function onSubmit(values: BusinessProfileInput) {
    if (!user) return;
    setSubmitting(true);
    try {
      await saveBusinessProfile(user.businessId, user.uid, values);
      toast.success("Store details saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save store details.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Store Details</CardTitle>
      </CardHeader>
      <CardContent>
        {profileLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit, () => {
              toast.error("Please fix the highlighted fields before saving.");
            })}
            className="flex flex-col gap-4"
          >
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="store-name">Store Name</FieldLabel>
                  <Input
                    {...field}
                    id="store-name"
                    className="h-12 text-base"
                    placeholder="e.g. Royal DetailingPro"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="store-address">Address</FieldLabel>
                  <Textarea
                    {...field}
                    id="store-address"
                    placeholder="Street, city, state, PIN code"
                    className="text-base"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="store-phone">Phone Number</FieldLabel>
                  <Input
                    {...field}
                    id="store-phone"
                    inputMode="numeric"
                    className="h-12 text-base"
                    placeholder="10-digit phone number"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="gstNumber"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="store-gst">GST Number (optional)</FieldLabel>
                  <Input
                    {...field}
                    id="store-gst"
                    className="h-12 text-base uppercase"
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="flex flex-col gap-1 border-t pt-4">
              <p className="text-sm font-medium">Ledger Opening Balance</p>
              <p className="text-xs text-muted-foreground">
                Your cash/bank balance right before you started using this app. The Ledger page
                carries this forward against every sale and expense.
              </p>
            </div>

            <Controller
              name="openingBalance"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="opening-balance">Opening Balance</FieldLabel>
                  <Input
                    id="opening-balance"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    className="h-12 text-base"
                    placeholder="0.00"
                    value={field.value === 0 ? "" : field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="openingBalanceDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="opening-balance-date">As Of</FieldLabel>
                  <Input {...field} id="opening-balance-date" type="date" className="h-12 text-base" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Button type="submit" disabled={submitting} className="h-12 w-full text-base font-semibold">
              {submitting ? "Saving…" : "Save Details"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
