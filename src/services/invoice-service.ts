import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import type { Invoice } from "@/types/billing";

/** One-time fetch of a single invoice — used by the printable receipt screen. */
export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  const snapshot = await getDoc(doc(db, "invoices", invoiceId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as Omit<Invoice, "id">) };
}

/** All invoices for this business — used by the Dashboard and Reports screens. */
export function subscribeInvoices(
  businessId: string,
  onChange: (invoices: Invoice[]) => void,
  onError: (error: Error) => void,
): () => void {
  const invoicesQuery = query(collection(db, "invoices"), where("businessId", "==", businessId));

  return onSnapshot(
    invoicesQuery,
    (snapshot) => {
      const invoices = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Invoice, "id">) }))
        .sort((a, b) => b.createdAt - a.createdAt);
      onChange(invoices);
    },
    onError,
  );
}
