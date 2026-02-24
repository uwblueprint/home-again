"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAgencies } from "@/hooks/useApi";
import ResourceList from "@/components/ResourceList";
import type { Agency, ColumnConfig, RowActionConfig } from "@/types";

const agencyColumns: ColumnConfig<Agency>[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    width: "25%",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    width: "25%",
  },
  {
    key: "phone",
    label: "Phone",
    type: "phone",
    width: "15%",
  },
  {
    key: "city",
    label: "City",
    type: "text",
    width: "15%",
    render: (value, row: Agency) => `${row.city}, ${row.province}`,
  },
  {
    key: "status",
    label: "Status",
    type: "status",
    width: "15%",
  },
];

export default function AgenciesPage() {
  const router = useRouter();
  const { data: agencies, isLoading, error } = useAgencies();

  const rowActions: RowActionConfig<Agency>[] = [
    {
      id: "view",
      label: "View",
      className:
        "text-blue-600 hover:text-blue-800 hover:underline transition",
      onClick: (agency) => {
        router.push(`/agencies/${agency.id}`);
      },
    },
    {
      id: "edit",
      label: "Edit",
      className:
        "text-amber-600 hover:text-amber-800 hover:underline transition",
      onClick: (agency) => {
        router.push(`/agencies/${agency.id}/edit`);
      },
    },
    {
      id: "delete",
      label: "Delete",
      className: "text-red-600 hover:text-red-800 hover:underline transition",
      onClick: (agency) => {
        if (confirm(`Are you sure you want to delete "${agency.name}"?`)) {
          // TODO: Implement delete functionality
          console.log("Delete agency:", agency.id);
        }
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agencies</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        <ResourceList<Agency>
          columns={agencyColumns}
          data={agencies || []}
          loading={isLoading}
          error={error}
          rowActions={rowActions}
          emptyStateMessage="No agencies yet. Create one via the API docs."
          testId="agencies-list"
        />
      </main>
    </div>
  );
}
