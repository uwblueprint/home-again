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
