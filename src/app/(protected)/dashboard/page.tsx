import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { AppHeader } from "@/components/layout/app-header";
import { PageGuard } from "@/components/layout/page-guard";

export default function DashboardPage() {
  return (
    <PageGuard page="dashboard">
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Dashboard" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <DashboardScreen />
        </main>
      </div>
    </PageGuard>
  );
}
