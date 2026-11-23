import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  SortMenu,
  type SortMenuOption,
} from "@/common/components/ui";
import type { ReferralSortField } from "../types";

interface ReferralToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  sortField: ReferralSortField;
  sortDescending: boolean;
  onSortFieldChange: (field: ReferralSortField) => void;
  onSortDirectionChange: (descending: boolean) => void;
  onSortReset: () => void;
}

const SORT_OPTIONS: SortMenuOption[] = [
  { value: "recency", label: "Recency" },
  { value: "priority", label: "High priority" },
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
];

export function ReferralToolbar({
  query,
  onQueryChange,
  sortField,
  sortDescending,
  onSortFieldChange,
  onSortDirectionChange,
  onSortReset,
}: ReferralToolbarProps) {
  return (
    <div className="flex items-center gap-sm">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search for referral"
          aria-label="Search for referral"
          className="w-80 pl-9"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-label="Open referral sort options"
            >
              <ArrowUpDown aria-hidden="true" />
              Sort
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-56 p-0">
          <SortMenu
            options={SORT_OPTIONS}
            value={sortField}
            onChange={(value) => onSortFieldChange(value as ReferralSortField)}
            onReset={onSortReset}
            headerActions={
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Sort ascending"
                  aria-pressed={!sortDescending}
                  className={sortDescending ? "text-muted-foreground opacity-45" : "text-foreground"}
                  onClick={() => onSortDirectionChange(false)}
                >
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Sort descending"
                  aria-pressed={sortDescending}
                  className={sortDescending ? "text-foreground" : "text-muted-foreground opacity-45"}
                  onClick={() => onSortDirectionChange(true)}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
              </div>
            }
            className="border-0 shadow-none"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
