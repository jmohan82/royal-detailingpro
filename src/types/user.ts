export const userRoles = ["admin", "manager", "billing"] as const;

export type UserRole = (typeof userRoles)[number];

export interface AppUser {
  uid: string;
  businessId: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}
