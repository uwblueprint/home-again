"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/common/components/ui/button";
import { HOME_PAGE } from "@/common/constants";
import {
  canAccessAgentDash,
  useAuthStore,
  type User,
} from "@/common/stores/authStore";
import { CURRENT_AGENT_ID } from "../data/mockReferrals";

/**
 * Temporary stub until real auth/login is wired up.
 * Matches the primary mock case agent so "My Referrals" is meaningful.
 */
export const DEV_AGENT_USER: User = {
  id: CURRENT_AGENT_ID,
  email: "wanyun.xue@agency.com",
  firstName: "Wanyun",
  lastName: "Xue",
  role: "agency",
  isAdminAgent: false,
};

/** Temporary stub for verifying admin-only agent actions. */
export const DEV_ADMIN_AGENT_USER: User = {
  id: CURRENT_AGENT_ID,
  email: "wanyun.xue@agency.com",
  firstName: "Wanyun",
  lastName: "Xue",
  role: "agency",
  isAdminAgent: true,
};

type AgentDashAuthGateProps = {
  children: ReactNode;
};

/**
 * Renders agent-dash content only for signed-in agency agents.
 * Others see an access-denied state (with a temporary stub sign-in
 * because the app does not have a login flow yet).
 */
export function AgentDashAuthGate({ children }: AgentDashAuthGateProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/30 text-paragraph-small text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (isAuthenticated && canAccessAgentDash(user)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-lg bg-muted/30 px-xl text-center">
      <div className="flex max-w-md flex-col gap-sm">
        <h1 className="text-heading-3 font-semibold text-foreground">
          Agent access required
        </h1>
        <p className="text-paragraph-regular text-muted-foreground">
          The agent dashboard is only available when you are signed in as an
          agency agent.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-sm">
        <Button
          type="button"
          onClick={() => {
            setUser(DEV_AGENT_USER);
          }}
        >
          Sign in as agent
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setUser(DEV_ADMIN_AGENT_USER);
          }}
        >
          Sign in as admin agent
        </Button>
        <Button
          type="button"
          variant="secondary"
          nativeButton={false}
          render={<Link href={HOME_PAGE} />}
        >
          Back to home
        </Button>
      </div>
    </div>
  );
}
