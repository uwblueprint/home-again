export type ReferralStatus =
  | "Pending"
  | "Delivered"
  | "Scheduled"
  | "Rejected";

export type ReferralAttribute =
  | "priority"
  | "has_secondary_agent"
  | "family"
  | "single"
  | "repeat_referral"
  | "agent_needs_to_be_present"
  | "coordinated_access";

export type CaseAgent = {
  id: string;
  firstName: string;
  lastName: string;
  role: "primary" | "secondary";
};

export type ReferralRow = {
  id: string;
  clientName: string;
  referralId: string;
  caseAgents: CaseAgent[];
  creationDate: string;
  createdAt: number;
  status: ReferralStatus;
  statusDate?: string;
  isPriority: boolean;
  attributes: ReferralAttribute[];
};

/** Logged-in agent stub id used by mock data and the auth gate. */
export const CURRENT_AGENT_ID = "agent-wanyun-xue";

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

const REFERRAL_IDS = [
  "WCYIECME",
  "SFSCXYUES",
  "AXT9K2LP",
  "BRM4Q8HN",
  "CPL7W1YD",
  "DQS2F6VK",
  "ETU5J0XB",
  "FVH8N3ZC",
];

const CURRENT_AGENT: CaseAgent = {
  id: CURRENT_AGENT_ID,
  firstName: "Wanyun",
  lastName: "Xue",
  role: "primary",
};

const OTHER_PRIMARY: CaseAgent = {
  id: "agent-jordan-lee",
  firstName: "Jordan",
  lastName: "Lee",
  role: "primary",
};

const SECONDARY_AGENTS: CaseAgent[] = [
  {
    id: "agent-taylor-lee",
    firstName: "Taylor",
    lastName: "Lee",
    role: "secondary",
  },
  {
    id: "agent-alex-morgan",
    firstName: "Alex",
    lastName: "Morgan",
    role: "secondary",
  },
  {
    id: "agent-sam-rivera",
    firstName: "Sam",
    lastName: "Rivera",
    role: "secondary",
  },
];

/** True when the signed-in agent is primary or secondary on the referral. */
export function isReferralAssignedToAgent(
  row: ReferralRow,
  agentId: string | undefined
): boolean {
  if (!agentId) return false;
  return row.caseAgents.some((agent) => agent.id === agentId);
}

function formatCreationDate(date: Date) {
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

function buildAttributes(
  status: ReferralStatus,
  isPriority: boolean,
  hasSecondary: boolean,
  index: number
): ReferralAttribute[] {
  const attributes: ReferralAttribute[] = [];
  if (isPriority) attributes.push("priority");
  if (hasSecondary) attributes.push("has_secondary_agent");
  if (index % 3 === 0) attributes.push("family");
  if (index % 3 === 1) attributes.push("single");
  if (index % 5 === 0) attributes.push("repeat_referral");
  if (index % 4 === 0) attributes.push("agent_needs_to_be_present");
  if (index % 6 === 0) attributes.push("coordinated_access");
  // Pending referrals never show as priority in the table.
  if (status === "Pending") {
    return attributes.filter((attribute) => attribute !== "priority");
  }
  return attributes;
}

/** Mock referral rows shaped for the agent dashboard Client Referrals view. */
export function makeReferralRows(): ReferralRow[] {
  const now = Date.UTC(2025, 2, 23);
  const statusPlan: ReferralStatus[] = [
    ...Array.from({ length: 15 }, () => "Pending" as const),
    ...Array.from({ length: 10 }, () => "Delivered" as const),
    ...Array.from({ length: 9 }, () => "Scheduled" as const),
    ...Array.from({ length: 4 }, () => "Rejected" as const),
  ];

  return statusPlan.map((status, index) => {
    const hasSecondary = index % 3 !== 1;
    const isPriority = status !== "Pending" && index % 4 === 0;
    const created = new Date(now - index * 86_400_000);
    const statusDate =
      status === "Delivered" || status === "Scheduled"
        ? formatStatusDate(new Date(now - (index + 8) * 86_400_000))
        : undefined;

    // Most referrals belong to the signed-in agent; a subset are other agents only.
    const assignedToCurrentAgent = index % 6 !== 5;
    const caseAgents: CaseAgent[] = [
      assignedToCurrentAgent ? CURRENT_AGENT : OTHER_PRIMARY,
    ];
    if (hasSecondary) {
      caseAgents.push(SECONDARY_AGENTS[index % SECONDARY_AGENTS.length]);
    }

    return {
      id: String(index + 1),
      clientName: CLIENT_NAMES[index % CLIENT_NAMES.length],
      referralId: REFERRAL_IDS[index % REFERRAL_IDS.length],
      caseAgents,
      creationDate: formatCreationDate(created),
      createdAt: created.getTime(),
      status,
      statusDate,
      isPriority,
      attributes: buildAttributes(status, isPriority, hasSecondary, index),
    };
  });
}

export const REFERRAL_ATTRIBUTE_OPTIONS: {
  label: string;
  value: ReferralAttribute;
}[] = [
  { label: "Priority", value: "priority" },
  { label: "Has secondary agent", value: "has_secondary_agent" },
  { label: "Family", value: "family" },
  { label: "Single", value: "single" },
  { label: "Repeat Referral", value: "repeat_referral" },
  { label: "Agent needs to be present", value: "agent_needs_to_be_present" },
  { label: "Coordinated Access", value: "coordinated_access" },
];

export const REFERRAL_STATUSES: ReferralStatus[] = [
  "Pending",
  "Delivered",
  "Scheduled",
  "Rejected",
];
