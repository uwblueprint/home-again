"use client"

import * as React from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Breadcrumb = {
  label: string
  current?: boolean
}

type GenericLayoutProps = {
  onNext: () => void
  onBack?: () => void
  isSubmitting?: boolean
  title: string
  breadcrumbs: Breadcrumb[]
  nextLabel?: string
  children: React.ReactNode
}

function GenericLayout({
  title,
  breadcrumbs,
  onNext,
  onBack,
  isSubmitting = false,
  nextLabel = "Next",
  children,
}: GenericLayoutProps) {
  const activeIndex = React.useMemo(() => {
    const explicit = breadcrumbs.findIndex((crumb) => crumb.current)
    return explicit >= 0 ? explicit : 0
  }, [breadcrumbs])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-6 px-4 pb-4 pt-12">
      <header className="flex w-full flex-col gap-3">
        <Breadcrumb
          className={cn(
            "mx-auto mb-3",
            "text-paragraph-small-font-size leading-paragraph-small-line-height tracking-paragraph-small-letter-spacing",
            "font-font-definitions-font-family-body text-general-muted-foreground"
          )}
        >
          <BreadcrumbList className="flex flex-wrap items-center gap-sm">
            {breadcrumbs.map((crumb, index) => {
              const isActive = index === activeIndex

              return (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  <BreadcrumbItem className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full bg-neutral-100",
                        "w-[26px] h-[26px] px-[10px] py-[5px] flex-col gap-[10px] aspect-square",
                        "text-[16px] leading-[150%] tracking-[-0.176px] font-medium text-general-muted-foreground",
                        isActive && "text-foreground"
                      )}
                      aria-current={isActive ? "step" : undefined}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-muted-foreground",
                        isActive && "text-foreground"
                      )}
                    >
                      {crumb.label}
                    </span>
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>

        <div>{children}</div>
      </div>

      <nav
        className={cn(
          "mt-auto w-screen max-w-none",
          "-mx-[calc((100vw-100%)/2)]",
          "border-t border-border bg-background/90 px-4 py-3 pb-6"
        )}
      >
        <div className="ml-auto mr-4 flex w-full max-w-3xl items-center justify-end gap-2">
          {onBack ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              data-testid="back-button"
              className={cn(
                "flex min-h-[40px] items-center justify-center gap-[var(--xs,8px)]",
                "px-[var(--xl,24px)] py-[var(--hacks-to-fit-scale-10,10px)]",
                "rounded-lg bg-[var(--general-secondary,#F5F5F5)]",
                "text-sm text-muted-foreground hover:bg-[var(--general-secondary,#F5F5F5)] hover:text-foreground"
              )}
            >
              Back
            </Button>
          ) : null}

          <Button
            type="button"
            onClick={onNext}
            disabled={isSubmitting}
            data-testid="next-button"
            aria-busy={isSubmitting}
            className={cn(
              "flex min-h-[40px] items-center justify-center gap-[var(--xs,8px)]",
              "px-[var(--xl,24px)] py-[var(--hacks-to-fit-scale-10,10px)]",
              "rounded-lg bg-[var(--general-primary,#9E4876)] text-primary-foreground",
              "hover:bg-[var(--general-primary,#9E4876)]/90"
            )}
          >
            {isSubmitting ? "Loading..." : nextLabel}
          </Button>
        </div>
      </nav>
    </div>
  )
}

export default GenericLayout
