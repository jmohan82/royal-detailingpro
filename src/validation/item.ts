import { z } from "zod";

export const itemTypes = ["service", "product"] as const;

export const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(itemTypes),
  defaultPrice: z.number().min(0, "Price cannot be negative"),
  active: z.boolean(),
  reminderIntervalDays: z.number().min(0, "Cannot be negative"),
});

export type ItemInput = z.infer<typeof itemSchema>;
