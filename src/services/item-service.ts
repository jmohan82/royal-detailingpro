import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import type { Item } from "@/types/item";

export function subscribeActiveItems(
  businessId: string,
  onChange: (items: Item[]) => void,
  onError: (error: Error) => void,
): () => void {
  const itemsQuery = query(
    collection(db, "items"),
    where("businessId", "==", businessId),
    where("active", "==", true),
  );

  return onSnapshot(
    itemsQuery,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<Item, "id">;
        return { id: docSnap.id, ...data, defaultPrice: Number(data.defaultPrice) };
      });
      onChange(items);
    },
    onError,
  );
}
