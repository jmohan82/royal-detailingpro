import { AdminGuard } from "@/components/layout/admin-guard";
import { AppHeader } from "@/components/layout/app-header";
import { ItemsScreen } from "@/components/items/items-screen";

export default function ItemsPage() {
  return (
    <AdminGuard>
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Products & Services" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <ItemsScreen />
        </main>
      </div>
    </AdminGuard>
  );
}
