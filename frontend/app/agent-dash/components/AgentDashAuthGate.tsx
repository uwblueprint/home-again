"use client";

import type { ReactNode } from "react";
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
 * Temporary stub until real auth/login is wired up. Matches the primary mock
 * case agent so "My Referrals" is meaningful.
 */
function makeDevAgent(isAdminAgent: boolean): User {
  return {
    id: CURRENT_AGENT_ID,
    email: "wanyun.xue@agency.com",
    firstName: "Wanyun",
    lastName: "Xue",
    role: "agency",
    isAdminAgent,
  };
}

/** Renders agent-dash content only for signed-in agency agents. */
export function AgentDashAuthGate({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

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
        <Button type="button" onClick={() => setUser(makeDevAgent(false))}>
          Sign in as agent
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setUser(makeDevAgent(true))}
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
