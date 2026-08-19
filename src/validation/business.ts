import { z } from "zod";

const gstinPattern = /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/;

export const businessProfileSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{7,15}$/, "Enter a valid phone number"),
  gstNumber: z
    .string()
    .refine(
      (value) => value === "" || gstinPattern.test(value),
      "Enter a valid 15-character GSTIN, or leave blank",
    ),
  openingBalance: z.number(),
  openingBalanceDate: z.string().min(1, "Date is required"),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
