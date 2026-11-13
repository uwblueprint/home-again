import { http, HttpResponse } from "msw";
import { donations } from "../fixtures/donations";
import { donationDetails } from "../fixtures/donationDetails";
import { donors } from "../fixtures/donors";
import type { Donor, DonorListItem } from "@/common/types";

const BASE = process.env.NEXT_PUBLIC_API_URL;

// In-memory store for donors created or edited during the session
const createdDonors = new Map<string, Donor>();

export const donorsHandlers = [
  // Donation stats derived from the donations fixture, like the backend's join.
  http.get(`${BASE}/donors`, () => {
    // Session edits replace their fixture donor rather than listing it twice.
    const list: DonorListItem[] = [
      ...donors.filter((donor) => !createdDonors.has(donor.id)),
      ...Array.from(createdDonors.values()),
    ].map((donor) => {
      const own = donations.filter((d) => d.donor_id === donor.id);
      const latest = own.reduce<string | null>(
        (max, d) => (max === null || d.created_at > max ? d.created_at : max),
        null
      );
      return { ...donor, donation_count: own.length, last_donated_at: latest };
    });
    return HttpResponse.json(list);
  }),

  http.get(`${BASE}/donors/:id`, ({ params }) => {
    const id = params.id as string;
    const created = createdDonors.get(id);
    if (created) {
      return HttpResponse.json(created);
    }
    const donor = donors.find((d) => d.id === id);
    if (donor) {
      return HttpResponse.json(donor);
    }
    return HttpResponse.json({
      ...donors[0],
      id,
    });
  }),

  http.get(`${BASE}/donors/:id/donations`, ({ params }) => {
    return HttpResponse.json(
      donationDetails.filter((d) => d.donor_id === params.id)
    );
  }),

  http.put(`${BASE}/donors/:id`, async ({ params, request }) => {
    const id = params.id as string;
    const existing = createdDonors.get(id) ?? donors.find((d) => d.id === id);
    if (!existing) {
      return HttpResponse.json({ detail: "Donor not found" }, { status: 404 });
    }
    const body = (await request.json()) as Partial<Donor>;
    const updated: Donor = {
      ...existing,
      ...body,
      updated_at: new Date().toISOString(),
    };
    createdDonors.set(id, updated);
    return HttpResponse.json(updated);
  }),

  http.post(`${BASE}/donors`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const id = crypto.randomUUID();
    const newDonor: Donor = {
      id,
      name: `${body.first_name ?? ""} ${body.last_name ?? ""}`.trim() || null,
      first_name: (body.first_name as string) ?? "",
      last_name: (body.last_name as string) ?? "",
      email: (body.email as string) ?? "",
      phone: (body.phone as string) ?? "",
      address: (body.address as string) ?? "",
      city: (body.city as string) ?? "",
      postal_code: (body.postal_code as string) ?? "",
      country: (body.country as string) ?? "Canada",
      smoking_household: (body.smoking_household as boolean) ?? false,
      donation_type: (body.donation_type as string) ?? "furniture",
      is_anonymous: (body.is_anonymous as boolean) ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    createdDonors.set(id, newDonor);
    return HttpResponse.json(newDonor);
  }),
];
