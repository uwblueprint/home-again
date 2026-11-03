/**
 * Supabase auth state for the app and API client.
 * getToken() feeds the axios interceptor; the backend verifies that JWT via JWKS.
 */

import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

import { LOGIN_PAGE } from "@/common/constants";
import { supabase } from "@/common/lib/supabaseClient";

export type { User };

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
    window.location.assign(LOGIN_PAGE);
  },
}));

/** For the API interceptor (non-React). */
export function getToken(): string | null {
  return useAuthStore.getState().session?.access_token ?? null;
}

let started = false;

function applySession(session: Session | null) {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    loading: false,
  });
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

/** Session present. Staff vs agent roles are a later ticket. */
export function canAccessAgentDash(user: User | null | undefined): boolean {
  return Boolean(user);
}

export function isAgencyAdminAgent(user: User | null | undefined): boolean {
  const meta =
    user?.app_metadata?.is_admin_agent ?? user?.user_metadata?.is_admin_agent;
  return Boolean(meta);
}
