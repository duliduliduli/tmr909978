"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/lib/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const { setAuthUser, clearAuthUser, authUser } = useAppStore();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      // Only sync once per user session (avoid re-calling on every render)
      if (syncedRef.current === user.id) return;
      syncedRef.current = user.id;

      fetch("/api/auth/sync", { method: "POST" })
        .then((res) => {
          if (!res.ok) throw new Error("Sync failed");
          return res.json();
        })
        .then((data) => {
          setAuthUser({
            userId: data.userId,
            customerProfileId: data.customerProfileId,
            providerProfileId: data.providerProfileId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            avatar: data.avatar,
            phone: data.phone,
          });
        })
        .catch((err) => {
          console.error("Auth sync error:", err);
        });
    } else if (!isSignedIn) {
      if (syncedRef.current || authUser) {
        syncedRef.current = null;
        clearAuthUser();
      }
    }
  }, [isSignedIn, user, isLoaded, setAuthUser, clearAuthUser, authUser]);

  return <>{children}</>;
}
