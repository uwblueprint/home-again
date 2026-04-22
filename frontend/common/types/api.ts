/**
 * API mutation payload types — one type per API mutation.
 * Used when creating or updating resources via the backend.
 */

export interface CreateAgencyInput {
  name: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  postal_code?: string | null;
  phone: string;
  main_agent_id?: string | null;
}

export interface UpdateAgencyInput {
  name?: string;
  address_line_1?: string;
  address_line_2?: string | null;
  city?: string;
  postal_code?: string | null;
  phone?: string;
  main_agent_id?: string | null;
}

export interface CreateAgentInput {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
  agency_id: string;
  supabase_user_id?: string | null;
}

export interface CreateDonorInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}
