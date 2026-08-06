import {
  CURRENT_AGENT_ID,
  makeReferralRows,
  type CaseAgent,
  type ReferralStatus,
} from "./mockReferrals";

export type ClientStatus =
  | "Referral Pending"
  | "Referral Scheduled"
  | "Eligible"
  | "Not Eligible";

export type ClientRow = {
  id: string;
  clientName: string;
  clientId: string;
  mostRecentReferral: string;
  mostRecentReferralAt: number;
  status: ClientStatus;
  statusDate?: string;
  agentIds: string[];
};

export type ClientProfile = {
  id: string;
  firstName: string;
  lastName: string;
  birthday: string;
  gender: string;
  immigrationStatus: string;
  phone: string;
  phoneNotes: string;
  familyType: string;
  numAdults: number;
  numChildren: number;
  coordinatedAccess: string;
  clientId: string;
  agentIds: string[];
};

export type ClientReferralHistoryItem = {
  id: string;
  referralId: string;
  caseAgents: CaseAgent[];
  completionDate: string | null;
  status: ReferralStatus;
  createdAt: number;
};

const CLIENT_NAMES = [
  "Jane Doe",
  "Alex Morgan",
  "Sam Rivera",
  "Taylor Brooks",
  "Jordan Lee",
  "Casey Nguyen",
  "Riley Chen",
  "Morgan Blake",
];

const CLIENT_IDS = [
  "WCYIECNIE",
  "AXT9K2LPQ",
  "BRM4Q8HNM",
  "CPL7W1YDK",
  "DQS2F6VKR",
  "ETU5J0XBS",
  "FVH8N3ZCT",
  "GWK1R7MAU",
];

const STATUS_CYCLE: ClientStatus[] = [
  "Referral Pending",
  "Referral Scheduled",
  "Eligible",
  "Not Eligible",
  "Referral Pending",
  "Referral Scheduled",
  "Eligible",
  "Referral Pending",
];

const HISTORY_AGENTS: CaseAgent[] = [
  {
    id: CURRENT_AGENT_ID,
    firstName: "Wanyun",
    lastName: "Xue",
    role: "primary",
  },
  {
    id: "agent-taylor-lee",
    firstName: "Taylor",
    lastName: "Lee",
    role: "secondary",
  },
];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatStatusDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Mock clients for the agent dashboard Clients tab. */
export function makeClientRows(count = 38): ClientRow[] {
  const now = Date.UTC(2026, 2, 23);

  return Array.from({ length: count }, (_, index) => {
    const status = STATUS_CYCLE[index % STATUS_CYCLE.length];
    const recent = new Date(now - index * 86_400_000);
    const assignedToCurrent = index % 5 !== 4;

    return {
      id: String(index + 1),
      clientName: CLIENT_NAMES[index % CLIENT_NAMES.length],
      clientId: CLIENT_IDS[index % CLIENT_IDS.length],
      mostRecentReferral: formatDate(recent),
      mostRecentReferralAt: recent.getTime(),
      status,
      statusDate:
        status === "Referral Scheduled"
          ? formatStatusDate(new Date(now - (index + 9) * 86_400_000))
          : undefined,
      agentIds: assignedToCurrent
        ? [CURRENT_AGENT_ID, "agent-taylor-lee"]
        : ["agent-jordan-lee"],
    };
  });
}

export function isClientAssignedToAgent(
  row: ClientRow,
  agentId: string | undefined
): boolean {
  if (!agentId) return false;
  return row.agentIds.includes(agentId);
}

export function getClientRowById(id: string): ClientRow | undefined {
  return makeClientRows().find((row) => row.id === id);
}

export function getClientProfileById(id: string): ClientProfile | null {
  const row = getClientRowById(id);
  if (!row) return null;

  const [firstName = "Jane", ...rest] = row.clientName.split(" ");
  const lastName = rest.join(" ") || "Doe";

  return {
    id: row.id,
    firstName,
    lastName,
    birthday: "06/05/98",
    gender: "Female",
    immigrationStatus: "Citizen",
    phone: "(+1) 647 123 4567",
    phoneNotes:
      "Phone number belongs to relative, please take time to coordinate.",
    familyType: "Family",
    numAdults: 2,
    numChildren: 3,
    coordinatedAccess: "Required",
    clientId: row.clientId,
    agentIds: row.agentIds,
  };
}

function completionDateForStatus(
  status: ReferralStatus,
  creationDate: string
): string | null {
  if (status === "Pending" || status === "Scheduled") return null;
  return creationDate;
}

/** Referral history for a client, sorted most recent first. */
export function getClientReferralHistory(
  clientId: string
): ClientReferralHistoryItem[] {
  const row = getClientRowById(clientId);
  if (!row) return [];

  const matching = makeReferralRows()
    .filter((referral) => referral.clientName === row.clientName)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (matching.length > 0) {
    return matching.map((referral) => ({
      id: referral.id,
      referralId: referral.referralId,
      caseAgents: referral.caseAgents,
      completionDate: completionDateForStatus(
        referral.status,
        referral.creationDate
      ),
      status: referral.status,
      createdAt: referral.createdAt,
    }));
  }

  const base = row.mostRecentReferralAt;

  return [
    {
      id: "1",
      referralId: "SDCRFVRFSD",
      caseAgents: HISTORY_AGENTS,
      completionDate: null,
      status: "Pending",
      createdAt: base,
    },
    {
      id: "2",
      referralId: "FECRFVRVFVF",
      caseAgents: HISTORY_AGENTS,
      completionDate: "31 March 2024",
      status: "Rejected",
      createdAt: base - 7 * 86_400_000,
    },
  ].sort((a, b) => b.createdAt - a.createdAt);
}

export const CLIENT_STATUSES: ClientStatus[] = [
  "Referral Pending",
  "Referral Scheduled",
  "Eligible",
  "Not Eligible",
];

export const CLIENT_STATUS_PILLS: {
  value: "all" | "Pending" | "Scheduled" | "Eligible" | "Not Eligible";
  status?: ClientStatus;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "Pending", status: "Referral Pending", label: "Pending" },
  { value: "Scheduled", status: "Referral Scheduled", label: "Scheduled" },
  { value: "Eligible", status: "Eligible", label: "Eligible" },
  { value: "Not Eligible", status: "Not Eligible", label: "Not Eligible" },
];

export const CLIENT_FILTER_OPTIONS = [
  { label: "Family", value: "family" },
  { label: "Single", value: "single" },
  { label: "Coordinated Access", value: "coordinated_access" },
  { label: "Has phone notes", value: "phone_notes" },
];
