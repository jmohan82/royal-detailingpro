import { AppHeader } from "@/components/layout/app-header";
import { PageGuard } from "@/components/layout/page-guard";
import { BusinessProfileForm } from "@/components/settings/business-profile-form";

export default function SettingsPage() {
  return (
    <PageGuard page="settings">
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Store Settings" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <BusinessProfileForm />
        </main>
      </div>
    </PageGuard>
  );
}
