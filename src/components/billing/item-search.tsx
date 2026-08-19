"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import type { Item } from "@/types/item";

interface ItemSearchProps {
  items: Item[];
  onSelect: (item: Item) => void;
}

export function ItemSearch({ items, onSelect }: ItemSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 8);
  }, [items, query]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search services or products…"
          className="h-12 pl-9 text-base"
        />
      </div>
      {results.length > 0 && (
        <ul className="mt-2 divide-y overflow-hidden rounded-md border">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(item);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left active:bg-muted"
              >
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs capitalize text-muted-foreground">{item.type}</span>
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  ₹{item.defaultPrice}
                  <Plus className="size-4" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length > 0 && results.length === 0 && (
        <p className="mt-2 text-sm text-muted-foreground">No matching items found.</p>
      )}
    </div>
  );
}
