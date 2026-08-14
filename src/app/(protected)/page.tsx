import { BillingForm } from "@/components/billing/billing-form";
import { AppHeader } from "@/components/layout/app-header";

export default function BillingPage() {
  return (
    <div className="min-h-dvh bg-muted/20">
      <AppHeader title="Billing" />
      <main className="mx-auto max-w-lg px-4 py-4">
        <BillingForm />
      </main>
    </div>
  );
}
