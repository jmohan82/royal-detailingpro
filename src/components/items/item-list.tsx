"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { setItemActive } from "@/services/item-service";
import { useAuthStore } from "@/store/auth-store";
import type { Item } from "@/types/item";

interface ItemListProps {
  items: Item[];
  loading: boolean;
  onEdit: (item: Item) => void;
}

export function ItemList({ items, loading, onEdit }: ItemListProps) {
  const user = useAuthStore((state) => state.user);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleToggleActive(item: Item, active: boolean) {
    if (!user) return;
    setPendingId(item.id);
    try {
      await setItemActive(item.id, user.businessId, active);
    } catch {
      toast.error("Couldn't update item. Try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Products & Services</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No items yet — add your first product or service above.
          </p>
        )}
        {!loading && items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">₹{item.defaultPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={item.active}
                      disabled={pendingId === item.id}
                      onCheckedChange={(active) => handleToggleActive(item, active)}
                      aria-label={`${item.active ? "Deactivate" : "Activate"} ${item.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
