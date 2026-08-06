"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchBar } from "@/common/components/data-display";
import {
  AgentSidebar,
  Avatar,
  AvatarFallback,
  SidebarAppShell,
  type AgentSidebarActiveItem,
} from "@/common/components/ui";
import { AGENT_DASH_PROFILE, AGENT_DASH_SEARCH } from "@/common/constants";
import { useAuthStore } from "@/common/stores/authStore";

type AgentDashShellProps = {
  children: ReactNode;
  activeItem?: AgentSidebarActiveItem;
};

function AgentDashFindBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [findQuery, setFindQuery] = useState("");

  useEffect(() => {
    if (pathname === AGENT_DASH_SEARCH) {
      setFindQuery(searchParams.get("q") ?? "");
    }
  }, [pathname, searchParams]);

  const runSearch = useCallback(
    (rawQuery: string) => {
      const query = rawQuery.trim();
      if (!query) return;
      router.push(`${AGENT_DASH_SEARCH}?q=${encodeURIComponent(query)}`);
    },
    [router]
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch(findQuery);
  }

  return (
    <form onSubmit={handleSearchSubmit}>
      <SearchBar
        value={findQuery}
        onChange={setFindQuery}
        placeholder="Find anything"
        className="w-64 max-w-none sm:w-80"
      />
    </form>
  );
}

export function AgentDashShell({
  children,
  activeItem = "client-referrals",
}: AgentDashShellProps) {
  const user = useAuthStore((state) => state.user);
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "WX";

  return (
    <SidebarAppShell
      sidebar={<AgentSidebar activeItem={activeItem} />}
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
            <Suspense
              fallback={
                <SearchBar
                  value=""
                  onChange={() => undefined}
                  placeholder="Find anything"
                  className="w-64 max-w-none sm:w-80"
                />
              }
            >
              <AgentDashFindBar />
            </Suspense>
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
