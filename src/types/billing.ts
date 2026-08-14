import type { ItemType } from "@/types/item";

export type PaymentMode = "Cash" | "Card" | "UPI" | "Bank Transfer";
export type AdjustmentType = "percentage" | "fixed";

export interface BillLineItem {
  itemId: string;
  name: string;
  type: ItemType;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  businessId: string;
  invoiceNumber: string;
  billingDate: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  vehicleId: string;
  vehiclePlate: string;
  paymentMode: PaymentMode;
  items: BillLineItem[];
  subtotal: number;
  taxType: AdjustmentType;
  taxValue: number;
  taxAmount: number;
  discountType: AdjustmentType;
  discountValue: number;
  discountAmount: number;
  grandTotal: number;
  createdAt: number;
  createdBy: string;
}
