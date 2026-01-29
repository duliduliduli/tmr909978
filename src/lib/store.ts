"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "customer" | "detailer";

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  activeCustomerId: string;
  activeDetailerId: string;
  setActiveCustomerId: (id: string) => void;
  setActiveDetailerId: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: "customer",
      setRole: (role) => set({ role }),
      activeCustomerId: "cust_1",
      activeDetailerId: "det_1", 
      setActiveCustomerId: (id) => set({ activeCustomerId: id }),
      setActiveDetailerId: (id) => set({ activeDetailerId: id }),
    }),
    { name: "app_state_v1" }
  )
);