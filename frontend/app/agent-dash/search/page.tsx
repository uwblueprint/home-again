"use client";

import { use, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  agentColumns,
  clientColumns,
  referralColumns,
} from "@/app/agent-dash/components";
import {
  AGENT_ROWS,
  type AgentListRow,
} from "@/app/agent-dash/data/mockAgents";
import { CLIENT_ROWS, type ClientRow } from "@/app/agent-dash/data/mockClients";
import {
  REFERRAL_ROWS,
  type ReferralRow,
} from "@/app/agent-dash/data/mockReferrals";
import {
  DataTable,
  DataTablePagination,
} from "@/common/components/data-display";
import {
  AGENT_DASH_AGENT,
  AGENT_DASH_CLIENT,
  AGENT_DASH_REFERRAL,
} from "@/common/constants";

const PAGE_SIZE = 10;

function matches(query: string, values: (string | number | undefined)[]) {
  const needle = query.toLowerCase();
  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(needle)
  );
}

function searchReferrals(query: string) {
  return REFERRAL_ROWS.filter((row) =>
    matches(query, [
      row.clientName,
      row.referralId,
      row.creationDate,
      row.status,
      row.statusDate,
      ...row.caseAgents.map((agent) => `${agent.firstName} ${agent.lastName}`),
    ])
  );
}

function searchClients(query: string) {
  return CLIENT_ROWS.filter((row) =>
    matches(query, [
      row.clientName,
      row.clientId,
      row.mostRecentReferral,
      row.status,
      row.statusDate,
    ])
  );
}

function searchAgents(query: string) {
  return AGENT_ROWS.filter((row) =>
    matches(query, [
      row.agentName,
      row.agentId,
      row.role,
      row.email,
      row.pendingReferrals,
      row.scheduledReferrals,
      row.deliveredReferrals,
    ])
  );
}

function SearchMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-border bg-background px-xl py-2xl text-center">
      {children}
    </div>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-md">
      <h2 className="text-heading-4 font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function UniversalSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (use(searchParams).q ?? "").trim();
  const router = useRouter();
  const [page, setPage] = useState({ query, index: 0 });
  // Go back to the first page whenever the query changes.
  const pageIndex = page.query === query ? page.index : 0;

  if (!query) {
    return (
      <SearchMessage>
        <p className="text-paragraph-regular text-muted-foreground">
          Search for clients, referrals, or agents
        </p>
      </SearchMessage>
    );
  }

  // Results are paged as one list: referrals, then clients, then agents.
  const hits = [
    ...searchReferrals(query).map((row) => ({
      kind: "referral" as const,
      row,
    })),
    ...searchClients(query).map((row) => ({ kind: "client" as const, row })),
    ...searchAgents(query).map((row) => ({ kind: "agent" as const, row })),
  ];

  if (hits.length === 0) {
    return (
      <SearchMessage>
        <p className="text-paragraph-large font-normal text-foreground">
          No results found for &ldquo;{query}&rdquo;
        </p>
      </SearchMessage>
    );
  }

  const pageHits = hits.slice(
    pageIndex * PAGE_SIZE,
    (pageIndex + 1) * PAGE_SIZE
  );
  const referrals: ReferralRow[] = [];
  const clients: ClientRow[] = [];
  const agents: AgentListRow[] = [];
  for (const hit of pageHits) {
    if (hit.kind === "referral") referrals.push(hit.row);
    else if (hit.kind === "client") clients.push(hit.row);
    else agents.push(hit.row);
  }

  return (
    <div
      className="flex flex-col gap-xl"
      data-testid="universal-search-results"
    >
      {referrals.length > 0 ? (
        <ResultSection title="Client Referrals">
          <DataTable
            columns={referralColumns}
            data={referrals}
            highlightQuery={query}
            hideToolbar
            hidePagination
            initialColumnVisibility={{ attributes: false }}
            onRowClick={(row) => router.push(AGENT_DASH_REFERRAL(row.id))}
            testId="universal-search-referrals"
          />
        </ResultSection>
      ) : null}

      {clients.length > 0 ? (
        <ResultSection title="Clients">
          <DataTable
            columns={clientColumns}
            data={clients}
            highlightQuery={query}
            hideToolbar
            hidePagination
            onRowClick={(row) => router.push(AGENT_DASH_CLIENT(row.id))}
            testId="universal-search-clients"
          />
        </ResultSection>
      ) : null}

      {agents.length > 0 ? (
        <ResultSection title="Agents">
          <DataTable
            columns={agentColumns}
            data={agents}
            highlightQuery={query}
            hideToolbar
            hidePagination
            onRowClick={(row) => router.push(AGENT_DASH_AGENT(row.id))}
            testId="universal-search-agents"
          />
        </ResultSection>
      ) : null}

      <DataTablePagination
        pageIndex={pageIndex}
        pageCount={Math.ceil(hits.length / PAGE_SIZE)}
        pageSize={PAGE_SIZE}
        totalRows={hits.length}
        onPageChange={(index) => setPage({ query, index })}
      />
    </div>
  );
}
