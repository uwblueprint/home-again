"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SearchBar } from "@/common/components/data-display";
import {
  AgentSidebar,
  Avatar,
  AvatarFallback,
  SidebarAppShell,
  type AgentSidebarActiveItem,
} from "@/common/components/ui";
import {
  AGENT_DASH,
  AGENT_DASH_AGENTS,
  AGENT_DASH_CLIENTS,
  AGENT_DASH_PROFILE,
  AGENT_DASH_SEARCH,
} from "@/common/constants";
import { useAuthStore } from "@/common/stores/authStore";

function getActiveItem(pathname: string): AgentSidebarActiveItem | undefined {
  if (pathname.startsWith(AGENT_DASH_CLIENTS)) return "clients";
  if (pathname.startsWith(AGENT_DASH_AGENTS)) return "agents";
  if (pathname === AGENT_DASH || pathname.startsWith(`${AGENT_DASH}/referrals`))
    return "client-referrals";
  return undefined;
}

export function AgentDashShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [findQuery, setFindQuery] = useState("");
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "";

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = findQuery.trim();
    if (query) {
      router.push(`${AGENT_DASH_SEARCH}?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <SidebarAppShell
      sidebar={<AgentSidebar activeItem={getActiveItem(pathname)} />}
      className="bg-muted/30"
    >
      <div className="flex min-h-svh flex-col">
        <header className="flex items-center justify-between gap-md bg-background px-xl pb-md pt-2xl">
          <Image
            src="/hafb_logo.svg"
            alt="Home Again Furniture Bank"
            width={96}
            height={58}
            className="h-10 w-auto"
            priority
          />

          <div className="flex items-center gap-sm">
            <form onSubmit={handleSearchSubmit}>
              <SearchBar
                value={findQuery}
                onChange={setFindQuery}
                placeholder="Find anything"
                className="w-64 max-w-none sm:w-80"
              />
            </form>
            <Link
              href={AGENT_DASH_PROFILE}
              aria-label="My profile"
              className="rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Avatar size="default">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-xl px-xl pb-xl pt-lg">
          {children}
        </main>
      </div>
    </SidebarAppShell>
  );
}
