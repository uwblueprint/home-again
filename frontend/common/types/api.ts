/**
 * API mutation payload types — one type per API mutation.
 * Used when creating or updating resources via the backend.
 */

export interface CreateAgencyInput {
  name: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  postal_code: string;
  phone_number: string;
  program?: string | null;
}

export interface UpdateAgencyInput {
  name?: string;
  address_line_1?: string;
  address_line_2?: string | null;
  city?: string;
  postal_code?: string | null;
  phone_number?: string;
  program?: string | null;
}

export interface CreateAgentInput {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  agency_id: string;
  is_admin?: boolean;
  supabase_user_id?: string | null;
}

export interface CreateDonorInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface CreateClientInput {
  first_name: string;
  last_name: string;
  birthday: string;
  gender?: string | null;
  phone?: string | null;
  phone_notes?: string | null;
  speaks_english?: boolean;
  language?: string | null;
  family_type: string;
  num_children: number;
  num_adults: number;
  coordinated_access_required?: boolean;
  agency_id?: string | null;
  immigration_status?: string | null;
}

export type UpdateClientInput = Partial<CreateClientInput>;

export interface CreateReferralInput {
  client_id: string;
  requested_items: unknown[];
  agent_id?: string | null;
  secondary_agent_id?: string | null;
  agents_present_during_delivery?: boolean | null;
  program?: string | null;
  is_priority?: boolean;
  priority_description?: string | null;
  reason_low_income?: boolean;
  reason_exiting_homelessness?: boolean;
  reason_new_to_community?: boolean;
  previous_city_town_country?: string | null;
  reason_escaping_abuse?: boolean;
  reason_mental_health?: boolean;
  reason_exiting_prison?: boolean;
  reason_physical_disability?: boolean;
  reason_health_issues?: boolean;
  reason_other?: boolean;
  reason_other_info?: string | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  postal_code?: string | null;
  date_items_needed?: string | null;
  staircases?: boolean | null;
  narrow_passageways?: boolean | null;
  adequate_parking?: boolean | null;
  move_other_info?: string | null;
  notes_and_instructions?: string | null;
  status: "pending" | "approved" | "completed" | "declined";
}
