import {
  makeReferralRows,
  type CaseAgent,
  type ReferralRow,
  type ReferralStatus,
} from "./mockReferrals";

export type ReferralDetailField = {
  label: string;
  value: string;
};

export type FurnitureSelection = {
  name: string;
  specification?: string;
  quantity?: number;
  sizeTags?: string[];
};

export type CaseAgentDetails = CaseAgent & {
  email: string;
  phone: string;
};

export type ReferralDetails = {
  row: ReferralRow;
  client: {
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
    languages: string;
  };
  primaryAgent: CaseAgentDetails;
  secondaryAgent: CaseAgentDetails | null;
  referralInfo: {
    receivedFurnitureBefore: string;
    lastFurnitureReferralDate: string;
    reasonForRepeat: string;
    reasonForNewReferral: string;
    otherNotes: string;
    reasonForHighPriority: string | null;
  };
  furniture: FurnitureSelection[];
  delivery: {
    address: string;
    dateNeeded: string;
    city: string;
    postalCode: string;
    phone: string;
    moveInfo: string;
    notes: string;
    coordinatedAccessRequired: string;
  };
};

const ROWS = makeReferralRows();

function splitClientName(fullName: string) {
  const [firstName = "Jane", ...rest] = fullName.split(" ");
  return {
    firstName,
    lastName: rest.join(" ") || "Doe",
  };
}

function toAgentDetails(agent: CaseAgent): CaseAgentDetails {
  const email = `${agent.firstName.toLowerCase()}.${agent.lastName.toLowerCase()}@agency.com`;
  return {
    ...agent,
    email,
    phone: "(+) 1 647 123 4567",
  };
}

/** Look up a list row by id for navigation from the referrals table. */
export function getReferralRowById(id: string): ReferralRow | undefined {
  return ROWS.find((row) => row.id === id);
}

/** Build the read-only Referral Details payload for a row id. */
export function getReferralDetailsById(id: string): ReferralDetails | null {
  const row = getReferralRowById(id);
  if (!row) return null;

  const { firstName, lastName } = splitClientName(row.clientName);
  const primary =
    row.caseAgents.find((agent) => agent.role === "primary") ??
    row.caseAgents[0];
  const secondary =
    row.caseAgents.find((agent) => agent.role === "secondary") ?? null;

  return {
    row,
    client: {
      firstName,
      lastName,
      birthday: "08/03/98",
      gender: "Female",
      immigrationStatus: "Citizen",
      phone: "(+) 1 647 123 4567",
      phoneNotes:
        "Phone number belongs to relative, please take time to coordinate.",
      familyType: row.attributes.includes("single") ? "Single" : "Family",
      numAdults: row.attributes.includes("single") ? 1 : 2,
      numChildren: row.attributes.includes("single") ? 0 : 3,
      languages: "Portuguese, Greek",
    },
    primaryAgent: toAgentDetails(primary),
    secondaryAgent: secondary ? toAgentDetails(secondary) : null,
    referralInfo: {
      receivedFurnitureBefore: row.attributes.includes("repeat_referral")
        ? "Yes"
        : "No",
      lastFurnitureReferralDate: "22 March 2025",
      reasonForRepeat:
        "Got out of dangerous home situation. Has to move again.",
      reasonForNewReferral: "Low income, New to Community (Ontario)",
      otherNotes:
        "Phone number belongs to relative, please take time to coordinate.",
      reasonForHighPriority: row.isPriority ? "Moving in soon." : null,
    },
    furniture: [
      {
        name: "Sofa/Couch",
        specification: "Specification here",
        quantity: 1,
      },
      {
        name: "Mattress Only",
        sizeTags: ["(2) Twin", "(1) Double"],
      },
      {
        name: "Sofa/Couch",
        sizeTags: ["(1) Twin", "(1) Double"],
      },
      {
        name: "Metal Bed Frame",
        sizeTags: ["(2) TW/DB"],
      },
    ],
    delivery: {
      address: "123 Jane Street",
      dateNeeded: "DD/MM/YYYY",
      city: "Ottawa",
      postalCode: "L6C N2L",
      phone: "(+) 1 647 123 4567",
      moveInfo: "Stairs/ease, Adequate parking, Dog present",
      notes: "Notes and instructions described here",
      coordinatedAccessRequired: row.attributes.includes("coordinated_access")
        ? "Yes"
        : "No",
    },
  };
}

export type { ReferralStatus };
