import { AdminGuard } from "@/components/layout/admin-guard";
import { AppHeader } from "@/components/layout/app-header";
import { MoreScreen } from "@/components/more/more-screen";

export default function MorePage() {
  return (
    <AdminGuard>
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="More" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <MoreScreen />
        </main>
      </div>
    </AdminGuard>
  );
}
