/**
 * Common Types
 *
 * Core data types shared across the application.
 * These should match the FastAPI backend schemas exactly.
 * Auth is handled by Supabase; Admin/Agent link via supabase_user_id.
 */

import type { ReactNode } from "react";

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

export interface Agency {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  description: string | null;
  status: string | null; // unprocessed, approved, deactivated
  require_pre_payment: boolean;
  billing_profiles: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  agency_id: string;
  supabase_user_id: string | null;
  phone_number: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  alternate_phone: string | null;
  extension: string | null;
  location: string | null;
  status: string | null; // active, inactive
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
  email: string | null;
  phone: string | null;
  address: string;
  apartment_unit: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  agency_id: string | null;
  birthday: string | null;
  gender: string | null;
  phone_notes: string | null;
  family_type: string | null;
  num_children: number;
  num_adults: number;
  has_received_furniture_before: boolean | null;
  previous_referral_date: string | null;
  previous_referral_reason: string | null;
  additional_support_required: boolean;
  agency_referred_id: string | null;
  pending_delivery: boolean;
  last_delivery_date: string | null;
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
  dispatch_id: string | null;
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
  agency_id: string;
  status: "pending" | "approved" | "completed" | "declined";
  requested_items: unknown[]; // JSON array of furniture item requests
  dispatch_required: boolean | null;
  referral_date: string | null;
  is_priority: boolean;
  contact_in_case_of_cancellation: boolean;
  coordinated_access_required: boolean;
  date_items_needed: string | null;
  related_to_move: boolean | null;
  staircases: boolean | null;
  narrow_passageways: boolean | null;
  adequate_parking: boolean | null;
  move_other_info: string | null;
  reason_low_income: boolean;
  reason_exiting_homelessness: boolean;
  reason_new_to_community: boolean;
  reason_escaping_abuse: boolean;
  reason_mental_health: boolean;
  reason_exiting_prison: boolean;
  reason_physical_disability: boolean;
  reason_health_issues: boolean;
  reason_other: boolean;
  reason_other_info: string | null;
  secondary_agent_name: string | null;
  secondary_agent_email: string | null;
  secondary_agent_phone: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * ResourceList Component Types
 *
 * Defines interfaces for a reusable list component that can display
 * any resource (agencies, clients, donors, etc.)
 */

export type ColumnType = "text" | "email" | "phone" | "status" | "date";

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  type?: ColumnType;
  width?: string;
  render?: (value: unknown, row: T) => ReactNode;
}

export interface RowActionConfig<T> {
  id: string;
  label: string;
  icon?: string;
  className?: string;
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
}

export interface ResourceListProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  loading: boolean;
  error?: Error | null;
  rowActions: RowActionConfig<T>[];
  emptyStateMessage?: string;
  testId?: string;
}

export interface CellRendererProps<T> {
  column: ColumnConfig<T>;
  row: T;
  value: unknown;
}

export interface ResourceListSkeletonProps<T = unknown> {
  columns: ColumnConfig<T>[];
  hasActions: boolean;
}
