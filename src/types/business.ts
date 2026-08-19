import type { RolePermissions } from "@/lib/permissions";

export interface BusinessProfile {
  id: string;
  name: string;
  address: string;
  phone: string;
  gstNumber: string;
  /** Cash/bank balance on hand immediately before this business started using the app. */
  openingBalance: number;
  openingBalanceDate: string;
  updatedAt: number;
  updatedBy: string;
  /** Which pages Manager and Billing roles can open. Admins always have full access. */
  rolePermissions?: RolePermissions;
}
