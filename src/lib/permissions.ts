import type { UserRole } from "@/types/user";

/** Pages that are gated per-role. Billing (the "/" screen) and Users (admin-only) aren't in here. */
export type PageKey = "dashboard" | "expenses" | "items" | "reports" | "ledger" | "settings";

export const PAGE_CATALOG: { key: PageKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "expenses", label: "Expenses" },
  { key: "items", label: "Products & Services" },
  { key: "reports", label: "Reports" },
  { key: "ledger", label: "Ledger" },
  { key: "settings", label: "Store Settings" },
];

export type ConfigurableRole = "manager" | "billing";

export type RolePermissions = Record<ConfigurableRole, PageKey[]>;

/** Manager starts with everything except Store Settings; Billing starts with nothing extra
 * (every active user can already open the Billing screen). Used until the admin configures
 * page access on the Users & Roles screen. */
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  manager: ["dashboard", "expenses", "items", "reports", "ledger"],
  billing: [],
};

export function canAccessPage(
  role: UserRole,
  page: PageKey,
  rolePermissions: Partial<RolePermissions> | undefined,
): boolean {
  if (role === "admin") return true;
  if (role !== "manager" && role !== "billing") return false;
  const allowed = rolePermissions?.[role] ?? DEFAULT_ROLE_PERMISSIONS[role];
  return allowed.includes(page);
}
