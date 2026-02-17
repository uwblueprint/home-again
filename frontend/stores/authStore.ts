/**
 * Authentication Store
 *
 * Manages global authentication state including:
 * - Current user information
 * - Auth token
 * - Login/logout status
 *
 * Uses Zustand for minimal boilerplate and optimal performance.
 * @see https://zustand.docs.pmnd.rs/
 */

import { create } from "zustand";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "agency";
  region?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
