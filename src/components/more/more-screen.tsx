"use client";

import { BookOpen, ChevronRight, Package, Settings } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";

const links = [
  {
    href: "/items",
    label: "Products & Services",
    description: "Manage what you bill for",
    icon: Package,
  },
  {
    href: "/ledger",
    label: "Ledger",
    description: "Opening balance and running account balance",
    icon: BookOpen,
  },
  {
    href: "/settings",
    label: "Store Settings",
    description: "Name, address, phone, GST number",
    icon: Settings,
  },
];

export function MoreScreen() {
  return (
    <div className="flex flex-col gap-2">
      {links.map(({ href, label, description, icon: Icon }) => (
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
