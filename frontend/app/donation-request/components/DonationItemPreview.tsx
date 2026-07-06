import { type ComponentProps } from "react";
import Image from "next/image";

import { cn } from "@/common/lib/utils";

export type DonationItem = {
  imageSrc?: string;
  title: string;
  condition?: string;
};

function DonationItemPreview({
  imageSrc,
  title,
  condition,
  className,
  ...props
}: DonationItem & ComponentProps<"div">) {
  return (
    <div
      data-slot="donation-item-preview"
      className={cn("flex items-center gap-2.5 py-sm", className)}
      {...props}
    >
      <div className="relative size-13 shrink-0 overflow-hidden rounded-lg bg-muted">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-xs">
        <p className="text-paragraph-large font-semibold text-foreground">
          {title}
        </p>
        {condition && (
          <p className="text-paragraph-small text-muted-foreground">
            {condition}
          </p>
        )}
      </div>
    </div>
  );
}

export { DonationItemPreview };
