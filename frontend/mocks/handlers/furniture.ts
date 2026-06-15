import { http, HttpResponse } from "msw";
import { furniture } from "../fixtures/furniture";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const furnitureHandlers = [
  http.get(`${BASE}/furniture`, () => {
    return HttpResponse.json(furniture);
  }),

  http.get(`${BASE}/furniture/:id`, ({ params }) => {
    const item = furniture.find((f) => f.id === params.id);
    if (item) {
      return HttpResponse.json(item);
    }
    return HttpResponse.json({
      ...furniture[0],
      id: params.id,
    });
  }),

  http.post(`${BASE}/furniture`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...furniture[0],
      ...body,
      id: "furniture-mock-new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  http.put(`${BASE}/furniture/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = furniture.find((f) => f.id === params.id) ?? furniture[0];
    return HttpResponse.json({
      ...existing,
      ...body,
      id: params.id,
      updated_at: new Date().toISOString(),
    });
  }),

  http.delete(`${BASE}/furniture/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
