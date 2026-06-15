import { http, HttpResponse } from "msw";
import { agencies } from "../fixtures/agencies";
import type { AgencyRecord } from "@/common/types";

const BASE = process.env.NEXT_PUBLIC_API_URL;

// In-memory store for agencies created/updated during the session
const createdAgencies = new Map<string, AgencyRecord>();

export const agenciesHandlers = [
  http.get(`${BASE}/agencies`, () => {
    return HttpResponse.json([
      ...agencies,
      ...Array.from(createdAgencies.values()),
    ]);
  }),

  http.get(`${BASE}/agencies/:id`, ({ params }) => {
    const id = params.id as string;
    // Check session-created agencies first
    const created = createdAgencies.get(id);
    if (created) {
      return HttpResponse.json(created);
    }
    const agency = agencies.find((a) => a.id === id);
    if (agency) {
      return HttpResponse.json(agency);
    }
    // Fallback for unknown IDs
    return HttpResponse.json({
      ...agencies[0],
      id,
    });
  }),

  http.post(`${BASE}/agencies`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newAgency: AgencyRecord = {
      id: `agency-${crypto.randomUUID().slice(0, 8)}`,
      name: (body.name as string) ?? "",
      phone: (body.phone as string) ?? "",
      address_line_1: (body.address_line_1 as string) ?? "",
      address_line_2: (body.address_line_2 as string) ?? null,
      city: (body.city as string) ?? "",
      postal_code: (body.postal_code as string) ?? "",
      main_agent_id: (body.main_agent_id as string) ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    createdAgencies.set(newAgency.id, newAgency);
    return HttpResponse.json(newAgency);
  }),

  http.put(`${BASE}/agencies/:id`, async ({ params, request }) => {
    const id = params.id as string;
    const body = (await request.json()) as Record<string, unknown>;
    const existing =
      createdAgencies.get(id) ?? agencies.find((a) => a.id === id) ?? agencies[0];
    const updated: AgencyRecord = {
      ...existing,
      ...(body as Partial<AgencyRecord>),
      id,
      updated_at: new Date().toISOString(),
    };
    createdAgencies.set(id, updated);
    return HttpResponse.json(updated);
  }),

  http.delete(`${BASE}/agencies/:id`, ({ params }) => {
    createdAgencies.delete(params.id as string);
    return new HttpResponse(null, { status: 204 });
  }),
];
