"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

import { auth } from "@/lib/firebase/config";
import { fetchUserProfile } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";

export function useAuthListener() {
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      try {
        const profile = await fetchUserProfile(firebaseUser);
        setUser(profile);
        setStatus("authenticated");
      } catch {
        setUser(null);
        setStatus("unauthenticated");
      }
    });
  }, [setUser, setStatus]);
}
