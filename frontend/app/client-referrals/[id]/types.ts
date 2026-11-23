import type { RequestedItem } from "@/common/components/data-display/RequestedItemCard";

export type ReferralRequestPreview = {
  id: string;
  submittedAt: string;
  clientId: string;
  agentId: string | null;
  secondaryAgentId: string | null;
  isNew: boolean;
  isPriority: boolean;
  priorityDescription?: string;
  status: "pending-review" | "partially-reviewed" | "reviewed" | "rejected";
  items: (RequestedItem & { id: string })[];
};

export type ClientDetailsFormData = {
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

export type ClientDetailsErrors = Partial<
  Record<"firstName" | "lastName" | "birthday" | "familyType", string>
>;

export type DeliveryDetailsFormData = {
  address1: string;
  address2: string;
  city: string;
  postalCode: string;
  dateNeeded: string;
  notes: string;
  otherDetails: string;
  selectedMoves: Record<string, boolean>;
};

export type DeliveryDetailsErrors = Partial<Record<"otherDetails", string>>;
