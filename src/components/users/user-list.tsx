"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateUser } from "@/services/user-service";
import { userRoles, type AppUser, type UserRole } from "@/types/user";

interface UserListProps {
  users: AppUser[];
  loading: boolean;
  currentUserId: string | undefined;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  billing: "Billing",
};

export function UserList({ users, loading, currentUserId }: UserListProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleRoleChange(user: AppUser, role: UserRole) {
    setPendingId(user.uid);
    try {
      await updateUser(user.uid, user.businessId, { name: user.name, role, active: user.active });
    } catch {
      toast.error("Couldn't update role. Try again.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleActiveChange(user: AppUser, active: boolean) {
    setPendingId(user.uid);
    try {
      await updateUser(user.uid, user.businessId, { name: user.name, role: user.role, active });
    } catch {
      toast.error("Couldn't update user. Try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Users</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && users.length === 0 && (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No users yet — add your first teammate above.
          </p>
        )}
        {!loading && users.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = user.uid === currentUserId;
                return (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.name}
                          {isSelf && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isSelf ? (
                        <Badge variant="outline">{roleLabels[user.role]}</Badge>
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(role) => handleRoleChange(user, role as UserRole)}
                          disabled={pendingId === user.uid}
                        >
                          <SelectTrigger size="sm" className="h-8 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {userRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {roleLabels[role]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={user.active}
                        disabled={isSelf || pendingId === user.uid}
                        onCheckedChange={(active) => handleActiveChange(user, active)}
                        aria-label={`${user.active ? "Deactivate" : "Activate"} ${user.name}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
