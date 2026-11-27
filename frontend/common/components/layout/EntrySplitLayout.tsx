import type { ReactNode } from "react";

/**
 * Entry shell for invite / welcome / auth flows: a decorative panel on the left
 * (image placeholder for now) and centered form content on the right. Pass
 * `showPanel={false}` for a single centered column, e.g. password reset.
 */
export default function EntrySplitLayout({
  children,
  showPanel = true,
}: {
  children: ReactNode;
  showPanel?: boolean;
}) {
  return (
    <div className="bg-background text-foreground">
      <div className="flex min-h-screen w-full items-stretch justify-start">
        {showPanel ? (
          <aside className="hidden w-[492px] shrink-0 p-5 md:flex">
            <div className="h-full w-full rounded-xl bg-border/60" />
          </aside>
        ) : null}

        <section className="flex min-h-screen flex-1 items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-[476px] space-y-5">{children}</div>
        </section>
      </div>
    </div>
  );
}
