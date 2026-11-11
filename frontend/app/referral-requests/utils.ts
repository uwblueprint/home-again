import type {
  ClientReferral,
  ReferralTab,
  ReviewFilter,
} from "./types";
import type { AgentRecord, Client, Referral } from "@/common/types";

const pad = (n: number) => String(n).padStart(2, "0");

/** MM/DD/YY (submitted) or MM/DD/YYYY (previous submission), matching the design. */
export function formatDate(iso?: string | null, fullYear = false): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const year = fullYear
    ? d.getUTCFullYear()
    : String(d.getUTCFullYear()).slice(-2);
  return `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}/${year}`;
}

export const unfulfillableMsg = (count: number) =>
  count > 0
    ? `${count} items that can't be fully fulfilled right now.`
    : undefined;

/**
 * Backend Referral (docs/SCHEMA.md) -> view model.
 * Nested client/agent shapes and stock/review data are assumptions - adjust
 * once the list endpoint's response is confirmed.
 */
export function toClientReferral(
  raw: Referral,
  clients: Client[],
  agents: AgentRecord[]
): ClientReferral {
  const tab: ReferralTab =
    raw.status === "declined"
      ? "rejected"
      : raw.status === "approved"
        ? "waitlisted"
        : "new";

  const toAgent = (id: string | null, role: "primary" | "secondary") => {
    const agent = id ? agents.find((item) => item.id === id) : undefined;
    return agent
      ? {
          firstName: agent.first_name,
          lastName: agent.last_name,
          role,
        }
      : null;
  };

  const client = clients.find((item) => item.id === raw.client_id);

  return {
    id: raw.id,
    tab,
    clientName: client ? `${client.first_name} ${client.last_name}` : "Client",
    referralId: raw.id,
    submittedAt: formatDate(raw.created_at),
    isPriority: Boolean(raw.is_priority),
    priorityDescription: raw.priority_description ?? undefined,
    agents: [
      toAgent(raw.agent_id, "primary"),
      toAgent(raw.secondary_agent_id, "secondary"),
    ].filter(Boolean) as ClientReferral["agents"],
    items: [],
    reviewStatus: tab === "waitlisted" ? "pending-review" : undefined,
  };
}

export function matchesQuery(r: ClientReferral, query: string) {
  const q = query.trim().toLowerCase();
  return !q || `${r.clientName} ${r.referralId}`.toLowerCase().includes(q);
}

export function matchesReviewFilter(r: ClientReferral, filter: ReviewFilter) {
  return filter === "all" || r.reviewStatus === filter;
}

function submissionTimestamp(value: string) {
  const [month, day, year] = value.split("/").map(Number);
  if (!month || !day || !year) return 0;
  return Date.UTC(year + (year < 70 ? 2000 : 1900), month - 1, day);
}

export function sortBySubmissionDate(
  referrals: ClientReferral[],
  descending: boolean
) {
  return [...referrals].sort((a, b) => {
    const difference =
      submissionTimestamp(a.submittedAt) - submissionTimestamp(b.submittedAt);
    return descending ? -difference : difference;
  });
}
