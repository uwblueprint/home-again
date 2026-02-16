import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold">Home Again Furniture Bank</h1>
          <p className="text-blue-100 mt-2">Starter foundation</p>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Core domains
            </h2>
            <p className="text-gray-600 mb-4">
              The API and data model support these resources. Implement CRUD and
              UI for each following the patterns in the docs.
            </p>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>Agencies (reference implementation — see API docs)</li>
              <li>Donors</li>
              <li>Clients</li>
              <li>Inventory</li>
              <li>Referrals</li>
              <li>Deliveries</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Getting started</h2>
          <ul className="text-gray-700 space-y-2">
            <li>Frontend: Next.js 15 (App Router) + TypeScript</li>
            <li>State: Zustand (global) + TanStack Query (server)</li>
            <li>UI: Tailwind CSS; add shadcn/ui as needed</li>
            <li>Backend: FastAPI + PostgreSQL / Supabase</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-4">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            API docs (Swagger)
          </a>
          <Link
            href="/agencies"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Agencies (example resource)
          </Link>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 w-full">
        <p>
          Powered by <span className="font-bold">Next.js</span> •{" "}
          <span className="font-bold">FastAPI</span> •{" "}
          <span className="font-bold">PostgreSQL</span>
        </p>
      </footer>
    </div>
  );
}
