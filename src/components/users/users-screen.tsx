"use client";

import { RolePermissionsEditor } from "@/components/users/role-permissions-editor";
import { UserForm } from "@/components/users/user-form";
import { UserList } from "@/components/users/user-list";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";

export function UsersScreen() {
  const currentUser = useAuthStore((state) => state.user);
  const { users, loading, error } = useUsers(currentUser?.businessId);
  const { profile } = useBusinessProfile(currentUser?.businessId);

  return (
    <div className="flex flex-col gap-4">
      <UserForm />
      {error && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load users. Check your connection and reload.
        </p>
      )}
      <UserList users={users} loading={loading} currentUserId={currentUser?.uid} />
      {currentUser && <RolePermissionsEditor businessId={currentUser.businessId} profile={profile} />}
    </div>
  );
}
