"use client";

import Image from "next/image";

import { cn } from "@/common/lib/utils";
import { SearchBar } from "@/common/components/data-display/SearchBar";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";

interface AdminHeaderProps {
  className?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  /** Initials shown in the avatar (e.g. "WX"). */
  userInitials?: string;
}

/**
 * Top bar for admin pages: logo, global search, and the user avatar.
 * Composition of existing primitives — no new chrome.
 */
function AdminHeader({
  className,
  search = "",
  onSearchChange,
  userInitials = "HA",
}: AdminHeaderProps) {
  return (
    <header
      className={cn(
        "flex w-full items-center justify-between gap-lg px-2xl py-lg",
        className
      )}
    >
      <Image
        src="/hafb_logo.svg"
        alt="Home Again Furniture Bank"
        width={91}
        height={55}
        className="h-auto w-auto"
        priority
      />
      <div className="flex items-center gap-lg">
        <SearchBar
          value={search}
          onChange={onSearchChange ?? (() => {})}
          placeholder="Find anything"
        />
        <Avatar>
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export { AdminHeader };
