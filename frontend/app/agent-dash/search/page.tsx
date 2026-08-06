"use client";

import { Suspense } from "react";

import { AgentDashShell } from "../components/AgentDashShell";
import { UniversalSearchView } from "../components/UniversalSearchView";

export default function AgentDashSearchPage() {
  return (
    <AgentDashShell>
      <Suspense
        fallback={
          <div className="text-paragraph-small text-muted-foreground">
            Searching…
          </div>
        }
      >
        <UniversalSearchView />
      </Suspense>
    </AgentDashShell>
  );
}
