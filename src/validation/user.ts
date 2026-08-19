import { z } from "zod";

import { userRoles } from "@/types/user";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(userRoles),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
