import { ArrowUpDown, ListFilter, Search } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";

interface ReferralToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onFilter?: () => void; // TODO: define filter options and behavior
  onSort?: () => void; // TODO: define sort options and behavior
}

export function ReferralToolbar({
  query,
  onQueryChange,
  onFilter,
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
      <Button type="button" variant="outline" onClick={onFilter}>
        <ListFilter aria-hidden="true" />
        Filter
      </Button>
      <Button type="button" variant="outline" onClick={onSort}>
        <ArrowUpDown aria-hidden="true" />
        Sort
      </Button>
    </div>
  );
}
