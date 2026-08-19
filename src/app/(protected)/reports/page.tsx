import { AdminGuard } from "@/components/layout/admin-guard";
import { AppHeader } from "@/components/layout/app-header";
import { ReportsScreen } from "@/components/reports/reports-screen";

export default function ReportsPage() {
  return (
    <AdminGuard>
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Reports" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <ReportsScreen />
        </main>
      </div>
    </AdminGuard>
  );
}
