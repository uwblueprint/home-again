"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ResourceDetail from "@/components/ResourceDetail";
import { useAgency, useDeleteAgency } from "@/hooks/useApi";
import type { AgencyRecord, ResourceDetailField } from "@/types";

const agencyFields: ResourceDetailField<AgencyRecord>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "address_line_1", label: "Address line 1" },
  { key: "address_line_2", label: "Address line 2", emptyValue: "—" },
  { key: "city", label: "City" },
  { key: "postal_code", label: "Postal code", emptyValue: "—" },
  {
    key: "main_agent_id",
    label: "Main agent ID",
    emptyValue: "Not linked",
  },
  {
    key: "created_at",
    label: "Created",
    render: (value) => new Date(String(value)).toLocaleString(),
  },
  {
    key: "updated_at",
    label: "Updated",
    render: (value) => new Date(String(value)).toLocaleString(),
  },
];

export default function AgencyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const agencyId = params?.id;

  const { data: agency, isLoading, error } = useAgency(agencyId);
  const deleteAgency = useDeleteAgency();

  const handleDelete = async () => {
    if (!agencyId) {
      return;
    }

    await deleteAgency.mutateAsync(agencyId);
    router.push("/agencies");
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = <p className="text-gray-600">Loading agency details...</p>;
  } else if (error) {
    content = (
      <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
        <p>{error.message}</p>
      </div>
    );
  } else if (!agency) {
    content = (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800">
        <p>Agency not found.</p>
      </div>
    );
  } else {
    content = (
      <ResourceDetail
        title={agency.name}
        fields={agencyFields}
        data={agency}
        onDelete={handleDelete}
        isDeleting={deleteAgency.isPending}
        deleteTitle="Delete agency"
        deleteMessage={`Are you sure you want to delete this agency (${agency.name})?`}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agency Details</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/agencies"
              className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
            >
              Back to Agencies
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {content}
      </main>
    </div>
  );
}
