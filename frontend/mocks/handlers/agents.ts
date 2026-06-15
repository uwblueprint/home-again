import { http, HttpResponse } from "msw";
import type { AgentRecord } from "@/common/types";

const BASE = process.env.NEXT_PUBLIC_API_URL;

// In-memory store for agents created during the session
const createdAgents = new Map<string, AgentRecord>();

export const agentsHandlers = [
  http.get(`${BASE}/agents`, () => {
    return HttpResponse.json(Array.from(createdAgents.values()));
  }),

  http.get(`${BASE}/agents/:id`, ({ params }) => {
    const id = params.id as string;
    const created = createdAgents.get(id);
    if (created) {
      return HttpResponse.json(created);
    }
    return HttpResponse.json({
      id,
      agency_id: "agency-001",
      supabase_user_id: null,
      phone_number: "613-555-0099",
      email: "agent@example.com",
      first_name: "Mock",
      last_name: "Agent",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    });
  }),

  http.post(`${BASE}/agents`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newAgent: AgentRecord = {
      id: `agent-${crypto.randomUUID().slice(0, 8)}`,
      agency_id: (body.agency_id as string) ?? "agency-001",
      supabase_user_id: (body.supabase_user_id as string) ?? null,
      phone_number: (body.phone_number as string) ?? null,
      email: (body.email as string) ?? null,
      first_name: (body.first_name as string) ?? "",
      last_name: (body.last_name as string) ?? "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    createdAgents.set(newAgent.id, newAgent);
    return HttpResponse.json(newAgent);
  }),

  http.delete(`${BASE}/agents/:id`, ({ params }) => {
    createdAgents.delete(params.id as string);
    return new HttpResponse(null, { status: 204 });
  }),
];
