import { http, HttpResponse } from "msw";
import { referrals } from "../fixtures/referrals";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const referralsHandlers = [
  http.get(`${BASE}/referrals`, () => {
    return HttpResponse.json(referrals);
  }),

  http.get(`${BASE}/referrals/:id`, ({ params }) => {
    const referral = referrals.find((r) => r.id === params.id);
    if (referral) {
      return HttpResponse.json(referral);
    }
    return HttpResponse.json({
      ...referrals[0],
      id: params.id,
    });
  }),

  http.post(`${BASE}/referrals`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...referrals[0],
      ...body,
      id: "referral-mock-new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  http.put(`${BASE}/referrals/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = referrals.find((r) => r.id === params.id) ?? referrals[0];
    return HttpResponse.json({
      ...existing,
      ...body,
      id: params.id,
      updated_at: new Date().toISOString(),
    });
  }),

  http.delete(`${BASE}/referrals/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
