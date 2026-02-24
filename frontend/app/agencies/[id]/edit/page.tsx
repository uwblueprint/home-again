"use client";

import { SetStateAction, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Agency } from "@/types";

export default function AgencyEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const agencyId = params.id as string;

  const [formData, setFormData] = useState<Partial<Agency>>({});

  const { data: agency, isLoading } = useQuery<Agency, Error, Agency>({
    queryKey: ["agency", agencyId],
    queryFn: async (): Promise<Agency> => {
      const response = await apiClient.get<Agency>(`/agencies/${agencyId}`);
      return response.data;
    },
    onSuccess: (data: Agency) => {
      setFormData(data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Agency>) => {
      const response = await apiClient.put<Agency>(
        `/agencies/${agencyId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", agencyId] });
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      router.push(`/agencies/${agencyId}`);
    },
  });

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
    updateMutation.mutate(formData);
  };

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
          <div className="animate-pulse">Loading…</div>
        </main>
      </div>
    );
  }

  if (!agency) {
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
            <p>Agency not found.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit {agency.name}</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
          >
            Back
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
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
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
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

            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                Province
              </label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            />
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
      </main>
    </div>
  );
}
