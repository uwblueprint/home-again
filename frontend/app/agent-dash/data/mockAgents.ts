import {
  isReferralAssignedToAgent,
  REFERRAL_ROWS,
  type ReferralRow,
} from "./mockReferrals";

export type AgencyAgentRole = "Admin" | "Agent";

export const AGENT_ROLES: AgencyAgentRole[] = ["Admin", "Agent"];

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

// [firstName, lastName, agentId, role]. Ids are `agent-first-last`, so the
// first few line up with the case agents in mockReferrals.
const AGENTS: [string, string, string, AgencyAgentRole][] = [
  ["Wanyun", "Xue", "WCYIECNIE", "Agent"],
  ["Jane", "Doe", "CURNCEUI", "Admin"],
  ["Taylor", "Lee", "TLR4K2LP", "Admin"],
  ["Jordan", "Lee", "JRD7W1YD", "Agent"],
  ["Alex", "Morgan", "ALX9K2LP", "Admin"],
  ["Sam", "Rivera", "SMR4Q8HN", "Agent"],
  ["Casey", "Nguyen", "CSY2F6VK", "Agent"],
  ["Riley", "Chen", "RLY5J0XB", "Admin"],
  ["Morgan", "Blake", "MRG8N3ZC", "Agent"],
  ["Parker", "Smith", "PRK1R7MA", "Admin"],
  ["Avery", "Patel", "XTR00001", "Admin"],
  ["Quinn", "Brooks", "XTR00002", "Admin"],
  ["Harper", "Nguyen", "XTR00003", "Admin"],
  ["Reese", "Kim", "XTR00004", "Admin"],
  ["Drew", "Santos", "XTR00005", "Admin"],
  ["Jamie", "Cole", "XTR00006", "Admin"],
  ["Cameron", "Wright", "XTR00007", "Admin"],
  ["Skyler", "Diaz", "XTR00008", "Admin"],
  ["Rowan", "Ali", "XTR00009", "Admin"],
  ["Finley", "Grant", "XTR00010", "Admin"],
  ["Emerson", "Park", "XTR00011", "Agent"],
  ["Hayden", "Singh", "XTR00012", "Agent"],
  ["Peyton", "Walsh", "XTR00013", "Agent"],
];

/** Mock agents for the agent dashboard Agents tab. */
export const AGENT_ROWS: AgentListRow[] = AGENTS.map(
  ([firstName, lastName, agentId, role]) => {
    const id = `agent-${firstName}-${lastName}`.toLowerCase();
    const assigned = getAssociatedReferrals(id);
    const countOf = (status: ReferralRow["status"]) =>
      assigned.filter((referral) => referral.status === status).length;

    return {
      id,
      agentName: `${firstName} ${lastName}`,
      agentId,
      role,
      pendingReferrals: countOf("Pending"),
      scheduledReferrals: countOf("Scheduled"),
      deliveredReferrals: countOf("Delivered"),
      firstName,
      lastName,
      email: `${firstName}.${lastName}@agency.com`.toLowerCase(),
      phone: "(+1) 647 123 4567",
    };
  }
);

export function getAgentById(id: string): AgentListRow | undefined {
  return AGENT_ROWS.find((agent) => agent.id === id);
}

/** Referrals an agent is primary or secondary on, most recent first. */
export function getAssociatedReferrals(agentId: string): ReferralRow[] {
  return REFERRAL_ROWS.filter((referral) =>
    isReferralAssignedToAgent(referral, agentId)
  ).sort((a, b) => b.createdAt - a.createdAt);
}
