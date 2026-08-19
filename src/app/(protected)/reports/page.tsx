import { AppHeader } from "@/components/layout/app-header";
import { PageGuard } from "@/components/layout/page-guard";
import { ReportsScreen } from "@/components/reports/reports-screen";

export default function ReportsPage() {
  return (
    <PageGuard page="reports">
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Reports" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <ReportsScreen />
        </main>
      </div>
    </PageGuard>
  );
}
