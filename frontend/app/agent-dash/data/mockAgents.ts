import {
  CURRENT_AGENT_ID,
  isReferralAssignedToAgent,
  makeReferralRows,
  type ReferralRow,
  type ReferralStatus,
} from "./mockReferrals";

export type AgencyAgentRole = "Admin" | "Agent";

export type AgentListRow = {
  id: string;
  agentName: string;
  agentId: string;
  role: AgencyAgentRole;
  pendingReferrals: number;
  scheduledReferrals: number;
  deliveredReferrals: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type AgentDetails = AgentListRow;

const SEED_AGENTS: {
  firstName: string;
  lastName: string;
  agentId: string;
  role: AgencyAgentRole;
  id?: string;
}[] = [
  {
    id: CURRENT_AGENT_ID,
    firstName: "Wanyun",
    lastName: "Xue",
    agentId: "WCYIECNIE",
    role: "Agent",
  },
  {
    id: "agent-jane-doe",
    firstName: "Jane",
    lastName: "Doe",
    agentId: "CURNCEUI",
    role: "Admin",
  },
  {
    id: "agent-taylor-lee",
    firstName: "Taylor",
    lastName: "Lee",
    agentId: "TLR4K2LP",
    role: "Admin",
  },
  {
    id: "agent-jordan-lee",
    firstName: "Jordan",
    lastName: "Lee",
    agentId: "JRD7W1YD",
    role: "Agent",
  },
  {
    id: "agent-alex-morgan",
    firstName: "Alex",
    lastName: "Morgan",
    agentId: "ALX9K2LP",
    role: "Admin",
  },
  {
    id: "agent-sam-rivera",
    firstName: "Sam",
    lastName: "Rivera",
    agentId: "SMR4Q8HN",
    role: "Agent",
  },
  {
    id: "agent-casey-nguyen",
    firstName: "Casey",
    lastName: "Nguyen",
    agentId: "CSY2F6VK",
    role: "Agent",
  },
  {
    id: "agent-riley-chen",
    firstName: "Riley",
    lastName: "Chen",
    agentId: "RLY5J0XB",
    role: "Admin",
  },
  {
    id: "agent-morgan-blake",
    firstName: "Morgan",
    lastName: "Blake",
    agentId: "MRG8N3ZC",
    role: "Agent",
  },
  {
    id: "agent-parker-smith",
    firstName: "Parker",
    lastName: "Smith",
    agentId: "PRK1R7MA",
    role: "Admin",
  },
];

const EXTRA_NAMES = [
  ["Avery", "Patel"],
  ["Quinn", "Brooks"],
  ["Harper", "Nguyen"],
  ["Reese", "Kim"],
  ["Drew", "Santos"],
  ["Jamie", "Cole"],
  ["Cameron", "Wright"],
  ["Skyler", "Diaz"],
  ["Rowan", "Ali"],
  ["Finley", "Grant"],
  ["Emerson", "Park"],
  ["Hayden", "Singh"],
  ["Peyton", "Walsh"],
];

function buildAgentDirectory(): Omit<
  AgentListRow,
  "pendingReferrals" | "scheduledReferrals" | "deliveredReferrals"
>[] {
  const seeded = SEED_AGENTS.map((agent) => ({
    id: agent.id ?? `agent-${agent.agentId.toLowerCase()}`,
    agentName: `${agent.firstName} ${agent.lastName}`,
    agentId: agent.agentId,
    role: agent.role,
    firstName: agent.firstName,
    lastName: agent.lastName,
    email: `${agent.firstName.toLowerCase()}.${agent.lastName.toLowerCase()}@agency.com`,
    phone: "(+1) 647 123 4567",
  }));

  // Pad toward mockup totals: ~15 admins, ~10 agents.
  const extras = EXTRA_NAMES.map(([firstName, lastName], index) => {
    const role: AgencyAgentRole = index < 10 ? "Admin" : "Agent";
    const agentId = `XTR${String(index + 1).padStart(5, "0")}`;
    return {
      id: `agent-extra-${index + 1}`,
      agentName: `${firstName} ${lastName}`,
      agentId,
      role,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@agency.com`,
      phone: "(+1) 647 123 4567",
    };
  });

  return [...seeded, ...extras];
}

const AGENT_DIRECTORY = buildAgentDirectory();

function countByStatus(
  referrals: ReferralRow[],
  status: ReferralStatus
): number {
  return referrals.filter((referral) => referral.status === status).length;
}

function withReferralCounts(
  agent: (typeof AGENT_DIRECTORY)[number],
  referrals: ReferralRow[]
): AgentListRow {
  const assigned = referrals.filter((referral) =>
    isReferralAssignedToAgent(referral, agent.id)
  );

  return {
    ...agent,
    pendingReferrals: countByStatus(assigned, "Pending"),
    scheduledReferrals: countByStatus(assigned, "Scheduled"),
    deliveredReferrals: countByStatus(assigned, "Delivered"),
  };
}

/** Mock agents for the agent dashboard Agents tab. */
export function makeAgentRows(): AgentListRow[] {
  const referrals = makeReferralRows();
  return AGENT_DIRECTORY.map((agent) => withReferralCounts(agent, referrals));
}

export function getAgentById(id: string): AgentDetails | null {
  const row = makeAgentRows().find((agent) => agent.id === id);
  return row ?? null;
}

/** Referrals associated with an agent, sorted most recent first. */
export function getAssociatedReferralsForAgent(agentId: string): ReferralRow[] {
  return makeReferralRows()
    .filter((referral) => isReferralAssignedToAgent(referral, agentId))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export const AGENT_ROLES: AgencyAgentRole[] = ["Admin", "Agent"];

export const AGENT_ROLE_PILLS: {
  value: "all" | AgencyAgentRole;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "Admin", label: "Admin" },
  { value: "Agent", label: "Agent" },
];
