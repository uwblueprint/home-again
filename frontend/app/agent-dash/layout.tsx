"use client";

import type { ReactNode } from "react";

import { AgentDashAuthGate } from "./components/AgentDashAuthGate";

export default function AgentDashLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AgentDashAuthGate>{children}</AgentDashAuthGate>;
}
