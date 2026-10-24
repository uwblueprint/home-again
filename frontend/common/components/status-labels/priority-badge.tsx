import { Badge } from "@/common/components/ui/badge";

export function PriorityBadge() {
    return (
      <Badge className="min-h-6 rounded-3xl px-2 py-0.75 font-normal border-transparent bg-red-50 text-orange-600 gap-1.5">
        <span className="size-1.25 rounded-full bg-orange-600" />
          PRIORITY
      </Badge>
    );
  }