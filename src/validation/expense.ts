import { z } from "zod";

import { expenseCategories } from "@/types/expense";

export const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  category: z.enum(expenseCategories),
  amount: z.number().positive("Amount must be greater than 0"),
  note: z.string().max(500),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
