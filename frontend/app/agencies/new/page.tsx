"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResourceForm } from "@/components/forms/ResourceForm";
import { useCreateAgency } from "@/hooks/useApi";
import {
  agencyFields,
  defaultAgencyValues,
  toAgencyPayload,
} from "@/app/agencies/formConfig";

export default function NewAgencyPage() {
  const router = useRouter();
  const createAgency = useCreateAgency();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Agency</h1>
          <Link
            href="/agencies"
            className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
          >
            Back to Agencies
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          {createAgency.error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
              Failed to create agency. Please check the values and try again.
            </div>
          )}

          <ResourceForm
            fields={agencyFields}
            initialValues={defaultAgencyValues}
            mode="create"
            onSubmit={async (values) => {
              await createAgency.mutateAsync(toAgencyPayload(values));
              router.push("/agencies");
            }}
          />
        </div>
      </main>
    </div>
  );
}
