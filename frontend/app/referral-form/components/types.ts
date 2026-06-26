// Mirrors backend GenderEnum (backend/app/enums.py)
export const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

// Mirrors backend ImmigrationStatusEnum
export const IMMIGRATION_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "PR", label: "PR" },
  { value: "Refugee", label: "Refugee" },
  { value: "Canadian citizen", label: "Canadian citizen" },
];

// Mirrors backend FamilyTypeEnum
export const FAMILY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "family", label: "Family" },
];

export type ClientData = {
  firstName: string;
  lastName: string;
  birthday: string;
  gender: string;
  immigrationStatus: string;
  firstLanguageNotEnglish: boolean;
  languages: string;
  phone: string;
  phoneNotes: string;
  familyType: string;
  numAdults: number;
  numChildren: number;
};

export const EMPTY_CLIENT_DATA: ClientData = {
  firstName: "",
  lastName: "",
  birthday: "",
  gender: "",
  immigrationStatus: "",
  firstLanguageNotEnglish: false,
  languages: "",
  phone: "",
  phoneNotes: "",
  familyType: "",
  numAdults: 0,
  numChildren: 0,
};

export type ReferralReasonId =
  | "low-income"
  | "exiting-homelessness"
  | "escaping-abuse"
  | "mental-health-issues"
  | "exiting-prison"
  | "physical-disabilities"
  | "health-issues"
  | "new-to-community"
  | "others";

export type ReferralData = {
  hasReceivedFurnitureBefore: boolean;
  lastFurnitureReferralDate: string;
  reasonForRepeatReferral: string;
  reasons: Record<ReferralReasonId, boolean>;
  newToCommunityDetails: string;
  otherReasonDetails: string;
  isHighPriority: boolean;
  highPriorityReason: string;
};

export const REFERRAL_REASONS: { id: ReferralReasonId; label: string }[] = [
  { id: "low-income", label: "Low income" },
  { id: "exiting-homelessness", label: "Exiting homelessness" },
  { id: "escaping-abuse", label: "Escaping abuse" },
  { id: "mental-health-issues", label: "Mental health issues" },
  { id: "exiting-prison", label: "Exiting prison" },
  { id: "physical-disabilities", label: "Physical disabilities" },
  { id: "health-issues", label: "Health issues" },
  { id: "new-to-community", label: "New to community" },
  { id: "others", label: "Others" },
];

export const EMPTY_REFERRAL_DATA: ReferralData = {
  hasReceivedFurnitureBefore: false,
  lastFurnitureReferralDate: "",
  reasonForRepeatReferral: "",
  reasons: Object.fromEntries(
    REFERRAL_REASONS.map((reason) => [reason.id, false])
  ) as Record<ReferralReasonId, boolean>,
  newToCommunityDetails: "",
  otherReasonDetails: "",
  isHighPriority: false,
  highPriorityReason: "",
};

export type AgentData = {
  secondaryAgentId: string | null;
  agentNeedsToBePresent: boolean;
  programSearch: string;
};

export const EMPTY_AGENT_DATA: AgentData = {
  secondaryAgentId: null,
  agentNeedsToBePresent: false,
  programSearch: "",
};

export const AGREEMENT_TERMS: { id: string; label: string }[] = [
  {
    id: "consent-to-share",
    label:
      "The above information is correct and gives consent for this information to be shared with other organizations for the purpose of statistics and funding opportunities.",
  },
  {
    id: "once-a-year",
    label:
      "In an effort to meet the needs of all of our clients, and excepting in emergency situations, Home Again limits the number of referrals to the furniture bank to once a year/client.",
  },
  {
    id: "no-guarantee",
    label: "Home Again cannot guarantee all items requested will be available.",
  },
  {
    id: "no-return-visits",
    label:
      "If the client is not satisfied with any items provided, they must say so at time of delivery, and Home Again volunteers will remove the item(s). Return visits to remove unwanted items are not possible.",
  },
  {
    id: "no-charge",
    label:
      "Home Again does not charge our clients for furniture or delivery, however cash donations are accepted to help continue serving others.",
  },
  {
    id: "winter-access",
    label:
      "Please note that in the winter months we ask that all driveways/walkways be cleared of ice and snow so their items can be safely delivered.",
  },
];

export type AgreementsData = Record<string, boolean>;

export const EMPTY_AGREEMENTS_DATA: AgreementsData = Object.fromEntries(
  AGREEMENT_TERMS.map((term) => [term.id, false])
);
