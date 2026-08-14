import { create } from "zustand";

import type { AppUser } from "@/types/user";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
}));
