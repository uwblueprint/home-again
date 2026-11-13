"use client";

import { useState, type ReactNode } from "react";

import { AdminHeader } from "@/common/components/layout";
import { AdminSidebar, SidebarAppShell } from "@/common/components/ui";

/** Admin chrome shared by the donors list and a donor's profile. */
export default function AdminDonorsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [search, setSearch] = useState("");

  return (
    <SidebarAppShell sidebar={<AdminSidebar activeItem="donors" />}>
      <div className="flex min-h-svh flex-col">
        <AdminHeader search={search} onSearchChange={setSearch} />
        {children}
      </div>
    </SidebarAppShell>
  );
}
