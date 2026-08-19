import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import type { Item } from "@/types/item";
import type { ItemInput } from "@/validation/item";

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

/** All items for this business, active or not — used by the Products & Services management screen. */
export function subscribeItems(
  businessId: string,
  onChange: (items: Item[]) => void,
  onError: (error: Error) => void,
): () => void {
  const itemsQuery = query(collection(db, "items"), where("businessId", "==", businessId));

  return onSnapshot(
    itemsQuery,
    (snapshot) => {
      const items = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as Omit<Item, "id">;
          return { id: docSnap.id, ...data, defaultPrice: Number(data.defaultPrice) };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      onChange(items);
    },
    onError,
  );
}

export async function createItem(businessId: string, input: ItemInput): Promise<void> {
  await addDoc(collection(db, "items"), {
    businessId,
    name: input.name.trim(),
    type: input.type,
    defaultPrice: input.defaultPrice,
    active: input.active,
  });
}

export async function updateItem(itemId: string, businessId: string, input: ItemInput): Promise<void> {
  await updateDoc(doc(db, "items", itemId), {
    businessId,
    name: input.name.trim(),
    type: input.type,
    defaultPrice: input.defaultPrice,
    active: input.active,
  });
}

export async function setItemActive(itemId: string, businessId: string, active: boolean): Promise<void> {
  await updateDoc(doc(db, "items", itemId), { businessId, active });
}
