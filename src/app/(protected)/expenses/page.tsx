import { ExpensesScreen } from "@/components/expenses/expenses-screen";
import { AdminGuard } from "@/components/layout/admin-guard";
import { AppHeader } from "@/components/layout/app-header";

export default function ExpensesPage() {
  return (
    <AdminGuard>
      <div className="min-h-dvh bg-muted/20">
        <AppHeader title="Expenses" />
        <main className="mx-auto max-w-lg px-4 py-4 pb-24">
          <ExpensesScreen />
        </main>
      </div>
    </AdminGuard>
  );
}
