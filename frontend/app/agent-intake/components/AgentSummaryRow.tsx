import { Badge } from "@/common/components/ui/badge";

interface AgentSummaryRowProps {
  index: number;
  emailDisplay: string;
  showAdminBadge?: boolean;
}

function AgentSummaryRow({
  index,
  emailDisplay,
  showAdminBadge = false,
}: AgentSummaryRowProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
      <p className="min-w-0 truncate text-sm text-foreground">
        <span className="font-semibold">Agent {index + 1}:</span> {emailDisplay}
      </p>
      {showAdminBadge ? (
        <Badge variant="outline" className="shrink-0 font-semibold">
          Admin User
        </Badge>
      ) : null}
    </div>
  );
}

export { AgentSummaryRow };
