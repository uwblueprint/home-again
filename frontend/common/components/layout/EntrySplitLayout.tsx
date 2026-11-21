import type { ReactNode } from "react";

/**
 * Split entry shell for invite / welcome flows: decorative panel on the left,
 * centered form content on the right.
 */
export default function EntrySplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-foreground">
      <div className="flex min-h-screen w-full items-stretch justify-start">
        <aside className="hidden w-[492px] shrink-0 p-5 md:flex">
          <div className="h-full w-full rounded-xl bg-border/60" />
        </aside>

        <section className="flex min-h-screen flex-1 items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-[476px] space-y-5">{children}</div>
        </section>
      </div>
    </div>
  );
}
