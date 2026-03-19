"use client";

import Link from "next/link";
import { useAgencies } from "@/hooks/useApi";

export default function AgenciesPage() {
  const { data: agencies, isLoading, error } = useAgencies();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agencies</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/agencies/new"
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
            >
              Create Agency
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
        {isLoading && <p className="text-gray-600">Loading agencies…</p>}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
            <p>
              Failed to load agencies. Is the backend running at{" "}
              <code className="bg-red-100 px-1 rounded">
                {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}
              </code>
              ?
            </p>
          </div>
        )}
        {agencies && agencies.length === 0 && (
          <p className="text-gray-600">
            No agencies yet. Create one via the API docs.
          </p>
        )}
        {agencies && agencies.length > 0 && (
          <ul className="space-y-4">
            {agencies.map((agency) => (
              <li
                key={agency.id}
                className="bg-white rounded-lg shadow p-4 border border-gray-200"
              >
                <h2 className="font-semibold text-lg">{agency.name}</h2>
                <p className="text-gray-600 text-sm">{agency.email}</p>
                <p className="text-gray-500 text-sm">
                  {agency.city}, {agency.province}
                </p>
                <div className="mt-3">
                  <Link
                    href={`/agencies/${agency.id}/edit`}
                    className="inline-flex items-center rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
