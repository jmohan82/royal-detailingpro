"use client";

import { LogOut, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBusinessProfile } from "@/hooks/use-business-profile";
import { logout } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";

export function AppHeader({ title }: { title: string }) {
  const user = useAuthStore((state) => state.user);
  const { profile } = useBusinessProfile(user?.businessId);
  const businessName = profile?.name || "Royal DetailingPro";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-lg leading-tight font-semibold tracking-tight">{businessName}</p>
          <p className="text-xs text-muted-foreground">
            {title}
            {user && ` · ${user.name}`}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Sign out">
        <LogOut className="size-5" />
      </Button>
    </header>
  );
}
