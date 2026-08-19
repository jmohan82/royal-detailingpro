import { z } from "zod";

export const paymentModes = ["Cash", "Card", "UPI", "Bank Transfer"] as const;
export const adjustmentTypes = ["percentage", "fixed"] as const;

export const billLineItemSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["service", "product"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
});

export const billingSchema = z.object({
  billingDate: z.string().min(1, "Billing date is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerMobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^\d{7,15}$/, "Enter a valid mobile number"),
  vehiclePlate: z.string().min(1, "Vehicle license plate is required"),
  paymentMode: z.enum(paymentModes),
  items: z.array(billLineItemSchema).min(1, "Add at least one item"),
  taxType: z.enum(adjustmentTypes),
  taxValue: z.number().min(0),
  discountType: z.enum(adjustmentTypes),
  discountValue: z.number().min(0),
});

export type BillingInput = z.infer<typeof billingSchema>;
export type BillLineItemInput = z.infer<typeof billLineItemSchema>;
