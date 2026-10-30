import { type ComponentProps } from "react";

import { cn } from "@/common/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/common/components/ui/card";
import { StockItemChip } from "@/common/components/data-display";

export type RequestedItem = {
  quantity: number;
  furniture: string;
  stock: number;
  description?: string;
};

function RequestedItemCard({
  quantity,
  furniture,
  stock,
  description,
  className,
  ...props
}: RequestedItem & ComponentProps<typeof Card>) {
  return (
    <Card
      data-slot="requested-item-preview"
      className={cn("w-full min-w-0", className)}
      {...props}
    >
      <CardHeader className="gap-sm">
        <div className="flex flex-wrap items-center gap-sm">
          <CardTitle className="min-w-0 wrap-break-word">
            {quantity} {furniture}
          </CardTitle>
          <StockItemChip stock={stock} quantity={quantity} />
        </div>
        {description && (
          <CardDescription className="wrap-break-word">
            {description}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}

export { RequestedItemCard };