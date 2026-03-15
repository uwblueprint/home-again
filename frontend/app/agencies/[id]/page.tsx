"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAgency } from "@/hooks/useApi";
import PageLayout from "@/components/PageLayout";

export default function AgencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agencyId = typeof params.id === "string" && params.id ? params.id : null;

  const { data: agency, isLoading, error } = useAgency(agencyId ?? "");

  if (!agencyId) {
    return <p className="p-6 text-red-600">Invalid or missing agency ID.</p>;
  }

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
        <div className="animate-pulse">Loading agency details…</div>
      </PageLayout>
    );
  }

  if (error || !agency) {
    return (
      <PageLayout title="Error" actions={backButton}>
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
          <p>Failed to load agency details.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={agency.name}
      actions={
        <>
          <Link
            href={`/agencies/${agencyId}/edit`}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded transition"
          >
            Edit
          </Link>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
          >
            Back
          </button>
        </>
      }
    >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-gray-900">{agency.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <p className="mt-1 text-gray-900">{agency.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <p className="mt-1">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200 capitalize">
                  {agency.status || "unset"}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <p className="mt-1 text-gray-900">{agency.address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <p className="mt-1 text-gray-900">
                {agency.city}, {agency.province}
              </p>
            </div>
          </div>
        </div>

        {agency.description && (
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <p className="mt-1 text-gray-900">{agency.description}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-gray-500">
            Created: {new Date(agency.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            Updated: {new Date(agency.updated_at).toLocaleDateString()}
          </p>
        </div>
    </PageLayout>
  );
}
