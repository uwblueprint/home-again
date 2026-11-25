import { CircleAlert } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/utils";

interface StockItemChipProps {
  name?: string;
  quantity?: number;
  stock: number;
  variant?: "available" | "partial" | "unavailable" | "held";
}

/**
 * Displays a requested item with its current stock level.
 *
 * Green means enough stock exists for the requested quantity.
 * Grey means some stock exists, but less than requested.
 * Red means no stock exists.
 * Orange means units are held by approved or scheduled referral requests.
 */
export function StockItemChip({
  name,
  quantity,
  stock,
  variant,
}: StockItemChipProps) {
  const hasItemDetails = name !== undefined && quantity !== undefined;
  const status =
    variant ??
    (stock <= 0
      ? "unavailable"
      : quantity !== undefined && stock < quantity
        ? "partial"
        : "available");

  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-auto rounded-lg px-sm py-1 text-sm font-medium leading-5 border-none gap-1.5",
        status === "unavailable"
          ? "bg-(--unofficial-destructive-subtle)"
          : status === "partial"
            ? "bg-(--unofficial-border-0)"
            : status === "held"
              ? "bg-orange-50"
              : "bg-lime-100"
      )}
    >
      {hasItemDetails ? (
        <span className="text-secondary-foreground">
          {quantity} {name}
        </span>
      ) : null}
      <span
        className={cn(
          "inline-flex items-center gap-1",
          status === "unavailable"
            ? "text-destructive"
            : status === "partial"
              ? "text-muted-foreground"
              : status === "held"
                ? "text-orange-600"
                : "text-(--brand-greens-200)"
        )}
      >
        {status === "unavailable" && hasItemDetails
          ? "Unavailable"
          : status === "held"
            ? `${stock} held`
            : `${stock} in stock`}
        {status === "held" ? (
          <div className="inline-flex size-4 items-center">
            <CircleAlert aria-hidden="true" className="size-4" />
          </div>
        ) : null}
      </span>
    </Badge>
  );
}
