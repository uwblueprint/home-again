/**
 * Domain entity types — mirror FastAPI backend schemas exactly.
 * Update when the API schema changes.
 */

export interface Admin {
  id: string;
  supabase_user_id: string | null;
  phone_number: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface AgencyRecord {
  id: string;
  name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  postal_code: string | null;
  main_agent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentRecord {
  id: string;
  agency_id: string;
  supabase_user_id: string | null;
  phone_number: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  date: string;
  pickup_furniture_ids: string | null;
  dropoff_furniture_ids: string | null;
  created_at: string;
  updated_at: string;
}

export interface Donor {
  id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  smoking_household: boolean | null;
  donation_type: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string;
  gender: string | null;
  phone: string | null;
  phone_notes: string | null;
  speaks_english: boolean;
  language: string | null;
  family_type: string;
  num_children: number;
  num_adults: number;
  coordinated_access_required: boolean;
  agency_id: string | null;
  immigration_status: string | null;
  created_at: string;
  updated_at: string;
}

export type FurnitureStatus =
  | "PICKUP_PENDING"
  | "APPROVED"
  | "OFFERED"
  | "SCHEDULED"
  | "DELIVERED"
  | "CLOSED";

export interface Furniture {
  id: string;
  name: string;
  status: FurnitureStatus;
  image_url: string | null;
  description: string | null;
  date_donated: string | null;
  date_received: string | null;
  address_pickup: string | null;
  address_dropoff: string | null;
  client_id: string | null;
  change_log: string | null;
  route_id: string | null;
  condition: string | null;
  colour: string | null;
  donor_id: string;
  category: string | null;
  quantity: number;
  smoking_household: boolean | null;
  donation_type: string | null;
  charitable_receipt_estimate: number | null;
  cash_cheque_amount: number | null;
  cash_cheque_note: string | null;
  admin_note: string | null;
  picked_up_or_dropped_off: string | null;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  client_id: string;
  requested_items: unknown[];
  agent_id: string | null;
  secondary_agent_id: string | null;
  agents_present_during_delivery: boolean | null;
  program: string | null;
  is_priority: boolean;
  priority_description: string | null;
  reason_low_income: boolean;
  reason_exiting_homelessness: boolean;
  reason_new_to_community: boolean;
  previous_city_town_country: string | null;
  reason_escaping_abuse: boolean;
  reason_mental_health: boolean;
  reason_exiting_prison: boolean;
  reason_physical_disability: boolean;
  reason_health_issues: boolean;
  reason_other: boolean;
  reason_other_info: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  postal_code: string | null;
  date_items_needed: string | null;
  staircases: boolean | null;
  narrow_passageways: boolean | null;
  adequate_parking: boolean | null;
  move_other_info: string | null;
  notes_and_instructions: string | null;
  status: "pending" | "approved" | "completed" | "declined";
  created_at: string;
  updated_at: string;
}
