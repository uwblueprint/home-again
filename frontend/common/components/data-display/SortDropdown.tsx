"use client";

import { ArrowUpDown } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { SortMenu, type SortMenuProps } from "@/common/components/ui/sort-menu";

type SortDropdownProps = Omit<SortMenuProps, "className">;

/** The "Sort" button that opens a `SortMenu`; takes the same props. */
export function SortDropdown(sortMenuProps: SortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="gap-2 border-border">
            <ArrowUpDown className="size-4" />
            Sort
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-56 p-0">
        <SortMenu {...sortMenuProps} className="border-0 shadow-none" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type { SortDropdownProps };
