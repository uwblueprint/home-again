"use client";

import { Search } from "lucide-react";

import { Input } from "@/common/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
}: SearchBarProps) {
  return (
    <div className="relative w-75 min-w-0 max-w-full shrink">
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
