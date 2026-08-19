"use client";

import { BookOpen, ChevronRight, Package, Settings, Users } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { canAccessPage, type PageKey } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth-store";

const links: {
  href: string;
  label: string;
  description: string;
  icon: typeof Package;
  page: PageKey | null;
}[] = [
  {
    href: "/items",
    label: "Products & Services",
    description: "Manage what you bill for",
    icon: Package,
    page: "items",
  },
  {
    href: "/ledger",
    label: "Ledger",
    description: "Opening balance and running account balance",
    icon: BookOpen,
    page: "ledger",
  },
  {
    href: "/settings",
    label: "Store Settings",
    description: "Name, address, phone, GST number",
    icon: Settings,
    page: "settings",
  },
  {
    href: "/users",
    label: "Users & Roles",
    description: "Manage staff logins and page access",
    icon: Users,
    page: null,
  },
];

export function MoreScreen() {
  const user = useAuthStore((state) => state.user);
  const { profile } = useBusinessProfile(user?.businessId);

  const visibleLinks = links.filter((link) => {
    if (!user) return false;
    if (link.href === "/users") return user.role === "admin";
    return canAccessPage(user.role, link.page as PageKey, profile?.rolePermissions);
  });

  return (
    <div className="flex flex-col gap-2">
      {visibleLinks.map(({ href, label, description, icon: Icon }) => (
        <Link key={href} href={href}>
          <Card className="flex-row items-center gap-3 px-4 py-3">
            <Icon className="size-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Card>
        </Link>
      ))}
    </div>
  );
}
