import { AdminGuard } from "@/components/layout/admin-guard";
import { AppHeader } from "@/components/layout/app-header";
import { UsersScreen } from "@/components/users/users-screen";

export default function UsersPage() {
  return (
    <AdminGuard>
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Users & Roles" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <UsersScreen />
        </main>
      </div>
    </AdminGuard>
  );
}
