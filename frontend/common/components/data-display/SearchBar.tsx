"use client";

import { Search } from "lucide-react";

import { Input } from "@/common/components/ui/input";
import { cn } from "@/common/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative w-75 min-w-0 max-w-full shrink", className)}>
      <Search className="pointer-events-none absolute left-md top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl pl-12"
      />
    </div>
  );
}
