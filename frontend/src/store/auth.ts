import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserOut, TenantOut } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: UserOut | null;
  tenant: TenantOut | null;
  apiKey: string | null;
  setAuth: (token: string, user: UserOut, tenant: TenantOut) => void;
  setApiKey: (key: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      tenant: null,
      apiKey: null,
      setAuth: (token, user, tenant) => {
        localStorage.setItem("dg_token", token);
        set({ token, user, tenant });
      },
      setApiKey: (key) => {
        localStorage.setItem("dg_api_key", key);
        set({ apiKey: key });
      },
      logout: () => {
        localStorage.removeItem("dg_token");
        localStorage.removeItem("dg_api_key");
        set({ token: null, user: null, tenant: null, apiKey: null });
      },
    }),
    { name: "dg-auth" }
  )
);
