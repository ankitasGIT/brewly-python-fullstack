import { create } from "zustand";
import { decodeJWT, isTokenExpired } from "@/utils/jwt";

interface AuthState {
  token: string | null;
  role: "customer" | "manager" | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  email: null,
  isAuthenticated: false,

  login: (token: string) => {
    localStorage.setItem("access_token", token);
    const payload = decodeJWT(token);
    set({
      token,
      role: payload?.role ?? null,
      email: payload?.email ?? payload?.sub ?? null,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    set({ token: null, role: null, email: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem("access_token");
    if (token && !isTokenExpired(token)) {
      const payload = decodeJWT(token);
      set({
        token,
        role: payload?.role ?? null,
        email: payload?.email ?? payload?.sub ?? null,
        isAuthenticated: true,
      });
    } else {
      localStorage.removeItem("access_token");
      set({ token: null, role: null, email: null, isAuthenticated: false });
    }
  },
}));
