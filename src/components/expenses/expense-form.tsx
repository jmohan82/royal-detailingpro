"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createExpense } from "@/services/expense-service";
import { useAuthStore } from "@/store/auth-store";
import { expenseCategories } from "@/types/expense";
import { type ExpenseInput, expenseSchema } from "@/validation/expense";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyExpense(): ExpenseInput {
  return {
    date: todayIsoDate(),
    category: "Supplies",
    amount: 0,
    note: "",
  };
}

export function ExpenseForm() {
  const user = useAuthStore((state) => state.user);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: emptyExpense(),
  });

  async function onSubmit(values: ExpenseInput) {
    if (!user) return;
    setSubmitting(true);
    try {
      await createExpense({ businessId: user.businessId, createdBy: user.uid, input: values });
      toast.success("Expense added");
      reset(emptyExpense());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save expense.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit, () => {
            toast.error("Please fix the highlighted fields before saving.");
          })}
          className="flex flex-col gap-4"
        >
          <Controller
            name="date"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="expense-date">Date</FieldLabel>
                <Input {...field} id="expense-date" type="date" className="h-12 text-base" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-12 w-full text-base">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="amount"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="expense-amount">Amount</FieldLabel>
                <Input
                  id="expense-amount"
                  type="number"
                  inputMode="decimal"
                  min={0}
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
            name="note"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="expense-note">Note (optional)</FieldLabel>
                <Textarea
                  {...field}
                  id="expense-note"
                  placeholder="e.g. Wax and microfiber towels from ABC Supplies"
                  className="text-base"
                />
              </Field>
            )}
          />

          <Button type="submit" disabled={submitting} className="h-12 w-full text-base font-semibold">
            {submitting ? "Saving…" : "Save Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
