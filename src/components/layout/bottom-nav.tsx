"use client";

import { BarChart3, LayoutDashboard, MoreHorizontal, Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Billing", icon: Receipt },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

// Items, Ledger and Settings live behind the "More" tab, so it should read active on those routes too.
const moreRoutes = ["/more", "/items", "/ledger", "/settings"];

/** Bottom tab bar — admin only. Receptionists only have Billing, so they get no nav chrome. */
export function BottomNav() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  if (user?.role !== "admin") return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-14 border-t bg-background print:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
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
