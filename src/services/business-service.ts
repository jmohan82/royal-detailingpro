import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import type { BusinessProfile } from "@/types/business";
import type { BusinessProfileInput } from "@/validation/business";

export function subscribeBusinessProfile(
  businessId: string,
  onChange: (profile: BusinessProfile | null) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    doc(db, "businesses", businessId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      onChange({ id: snapshot.id, ...(snapshot.data() as Omit<BusinessProfile, "id">) });
    },
    onError,
  );
}

/** One-time fetch — used by the printable receipt screen, which doesn't need a live listener. */
export async function fetchBusinessProfile(businessId: string): Promise<BusinessProfile | null> {
  const snapshot = await getDoc(doc(db, "businesses", businessId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as Omit<BusinessProfile, "id">) };
}

export async function saveBusinessProfile(
  businessId: string,
  updatedBy: string,
  input: BusinessProfileInput,
): Promise<void> {
  await setDoc(
    doc(db, "businesses", businessId),
    {
      name: input.name.trim(),
      address: input.address.trim(),
      phone: input.phone.trim(),
      gstNumber: input.gstNumber.trim().toUpperCase(),
      openingBalance: input.openingBalance,
      openingBalanceDate: input.openingBalanceDate,
      updatedAt: Date.now(),
      updatedBy,
    },
    { merge: true },
  );
}
