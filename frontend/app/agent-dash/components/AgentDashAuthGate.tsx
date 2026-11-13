"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/common/components/ui/button";
import { HOME_PAGE, LOGIN_PAGE } from "@/common/constants";
import { config } from "@/common/constants/config";
import {
  canAccessAgentDash,
  devSignIn,
  useAuthStore,
  type User,
} from "@/common/stores/authStore";

/** Renders agent-dash content only for signed-in users. Role checks come later. */
export function AgentDashAuthGate({ children }: { children: ReactNode }) {
  const user: User | null = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/30 px-xl text-paragraph-regular text-muted-foreground">
        Checking sign-in…
      </div>
    );
  }

  if (canAccessAgentDash(user)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-lg bg-muted/30 px-xl text-center">
      <div className="flex max-w-md flex-col gap-sm">
        <h1 className="text-heading-3 font-semibold text-foreground">
          Sign in required
        </h1>
        <p className="text-paragraph-regular text-muted-foreground">
          The agent dashboard is only available when you are signed in.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-sm">
        <Button
          type="button"
          nativeButton={false}
          render={<Link href={LOGIN_PAGE} />}
        >
          Go to login
        </Button>
        {config.isDevelopment && (
          <Button type="button" variant="secondary" onClick={devSignIn}>
            Sign in as agent (dev)
          </Button>
        )}
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
