import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";

type DetailPageProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rendered to the right of the title, e.g. status badges. */
  aside?: ReactNode;
  backHref: string;
  children: ReactNode;
};

/** Centered read-only page with a title row and a Back button at the bottom. */
export function DetailPage({
  title,
  subtitle,
  aside,
  backHref,
  children,
}: DetailPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-xl">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <h1 className="text-heading-2 font-semibold text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-paragraph-small text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        {aside}
      </div>

      {children}

      <div className="mt-auto flex justify-end pt-xl">
        <BackButton href={backHref} />
      </div>
    </div>
  );
}

export function BackButton({ href }: { href: string }) {
  return (
    <Button
      type="button"
      variant="secondary"
      nativeButton={false}
      render={<Link href={href} />}
    >
      Back
    </Button>
  );
}

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-md">
      <h2 className="text-heading-4 font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function DetailCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background p-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
