import { Badge } from "@/common/components/ui/badge";

export function PriorityBadge() {
    return (
      <Badge className="h-auto rounded-3xl px-4 py-1.25 text-sm font-medium border-0 bg-red-50 text-orange-600 gap-1">
        <span className="size-1.25 rounded-full bg-orange-600" />
          PRIORITY
      </Badge>
    );
  }