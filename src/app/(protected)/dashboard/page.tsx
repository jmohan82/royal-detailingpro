import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { AdminGuard } from "@/components/layout/admin-guard";
import { AppHeader } from "@/components/layout/app-header";

export default function DashboardPage() {
  return (
    <AdminGuard>
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Dashboard" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <DashboardScreen />
        </main>
      </div>
    </AdminGuard>
  );
}
