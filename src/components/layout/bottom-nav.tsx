"use client";

import { BarChart3, LayoutDashboard, MoreHorizontal, Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useBusinessProfile } from "@/hooks/use-business-profile";
import { canAccessPage, type PageKey } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const navItems: { href: string; label: string; icon: typeof Receipt; page: PageKey | null }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { href: "/", label: "Billing", icon: Receipt, page: null },
  { href: "/expenses", label: "Expenses", icon: Wallet, page: "expenses" },
  { href: "/reports", label: "Reports", icon: BarChart3, page: "reports" },
  { href: "/more", label: "More", icon: MoreHorizontal, page: null },
];

// Items, Ledger, Reminders, Settings (and Users, for admins) live behind the "More" tab.
const moreRoutes = ["/more", "/items", "/ledger", "/reminders", "/settings", "/users"];
const morePages: PageKey[] = ["items", "ledger", "reminders", "settings"];

/** Bottom tab bar — shown to every active user, filtered to the pages their role can open. */
export function BottomNav() {
  const user = useAuthStore((state) => state.user);
  const { profile } = useBusinessProfile(user?.businessId);
  const pathname = usePathname();

  if (!user) return null;

  const hasMoreAccess =
    user.role === "admin" || morePages.some((page) => canAccessPage(user.role, page, profile?.rolePermissions));

  const visibleItems = navItems.filter((item) => {
    if (item.href === "/more") return hasMoreAccess;
    if (item.page === null) return true;
    return canAccessPage(user.role, item.page, profile?.rolePermissions);
  });

  if (visibleItems.length <= 1) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-14 border-t bg-background print:hidden">
      {visibleItems.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : href === "/more"
              ? moreRoutes.some((route) => pathname.startsWith(route))
              : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
