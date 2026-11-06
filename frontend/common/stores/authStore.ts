/**
 * Supabase auth state for the app and API client.
 * getToken() feeds the axios interceptor; the backend verifies that JWT via JWKS.
 */

import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

import { LOGIN_PAGE } from "@/common/constants";
import { config } from "@/common/constants/config";
import { supabase } from "@/common/lib/supabaseClient";

export type { User };

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

let hadSession = false;
let redirectingToLogin = false;

function redirectToLogin(): void {
  if (redirectingToLogin) return;
  if (typeof window === "undefined") return;
  if (window.location.pathname === LOGIN_PAGE) return;
  redirectingToLogin = true;
  window.location.assign(LOGIN_PAGE);
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,

  signOut: async () => {
    await supabase.auth.signOut();
    hadSession = false;
    set({ user: null, session: null, loading: false });
    redirectToLogin();
  },
}));

/** For the API interceptor (non-React). */
export function getToken(): string | null {
  return useAuthStore.getState().session?.access_token ?? null;
}

let started = false;

function applySession(session: Session | null) {
  const lostSession = !session && hadSession;
  hadSession = Boolean(session);

  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    loading: false,
  });

  // Session was live and Supabase cleared it (failed refresh, remote revoke, etc.).
  if (lostSession) {
    redirectToLogin();
  }
}

/** Subscribe once; keeps user/session in sync on login, logout, and refresh. */
export function initAuthListener(): void {
  if (started) return;
  started = true;

  void supabase.auth.getSession().then(({ data: { session } }) => {
    applySession(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    applySession(session);
  });
}

/**
 * Dev only: fake signed-in agent so /agent-dash is reachable before the login UI exists.
 * Sets no session, so getToken() stays null and no fake token is sent to the API.
 * TODO: remove once the sign-in UI ticket lands.
 */
export function devSignIn(): void {
  if (!config.isDevelopment) return;
  useAuthStore.setState({
    user: { id: "dev-agent", email: "dev.agent@agency.com" } as User,
    session: null,
    loading: false,
  });
}

/** Session present. Staff vs agent roles are a later ticket. */
export function canAccessAgentDash(user: User | null | undefined): boolean {
  return Boolean(user);
}

/** Role checks land in a later ticket; keep call sites compiling. */
export function isAgencyAdminAgent(_user: User | null | undefined): boolean {
  return false;
}
