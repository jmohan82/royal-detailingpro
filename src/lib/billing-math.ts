import type { AdjustmentType } from "@/types/billing";

export interface BillLineItemLike {
  quantity: number;
  price: number;
}

export interface BillTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateTotals(
  items: BillLineItemLike[],
  taxType: AdjustmentType,
  taxValue: number,
  discountType: AdjustmentType,
  discountValue: number,
): BillTotals {
  const subtotal = round2(
    items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0),
  );
  const discountAmount = round2(
    discountType === "percentage" ? (subtotal * (discountValue || 0)) / 100 : discountValue || 0,
  );
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = round2(
    taxType === "percentage" ? (taxableAmount * (taxValue || 0)) / 100 : taxValue || 0,
  );
  const grandTotal = round2(taxableAmount + taxAmount);

  return { subtotal, discountAmount, taxAmount, grandTotal };
}
