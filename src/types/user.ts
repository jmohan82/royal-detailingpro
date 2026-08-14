export type UserRole = "admin" | "receptionist";

export interface AppUser {
  uid: string;
  businessId: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}
