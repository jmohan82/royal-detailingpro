import { collection, doc, increment, runTransaction } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import { calculateTotals } from "@/lib/billing-math";
import { normalizeMobile, normalizePlate } from "@/lib/normalize";
import type { BillingInput } from "@/validation/billing";

interface SaveBillParams {
  businessId: string;
  createdBy: string;
  input: BillingInput;
}

interface SaveBillResult {
  invoiceId: string;
  invoiceNumber: string;
}

export async function saveBill({ businessId, createdBy, input }: SaveBillParams): Promise<SaveBillResult> {
  const customerId = normalizeMobile(input.customerMobile);
  const vehicleId = normalizePlate(input.vehiclePlate);

  if (!customerId) throw new Error("Enter a valid mobile number.");
  if (!vehicleId) throw new Error("Enter a valid vehicle license plate.");

  const customerRef = doc(db, "customers", customerId);
  const vehicleRef = doc(db, "vehicles", vehicleId);
  const counterRef = doc(db, "counters", businessId);
  const invoiceRef = doc(collection(db, "invoices"));

  const totals = calculateTotals(
    input.items,
    input.taxType,
    input.taxValue,
    input.discountType,
    input.discountValue,
  );

  const invoiceNumber = await runTransaction(db, async (transaction) => {
    const [customerSnap, vehicleSnap, counterSnap] = await Promise.all([
      transaction.get(customerRef),
      transaction.get(vehicleRef),
      transaction.get(counterRef),
    ]);

    const nextSeq = ((counterSnap.data()?.invoiceSeq as number | undefined) ?? 0) + 1;
    const number = `INV-${String(nextSeq).padStart(5, "0")}`;
    const now = Date.now();

    transaction.set(
      customerRef,
      {
        businessId,
        name: input.customerName.trim(),
        mobile: input.customerMobile.trim(),
        updatedAt: now,
        ...(customerSnap.exists() ? {} : { createdAt: now }),
      },
      { merge: true },
    );

    transaction.set(
      vehicleRef,
      {
        businessId,
        customerId,
        plate: input.vehiclePlate.trim().toUpperCase(),
        updatedAt: now,
        ...(vehicleSnap.exists() ? {} : { createdAt: now }),
      },
      { merge: true },
    );

    transaction.set(counterRef, { invoiceSeq: nextSeq }, { merge: true });

    for (const item of input.items) {
      if (item.type !== "product") continue;
      const inventoryRef = doc(db, "inventory", `${businessId}_${item.itemId}`);
      transaction.set(
        inventoryRef,
        {
          businessId,
          itemId: item.itemId,
          quantityOnHand: increment(-item.quantity),
          updatedAt: now,
        },
        { merge: true },
      );
    }

    transaction.set(invoiceRef, {
      businessId,
      invoiceNumber: number,
      billingDate: input.billingDate,
      customerId,
      customerName: input.customerName.trim(),
      customerMobile: input.customerMobile.trim(),
      vehicleId,
      vehiclePlate: input.vehiclePlate.trim().toUpperCase(),
      paymentMode: input.paymentMode,
      items: input.items,
      subtotal: totals.subtotal,
      taxType: input.taxType,
      taxValue: input.taxValue,
      taxAmount: totals.taxAmount,
      discountType: input.discountType,
      discountValue: input.discountValue,
      discountAmount: totals.discountAmount,
      grandTotal: totals.grandTotal,
      createdAt: now,
      createdBy,
    });

    return number;
  });

  return { invoiceId: invoiceRef.id, invoiceNumber };
}
