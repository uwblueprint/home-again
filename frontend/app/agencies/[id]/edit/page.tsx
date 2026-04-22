"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAgency, useUpdateAgency } from "@/common/hooks/useApi";
import type { UpdateAgencyInput } from "@/common/types";
import PageLayout from "@/common/components/layout/PageLayout";

export default function AgencyEditPage() {
  const params = useParams();
  const router = useRouter();
  const agencyId =
    typeof params.id === "string" && params.id ? params.id : null;

  const [formData, setFormData] = useState<UpdateAgencyInput>({});

  const { data: agency, isLoading } = useAgency(agencyId ?? "");

  useEffect(() => {
    if (agency) setFormData(agency);
  }, [agency]);

  const updateMutation = useUpdateAgency(agencyId ?? "");

  const listButton = (
    <button
      onClick={() => router.push("/agencies")}
      className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
    >
      Agencies
    </button>
  );

  if (!agencyId) {
    return (
      <PageLayout title="Invalid Agency" actions={listButton}>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
          <p>Invalid or missing agency ID.</p>
        </div>
      </PageLayout>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData, {
      onSuccess: () => router.push(`/agencies/${agencyId}`),
    });
  };

  const backButton = (
    <button
      onClick={() => router.back()}
      className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
    >
      Back
    </button>
  );

  if (isLoading) {
    return (
      <PageLayout title="Loading…" actions={backButton}>
        <div className="animate-pulse">Loading…</div>
      </PageLayout>
    );
  }

  if (!agency) {
    return (
      <PageLayout title="Error" actions={backButton}>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
          <p>Agency not found.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Edit ${agency.name}`} actions={backButton}>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            />
          </div>
          <div>
            <label
              htmlFor="postal_code"
              className="block text-sm font-medium text-gray-700"
            >
              Postal Code
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="address_line_1"
            className="block text-sm font-medium text-gray-700"
          >
            Address line 1
          </label>
          <input
            type="text"
            id="address_line_1"
            name="address_line_1"
            value={formData.address_line_1 || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          />
        </div>

        <div>
          <label
            htmlFor="address_line_2"
            className="block text-sm font-medium text-gray-700"
          >
            Address line 2
          </label>
          <input
            type="text"
            id="address_line_2"
            name="address_line_2"
            value={formData.address_line_2 || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>

        {updateMutation.error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
            <p>Error saving changes. Please try again.</p>
          </div>
        )}
      </form>
    </PageLayout>
  );
}
