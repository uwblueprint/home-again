import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";

interface ReferralToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSort: () => void;
}

export function ReferralToolbar({
  query,
  onQueryChange,
  onSort,
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
      <Button
        type="button"
        variant="outline"
        onClick={onSort}
        aria-label="Toggle submission date sort order"
      >
        <ArrowUpDown aria-hidden="true" />
        Sort
      </Button>
    </div>
  );
}
