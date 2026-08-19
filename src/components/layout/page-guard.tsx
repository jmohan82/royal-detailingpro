"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useBusinessProfile } from "@/hooks/use-business-profile";
import { canAccessPage, type PageKey } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth-store";

/** Wraps a page that's gated by the admin-configurable role permissions. Admins always pass. */
export function PageGuard({ page, children }: { page: PageKey; children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const { profile, loading: profileLoading } = useBusinessProfile(user?.businessId);
  const router = useRouter();

  const allowed = user ? canAccessPage(user.role, page, profile?.rolePermissions) : false;
  const ready = !!user && !profileLoading;

  useEffect(() => {
    if (ready && !allowed) {
      router.replace("/");
    }
  }, [ready, allowed, router]);

  if (!ready || !allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
