import { http, HttpResponse } from "msw";
import { routes } from "../fixtures/routes";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const routesHandlers = [
  http.get(`${BASE}/routes`, () => {
    return HttpResponse.json(routes);
  }),

  http.get(`${BASE}/routes/:id`, ({ params }) => {
    const route = routes.find((r) => r.id === params.id);
    if (route) {
      return HttpResponse.json(route);
    }
    return HttpResponse.json({
      ...routes[0],
      id: params.id,
    });
  }),

  http.post(`${BASE}/routes`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...routes[0],
      ...body,
      id: "route-mock-new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  http.put(`${BASE}/routes/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = routes.find((r) => r.id === params.id) ?? routes[0];
    return HttpResponse.json({
      ...existing,
      ...body,
      id: params.id,
      updated_at: new Date().toISOString(),
    });
  }),

  http.delete(`${BASE}/routes/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
