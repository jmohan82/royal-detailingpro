"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";

export function AppHeader({ title }: { title: string }) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
      <div>
        <p className="text-base font-semibold">{title}</p>
        {user && <p className="text-xs text-muted-foreground">{user.name}</p>}
      </div>
      <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Sign out">
        <LogOut className="size-5" />
      </Button>
    </header>
  );
}
