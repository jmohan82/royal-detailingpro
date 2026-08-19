"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_ROLE_PERMISSIONS, PAGE_CATALOG, type PageKey } from "@/lib/permissions";
import { saveRolePermissions } from "@/services/business-service";
import type { BusinessProfile } from "@/types/business";

interface RolePermissionsEditorProps {
  businessId: string;
  profile: BusinessProfile | null;
}

export function RolePermissionsEditor({ businessId, profile }: RolePermissionsEditorProps) {
  const [manager, setManager] = useState<PageKey[]>(DEFAULT_ROLE_PERMISSIONS.manager);
  const [billing, setBilling] = useState<PageKey[]>(DEFAULT_ROLE_PERMISSIONS.billing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setManager(profile?.rolePermissions?.manager ?? DEFAULT_ROLE_PERMISSIONS.manager);
    setBilling(profile?.rolePermissions?.billing ?? DEFAULT_ROLE_PERMISSIONS.billing);
  }, [profile]);

  function toggle(role: "manager" | "billing", page: PageKey) {
    const setList = role === "manager" ? setManager : setBilling;
    setList((prev) => (prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveRolePermissions(businessId, { manager, billing });
      toast.success("Page access updated");
    } catch {
      toast.error("Couldn't save page access. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Page Access by Role</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground">
          Admins always have full access, and everyone can open Billing. Choose which other pages
          Managers and Billing staff can open.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-center">Manager</TableHead>
              <TableHead className="text-center">Billing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PAGE_CATALOG.map((page) => (
              <TableRow key={page.key}>
                <TableCell className="font-medium">{page.label}</TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={manager.includes(page.key)}
                    onCheckedChange={() => toggle("manager", page.key)}
                    aria-label={`Manager access to ${page.label}`}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={billing.includes(page.key)}
                    onCheckedChange={() => toggle("billing", page.key)}
                    aria-label={`Billing access to ${page.label}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button type="button" onClick={handleSave} disabled={saving} className="h-12 font-semibold">
          {saving ? "Saving…" : "Save Page Access"}
        </Button>
      </CardContent>
    </Card>
  );
}
