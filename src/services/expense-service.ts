import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import type { Expense } from "@/types/expense";
import type { ExpenseInput } from "@/validation/expense";

export function subscribeExpenses(
  businessId: string,
  onChange: (expenses: Expense[]) => void,
  onError: (error: Error) => void,
): () => void {
  const expensesQuery = query(collection(db, "expenses"), where("businessId", "==", businessId));

  return onSnapshot(
    expensesQuery,
    (snapshot) => {
      const expenses = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as Omit<Expense, "id">;
          return { id: docSnap.id, ...data, amount: Number(data.amount) };
        })
        .sort((a, b) =>
          a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date),
        );
      onChange(expenses);
    },
    onError,
  );
}

interface CreateExpenseParams {
  businessId: string;
  createdBy: string;
  input: ExpenseInput;
}

export async function createExpense({ businessId, createdBy, input }: CreateExpenseParams): Promise<void> {
  await addDoc(collection(db, "expenses"), {
    businessId,
    date: input.date,
    category: input.category,
    amount: input.amount,
    note: input.note?.trim() ?? "",
    createdAt: Date.now(),
    createdBy,
  });
}
