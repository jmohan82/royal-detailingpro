"use client";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { useExpenses } from "@/hooks/use-expenses";
import { useAuthStore } from "@/store/auth-store";

export function ExpensesScreen() {
  const user = useAuthStore((state) => state.user);
  const { expenses, loading, error } = useExpenses(user?.businessId);

  return (
    <div className="flex flex-col gap-4">
      <ExpenseForm />
      {error && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load expenses. Check your connection and reload.
        </p>
      )}
      <ExpenseList expenses={expenses} loading={loading} />
    </div>
  );
}
