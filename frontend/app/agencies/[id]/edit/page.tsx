"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { useAgency, useUpdateAgency } from "@/hooks/useApi";
import {
  agencyFields,
  defaultAgencyValues,
  toAgencyPayload,
} from "@/app/agencies/formConfig";

export default function EditAgencyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const agencyId = params?.id ?? "";
  const { data: agency, isLoading, error } = useAgency(agencyId);
  const updateAgency = useUpdateAgency();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit Agency</h1>
          <Link
            href="/agencies"
            className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
          >
            Back to Agencies
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        {isLoading && <p className="text-gray-600">Loading agency...</p>}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
            Failed to load agency.
          </div>
        )}

        {agency && (
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            {updateAgency.error && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
                Failed to update agency. Please check the values and try again.
              </div>
            )}

            <ResourceForm
              fields={agencyFields}
              initialValues={{ ...defaultAgencyValues, ...agency }}
              mode="edit"
              onSubmit={async (values) => {
                await updateAgency.mutateAsync({
                  id: agencyId,
                  agency: toAgencyPayload(values),
                });
                router.push("/agencies");
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
