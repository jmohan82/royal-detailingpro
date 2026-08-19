import { ItemsScreen } from "@/components/items/items-screen";
import { AppHeader } from "@/components/layout/app-header";
import { PageGuard } from "@/components/layout/page-guard";

export default function ItemsPage() {
  return (
    <PageGuard page="items">
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Products & Services" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <ItemsScreen />
        </main>
      </div>
    </PageGuard>
  );
}
