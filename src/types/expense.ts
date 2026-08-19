export const expenseCategories = [
  "Supplies",
  "Rent",
  "Utilities",
  "Salaries",
  "Salary Advance",
  "Other",
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

export interface Expense {
  id: string;
  businessId: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note: string;
  createdAt: number;
  createdBy: string;
}
