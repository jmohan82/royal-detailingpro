"use client";

import { useState } from "react";

import { ItemForm } from "@/components/items/item-form";
import { ItemList } from "@/components/items/item-list";
import { useAllItems } from "@/hooks/use-all-items";
import { useAuthStore } from "@/store/auth-store";
import type { Item } from "@/types/item";

export function ItemsScreen() {
  const user = useAuthStore((state) => state.user);
  const { items, loading, error } = useAllItems(user?.businessId);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <ItemForm editingItem={editingItem} onDone={() => setEditingItem(null)} />
      {error && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load items. Check your connection and reload.
        </p>
      )}
      <ItemList items={items} loading={loading} onEdit={setEditingItem} />
    </div>
  );
}
