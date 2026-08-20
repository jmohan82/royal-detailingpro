import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import type { ReminderSend } from "@/types/reminder";

export function subscribeReminderSends(
  businessId: string,
  onChange: (sends: ReminderSend[]) => void,
  onError: (error: Error) => void,
): () => void {
  const sendsQuery = query(collection(db, "reminderSends"), where("businessId", "==", businessId));

  return onSnapshot(
    sendsQuery,
    (snapshot) => {
      const sends = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<ReminderSend, "id">;
        return { id: docSnap.id, ...data };
      });
      onChange(sends);
    },
    onError,
  );
}

export async function logReminderSent(
  businessId: string,
  sentBy: string,
  input: { customerMobile: string; customerName: string; itemId: string; itemName: string },
): Promise<void> {
  await addDoc(collection(db, "reminderSends"), {
    businessId,
    customerMobile: input.customerMobile,
    customerName: input.customerName,
    itemId: input.itemId,
    itemName: input.itemName,
    sentAt: Date.now(),
    sentBy,
  });
}
