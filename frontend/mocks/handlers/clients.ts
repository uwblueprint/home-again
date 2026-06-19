import { http, HttpResponse } from "msw";
import { clients } from "../fixtures/clients";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const clientsHandlers = [
  http.get(`${BASE}/clients`, () => {
    return HttpResponse.json(clients);
  }),

  http.get(`${BASE}/clients/:id`, ({ params }) => {
    const client = clients.find((c) => c.id === params.id);
    if (client) {
      return HttpResponse.json(client);
    }
    return HttpResponse.json({
      ...clients[0],
      id: params.id,
    });
  }),

  http.post(`${BASE}/clients`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...clients[0],
      ...body,
      id: "client-mock-new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  http.put(`${BASE}/clients/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = clients.find((c) => c.id === params.id) ?? clients[0];
    return HttpResponse.json({
      ...existing,
      ...body,
      id: params.id,
      updated_at: new Date().toISOString(),
    });
  }),

  http.delete(`${BASE}/clients/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
