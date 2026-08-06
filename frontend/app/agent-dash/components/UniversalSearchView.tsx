"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/common/components/data-display";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/common/components/ui/pagination";
import {
  AGENT_DASH_AGENT,
  AGENT_DASH_CLIENT,
  AGENT_DASH_REFERRAL,
} from "@/common/constants";

import { makeAgentRows, type AgentListRow } from "../data/mockAgents";
import { makeClientRows, type ClientRow } from "../data/mockClients";
import { makeReferralRows, type ReferralRow } from "../data/mockReferrals";
import { agentColumns } from "./agentColumns";
import { clientColumns } from "./clientColumns";
import { referralColumns } from "./referralColumns";

const PAGE_SIZE = 10;

type SearchHit =
  | { kind: "referral"; row: ReferralRow }
  | { kind: "client"; row: ClientRow }
  | { kind: "agent"; row: AgentListRow };

function matchesQuery(
  values: Array<string | number | undefined | null>,
  query: string
) {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(needle)
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  const maxVisible = 5;
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  pages.add(Math.max(1, current - 1));
  pages.add(Math.min(total, current + 1));

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) {
      result.push("...");
    }
    result.push(page);
  });
  return result;
}

function SearchResultsPagination({
  pageIndex,
  pageCount,
  totalResults,
  pageSize,
  onPageChange,
}: {
  pageIndex: number;
  pageCount: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
}) {
  const startRow = totalResults === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min(totalResults, (pageIndex + 1) * pageSize);
  const canPrevious = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  return (
    <div
      className="flex w-full items-center justify-between"
      data-testid="universal-search-pagination"
    >
      <p className="text-paragraph-small text-muted-foreground">
        {startRow} - {endRow} of {totalResults} results
      </p>
      <Pagination className="mx-0 w-fit justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={!canPrevious}
              onClick={() => {
                if (canPrevious) onPageChange(pageIndex - 1);
              }}
            />
          </PaginationItem>
          {getPageNumbers(pageIndex + 1, pageCount).map((page, i) =>
            page === "..." ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === pageIndex + 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              disabled={!canNext}
              onClick={() => {
                if (canNext) onPageChange(pageIndex + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function UniversalSearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const [pageIndex, setPageIndex] = useState(0);

  const [referrals] = useState(() => makeReferralRows());
  const [clients] = useState(() => makeClientRows());
  const [agents] = useState(() => makeAgentRows());

  const allHits = useMemo<SearchHit[]>(() => {
    if (!query) return [];

    const referralHits: SearchHit[] = referrals
      .filter((row) =>
        matchesQuery(
          [
            row.clientName,
            row.referralId,
            row.creationDate,
            row.status,
            row.statusDate,
            ...row.caseAgents.map(
              (agent) => `${agent.firstName} ${agent.lastName}`
            ),
          ],
          query
        )
      )
      .map((row) => ({ kind: "referral", row }));

    const clientHits: SearchHit[] = clients
      .filter((row) =>
        matchesQuery(
          [
            row.clientName,
            row.clientId,
            row.mostRecentReferral,
            row.status,
            row.statusDate,
          ],
          query
        )
      )
      .map((row) => ({ kind: "client", row }));

    const agentHits: SearchHit[] = agents
      .filter((row) =>
        matchesQuery(
          [
            row.agentName,
            row.agentId,
            row.role,
            row.email,
            String(row.pendingReferrals),
            String(row.scheduledReferrals),
            String(row.deliveredReferrals),
          ],
          query
        )
      )
      .map((row) => ({ kind: "agent", row }));

    return [...referralHits, ...clientHits, ...agentHits];
  }, [agents, clients, query, referrals]);

  const totalResults = allHits.length;
  const pageCount = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));

  useEffect(() => {
    setPageIndex(0);
  }, [query]);

  useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageIndex, pageCount]);

  const pageHits = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return allHits.slice(start, start + PAGE_SIZE);
  }, [allHits, pageIndex]);

  const pageReferrals = useMemo(
    () =>
      pageHits
        .filter((hit): hit is Extract<SearchHit, { kind: "referral" }> =>
          hit.kind === "referral"
        )
        .map((hit) => hit.row),
    [pageHits]
  );
  const pageClients = useMemo(
    () =>
      pageHits
        .filter((hit): hit is Extract<SearchHit, { kind: "client" }> =>
          hit.kind === "client"
        )
        .map((hit) => hit.row),
    [pageHits]
  );
  const pageAgents = useMemo(
    () =>
      pageHits
        .filter((hit): hit is Extract<SearchHit, { kind: "agent" }> =>
          hit.kind === "agent"
        )
        .map((hit) => hit.row),
    [pageHits]
  );

  const hasQuery = query.length > 0;
  const showEmpty = hasQuery && totalResults === 0;

  if (!hasQuery) {
    return (
      <div
        className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-border bg-background px-xl py-2xl text-center"
        data-testid="universal-search-idle"
      >
        <p className="text-paragraph-regular text-muted-foreground">
          Search for clients, referrals, or agents
        </p>
      </div>
    );
  }

  if (showEmpty) {
    return (
      <div
        className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-border bg-background px-xl py-2xl text-center"
        data-testid="universal-search-empty"
      >
        <p className="text-heading-3 font-semibold text-muted-foreground">
          No results found for &apos;{query}&apos;
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xl" data-testid="universal-search-results">
      {pageReferrals.length > 0 ? (
        <section className="flex flex-col gap-md">
          <h2 className="text-heading-4 font-semibold text-foreground">
            Client Referrals
          </h2>
          <DataTable
            columns={referralColumns}
            data={pageReferrals}
            globalFilter={query}
            hideToolbar
            hidePagination
            initialColumnVisibility={{ attributes: false }}
            pageSize={PAGE_SIZE}
            onRowClick={(row) => router.push(AGENT_DASH_REFERRAL(row.id))}
            testId="universal-search-referrals"
          />
        </section>
      ) : null}

      {pageClients.length > 0 ? (
        <section className="flex flex-col gap-md">
          <h2 className="text-heading-4 font-semibold text-foreground">
            Clients
          </h2>
          <DataTable
            columns={clientColumns}
            data={pageClients}
            globalFilter={query}
            hideToolbar
            hidePagination
            pageSize={PAGE_SIZE}
            onRowClick={(row) => router.push(AGENT_DASH_CLIENT(row.id))}
            testId="universal-search-clients"
          />
        </section>
      ) : null}

      {pageAgents.length > 0 ? (
        <section className="flex flex-col gap-md">
          <h2 className="text-heading-4 font-semibold text-foreground">
            Agents
          </h2>
          <DataTable
            columns={agentColumns}
            data={pageAgents}
            globalFilter={query}
            hideToolbar
            hidePagination
            pageSize={PAGE_SIZE}
            onRowClick={(row) => router.push(AGENT_DASH_AGENT(row.id))}
            testId="universal-search-agents"
          />
        </section>
      ) : null}

      <SearchResultsPagination
        pageIndex={pageIndex}
        pageCount={pageCount}
        totalResults={totalResults}
        pageSize={PAGE_SIZE}
        onPageChange={setPageIndex}
      />
    </div>
  );
}
