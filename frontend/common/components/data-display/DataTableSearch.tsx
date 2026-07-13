"use client";

import { Search } from "lucide-react";

import { Input } from "@/common/components/ui/input";

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Global search input used in the data table toolbar.
 */
export function DataTableSearch({
  value,
  onChange,
  placeholder = "Search",
}: DataTableSearchProps) {
  return (
    <div className="relative w-full max-w-75">
      <Search className="pointer-events-none absolute left-sm top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-8"
      />
    </div>
  );
}
