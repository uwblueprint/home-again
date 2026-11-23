"use client";

import { useState, type ReactNode } from "react";
import { AdminHeader } from "@/common/components/layout";
import { AdminSidebar, SidebarAppShell } from "@/common/components/ui";

export default function ReferralRequestsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [search, setSearch] = useState("");

  return (
    <SidebarAppShell sidebar={<AdminSidebar activeItem="client-referrals" />}>
      <AdminHeader search={search} onSearchChange={setSearch} />
      {children}
    </SidebarAppShell>
  );
}
