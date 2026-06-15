import { http, HttpResponse } from "msw";
import { donations } from "../fixtures/donations";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const donationsHandlers = [
  http.get(`${BASE}/donations`, () => {
    return HttpResponse.json(donations);
  }),

  http.get(`${BASE}/donations/:id`, ({ params }) => {
    const donation = donations.find((d) => d.id === params.id);
    if (donation) {
      return HttpResponse.json(donation);
    }
    return HttpResponse.json({
      ...donations[0],
      id: params.id,
    });
  }),

  http.post(`${BASE}/donations`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...donations[0],
      ...body,
      id: "donation-mock-new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  http.put(`${BASE}/donations/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing =
      donations.find((d) => d.id === params.id) ?? donations[0];
    return HttpResponse.json({
      ...existing,
      ...body,
      id: params.id,
      updated_at: new Date().toISOString(),
    });
  }),

  http.delete(`${BASE}/donations/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
