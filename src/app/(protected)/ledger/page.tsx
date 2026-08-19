import { LedgerScreen } from "@/components/ledger/ledger-screen";
import { AppHeader } from "@/components/layout/app-header";
import { PageGuard } from "@/components/layout/page-guard";

export default function LedgerPage() {
  return (
    <PageGuard page="ledger">
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Ledger" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <LedgerScreen />
        </main>
      </div>
    </PageGuard>
  );
}
