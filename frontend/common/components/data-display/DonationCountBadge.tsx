import { Badge } from "@/common/components/ui/badge";

interface DonationCountBadgeProps {
  count: number;
}

export function DonationCountBadge({ count }: DonationCountBadgeProps) {
  return (
    <Badge variant="secondary" className="rounded-[8px] font-normal">
      {count} total {count === 1 ? "donation" : "donations"} made
    </Badge>
  );
}
