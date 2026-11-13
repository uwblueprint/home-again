import type { Client, Referral, UpdateClientInput } from "@/common/types";
import type {
  ClientDetailsFormData,
  DeliveryDetailsFormData,
  ClientDetailsErrors,
  DeliveryDetailsErrors,
} from "@/app/referral-requests/[id]/types";

export const toClientForm = (client: Client): ClientDetailsFormData => ({
  firstName: client.first_name,
  lastName: client.last_name,
  birthday: client.birthday.slice(0, 10),
  gender: client.gender ?? "",
  immigrationStatus: client.immigration_status ?? "",
  firstLanguageNotEnglish: !client.speaks_english,
  languages: client.language ?? "",
  phone: client.phone ?? "",
  phoneNotes: client.phone_notes ?? "",
  familyType: client.family_type,
  numAdults: client.num_adults,
  numChildren: client.num_children,
});

export const toClientUpdate = (
  data: ClientDetailsFormData
): UpdateClientInput => ({
  gender: data.gender || null,
  immigration_status: data.immigrationStatus || null,
  speaks_english: !data.firstLanguageNotEnglish,
  language: data.firstLanguageNotEnglish ? data.languages || null : null,
  phone_notes: data.phoneNotes || null,
});

export const toDeliveryForm = (
  referral: Referral
): DeliveryDetailsFormData => ({
  address1: referral.address_line_1,
  address2: referral.address_line_2 ?? "",
  city: referral.city,
  postalCode: referral.postal_code ?? "",
  dateNeeded: referral.date_items_needed?.slice(0, 10) ?? "",
  notes: referral.notes_and_instructions ?? "",
  otherDetails: referral.move_other_info ?? "",
  selectedMoves: {
    staircases: !!referral.staircases,
    "narrow-passageways": !!referral.narrow_passageways,
    "adequate-parking": !!referral.adequate_parking,
    other: !!referral.move_other_info,
  },
});

export const toDeliveryUpdate = (data: DeliveryDetailsFormData) => ({
  notes_and_instructions: data.notes || null,
  staircases: !!data.selectedMoves.staircases,
  narrow_passageways: !!data.selectedMoves["narrow-passageways"],
  adequate_parking: !!data.selectedMoves["adequate-parking"],
  move_other_info: data.selectedMoves.other ? data.otherDetails || null : null,
});

export function validateClientDetails(
  data: ClientDetailsFormData
): ClientDetailsErrors {
  const errors: ClientDetailsErrors = {};
  if (!data.firstName.trim()) errors.firstName = "First name is required.";
  if (!data.lastName.trim()) errors.lastName = "Last name is required.";
  if (!data.birthday) errors.birthday = "Birthday is required.";
  if (!data.familyType) errors.familyType = "Family type is required.";
  return errors;
}

export function validateDeliveryDetails(
  data: DeliveryDetailsFormData
): DeliveryDetailsErrors {
  const errors: DeliveryDetailsErrors = {};
  if (data.selectedMoves.other && !data.otherDetails.trim())
    errors.otherDetails = "Enter additional move details.";
  return errors;
}
