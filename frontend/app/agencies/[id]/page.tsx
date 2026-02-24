"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Agency } from "@/types";

export default function AgencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agencyId = params.id as string;

  const { data: agency, isLoading, error } = useQuery({
    queryKey: ["agency", agencyId],
    queryFn: async () => {
      const response = await apiClient.get<Agency>(`/agencies/${agencyId}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Loading…</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
            >
              Back
            </button>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
          <div className="animate-pulse">Loading agency details…</div>
        </main>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Error</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
            >
              Back
            </button>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
            <p>Failed to load agency details.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{agency.name}</h1>
          <div className="flex gap-3">
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
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
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
      </main>
    </div>
  );
}
