import { http, HttpResponse } from "msw";
import { donations } from "../fixtures/donations";
import { donationRequests } from "../fixtures/donationRequests";
import type { DonationDetail, DonationSubmissionInput } from "@/common/types";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const donationsHandlers = [
  // Before /donations/:id, so "details" isn't read as an id.
  http.get(`${BASE}/donations/details`, () => {
    return HttpResponse.json(donationRequests);
  }),

  http.post(`${BASE}/donations/submissions`, async ({ request }) => {
    const body = (await request.json()) as DonationSubmissionInput;
    const now = new Date().toISOString().slice(0, 19);
    const id = `donation-submitted-${Date.now()}`;
    const created: DonationDetail = {
      ...donationRequests[0],
      id,
      donor_id: body.donor_id,
      address_line_1: body.address_line_1,
      address_line_2: body.address_line_2 ?? null,
      city: body.city,
      postal_code: body.postal_code ?? null,
      smoking_household: body.smoking_household,
      has_pets: body.has_pets,
      status: "pending",
      review_status: "pending_review",
      approved_count: 0,
      item_count: body.items.length,
      pickup: null,
      created_at: now,
      updated_at: now,
      furniture_items: body.items.map((item, i) => ({
        ...donationRequests[0].furniture_items[0],
        id: `${id}-item-${i}`,
        name: item.size
          ? `${item.furniture_type} (${item.size})`
          : item.furniture_type,
        description: item.has_stains ? "Has stains" : "No stains",
        status: "PICKUP_PENDING",
        rejection_reason: null,
        reviewed_at: null,
        donation_id: id,
      })),
    };
    return HttpResponse.json(created, { status: 201 });
  }),

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
    const existing = donations.find((d) => d.id === params.id) ?? donations[0];
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
