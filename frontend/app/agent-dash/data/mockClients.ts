import {
  CURRENT_AGENT_ID,
  REFERRAL_ROWS,
  type ReferralRow,
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
};

export const CLIENT_STATUSES: ClientStatus[] = [
  "Referral Pending",
  "Referral Scheduled",
  "Eligible",
  "Not Eligible",
];

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

const DAY_MS = 86_400_000;

function makeClientRows(count = 38): ClientRow[] {
  const now = Date.UTC(2026, 2, 23);

  return Array.from({ length: count }, (_, index) => {
    const status = CLIENT_STATUSES[index % CLIENT_STATUSES.length];
    const recent = new Date(now - index * DAY_MS);

    return {
      id: String(index + 1),
      clientName: CLIENT_NAMES[index % CLIENT_NAMES.length],
      clientId: CLIENT_IDS[index % CLIENT_IDS.length],
      mostRecentReferral: recent.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      mostRecentReferralAt: recent.getTime(),
      status,
      statusDate:
        status === "Referral Scheduled"
          ? new Date(now - (index + 9) * DAY_MS).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : undefined,
      agentIds:
        index % 5 !== 4
          ? [CURRENT_AGENT_ID, "agent-taylor-lee"]
          : ["agent-jordan-lee"],
    };
  });
}

/** Mock clients for the agent dashboard Clients tab. */
export const CLIENT_ROWS = makeClientRows();

export function getClientRowById(id: string): ClientRow | undefined {
  return CLIENT_ROWS.find((row) => row.id === id);
}

export function getClientProfile(row: ClientRow): ClientProfile {
  const [firstName, ...rest] = row.clientName.split(" ");

  return {
    id: row.id,
    firstName,
    lastName: rest.join(" "),
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
  };
}

/** Referrals for a client, most recent first. */
export function getClientReferralHistory(row: ClientRow): ReferralRow[] {
  return REFERRAL_ROWS.filter(
    (referral) => referral.clientName === row.clientName
  ).sort((a, b) => b.createdAt - a.createdAt);
}
