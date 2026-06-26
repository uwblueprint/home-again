import type { AgentRecord } from "@/common/types";

export const agents: AgentRecord[] = [
  {
    id: "agent-001",
    agency_id: "agency-001",
    supabase_user_id: null,
    first_name: "John",
    last_name: "Doe",
    email: "john@agency.com",
    phone_number: "(+1) 647 123 4567",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-06-01T14:30:00Z",
  },
  {
    id: "agent-002",
    agency_id: "agency-002",
    supabase_user_id: null,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@agency.org",
    phone_number: "613-555-0201",
    created_at: "2024-02-20T11:00:00Z",
    updated_at: "2024-05-18T09:15:00Z",
  },
  {
    id: "agent-003",
    agency_id: "agency-002",
    supabase_user_id: null,
    first_name: "Mark",
    last_name: "Johnson",
    email: "mark.j@community-services.ca",
    phone_number: "613-555-0305",
    created_at: "2024-03-10T08:30:00Z",
    updated_at: "2024-07-22T16:45:00Z",
  },
];
