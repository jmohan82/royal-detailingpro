import { AppHeader } from "@/components/layout/app-header";
import { PageGuard } from "@/components/layout/page-guard";
import { RemindersScreen } from "@/components/reminders/reminders-screen";

export default function RemindersPage() {
  return (
    <PageGuard page="reminders">
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Reminders" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <RemindersScreen />
        </main>
      </div>
    </PageGuard>
  );
}
