import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/utils";

interface StockItemChipProps {
  name?: string;
  quantity?: number;
  stock: number;
  variant?: "available" | "partial" | "unavailable";
}

/**
 * Displays a requested item with its current stock level.
 *
 * green = enough stock for the requested quantity
 * grey  = some stock, but less than requested
 * red   = none in stock
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
      : hasItemDetails && stock < quantity
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
          status === "unavailable"
            ? "text-destructive"
            : status === "partial"
              ? "text-muted-foreground"
              : "text-(--brand-greens-200)"
        )}
      >
        {status === "unavailable" && hasItemDetails
          ? "Unavailable"
          : `${stock} in stock`}
      </span>
    </Badge>
  );
}
