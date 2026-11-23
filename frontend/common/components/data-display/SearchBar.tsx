"use client";

import { Search } from "lucide-react";

import { Input } from "@/common/components/ui/input";
import { cn } from "@/common/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** "sm" is the 36px table-toolbar search; "default" is the 40px header one. */
  size?: "default" | "sm";
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  className,
  size = "default",
}: SearchBarProps) {
  const compact = size === "sm";
  return (
    <div
      className={cn(
        "relative min-w-0 max-w-full shrink",
        compact ? "w-80" : "w-75",
        className
      )}
    >
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
          compact ? "left-sm" : "left-md"
        )}
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        // Compact keeps Input's own 36px height and 8px radius.
        className={compact ? "pl-10" : "h-10 rounded-xl pl-12"}
      />
    </div>
  );
}
