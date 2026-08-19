"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createItem, updateItem } from "@/services/item-service";
import { useAuthStore } from "@/store/auth-store";
import type { Item } from "@/types/item";
import { type ItemInput, itemSchema, itemTypes } from "@/validation/item";

function emptyItem(): ItemInput {
  return { name: "", type: "service", defaultPrice: 0, active: true };
}

function toInput(item: Item): ItemInput {
  return { name: item.name, type: item.type, defaultPrice: item.defaultPrice, active: item.active };
}

interface ItemFormProps {
  editingItem: Item | null;
  onDone: () => void;
}

export function ItemForm({ editingItem, onDone }: ItemFormProps) {
  const user = useAuthStore((state) => state.user);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<ItemInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: editingItem ? toInput(editingItem) : emptyItem(),
  });

  useEffect(() => {
    reset(editingItem ? toInput(editingItem) : emptyItem());
  }, [editingItem, reset]);

  async function onSubmit(values: ItemInput) {
    if (!user) return;
    setSubmitting(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, user.businessId, values);
        toast.success("Item updated");
      } else {
        await createItem(user.businessId, values);
        toast.success("Item added");
      }
      onDone();
      if (!editingItem) reset(emptyItem());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save item.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{editingItem ? "Edit Item" : "Add Product / Service"}</CardTitle>
      </CardHeader>
      <CardContent>
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
                <FieldLabel htmlFor="item-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="item-name"
                  className="h-12 text-base"
                  placeholder="e.g. Ceramic Coating"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Type</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {itemTypes.map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={field.value === type ? "default" : "outline"}
                      className="h-12 capitalize"
                      onClick={() => field.onChange(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </Field>
            )}
          />

          <Controller
            name="defaultPrice"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="item-price">Default Price</FieldLabel>
                <Input
                  id="item-price"
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
            name="active"
            control={control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <FieldLabel htmlFor="item-active">Active (visible when billing)</FieldLabel>
                <Switch id="item-active" checked={field.value} onCheckedChange={field.onChange} />
              </Field>
            )}
          />

          <div className="flex gap-2">
            {editingItem && (
              <Button type="button" variant="outline" className="h-12 flex-1" onClick={onDone}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={submitting} className="h-12 flex-1 font-semibold">
              {submitting ? "Saving…" : editingItem ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
