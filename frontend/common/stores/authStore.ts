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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "agency";
  region?: string;
  /** Agency admin privileges (e.g. add agents). Only meaningful when role is "agency". */
  isAdminAgent?: boolean;
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

/** Agent dashboard is limited to signed-in agency agents. */
export function canAccessAgentDash(user: User | null | undefined): boolean {
  return Boolean(user && user.role === "agency");
}

/** Agency admin agents can manage other agents (e.g. Add new agent). */
export function isAgencyAdminAgent(user: User | null | undefined): boolean {
  return Boolean(user && user.role === "agency" && user.isAdminAgent);
}
