import { AdminGuard } from "@/components/layout/admin-guard";
import { AppHeader } from "@/components/layout/app-header";
import { LedgerScreen } from "@/components/ledger/ledger-screen";

export default function LedgerPage() {
  return (
    <AdminGuard>
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Ledger" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <LedgerScreen />
        </main>
      </div>
    </AdminGuard>
  );
}
