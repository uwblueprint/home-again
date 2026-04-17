"use client"

import * as React from "react"
import {
  Breadcrumb as BreadcrumbNav,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/common/components/ui/breadcrumb"
import { Button } from "@/common/components/ui/button"
import { cn } from "@/common/lib/utils"

export type BreadcrumbStep = {
  label: string
  current?: boolean
}

type ReferralLayoutProps = {
  onNext: () => void
  onBack?: () => void
  isSubmitting?: boolean
  title: string
  activeIndex: number
  breadcrumbs?: BreadcrumbStep[]
  nextLabel?: string
  children: React.ReactNode
}

function ReferralLayout({
  title,
  breadcrumbs,
  activeIndex,
  onNext,
  onBack,
  isSubmitting = false,
  nextLabel = "Next",
  children,
}: ReferralLayoutProps) {

  // Derive breadcrumbs from provided data and ensure exactly one is active.
  const resolvedBreadcrumbs: BreadcrumbStep[] = React.useMemo(() => {
    if (!breadcrumbs?.length) return []

    return breadcrumbs.map((crumb, idx) => ({
      ...crumb,
      current: idx === activeIndex,
    }))
  }, [breadcrumbs, activeIndex])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-6 px-4 pb-4 pt-12">
      <header
        className={cn(
          "w-screen max-w-none px-4",
          "-mx-[calc((100vw-100%)/2)]",
          "flex flex-col items-center gap-3"
        )}
      >
          <BreadcrumbNav
            className={cn(
              "w-full",
              "text-sm leading-5 tracking-normal",
              "font-sans text-muted-foreground"
            )}
          >
          <BreadcrumbList className="mx-auto flex flex-wrap items-center justify-center gap-3">
            {resolvedBreadcrumbs.map((crumb, index) => {
              return (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  <BreadcrumbItem className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full bg-neutral-100",
                        "w-[26px] h-[26px] px-[10px] py-[5px] flex-col gap-[10px] aspect-square",
                        "text-[16px] leading-[150%] tracking-[-0.176px] font-medium text-muted-foreground",
                        crumb.current && "text-foreground"
                      )}
                      aria-current={crumb.current ? "step" : undefined}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-muted-foreground",
                        crumb.current && "text-foreground"
                      )}
                    >
                      {crumb.label}
                    </span>
                  </BreadcrumbItem>
                  {index < resolvedBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </BreadcrumbNav>
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
                "flex min-h-[40px] items-center justify-center gap-2",
                "px-6 py-2.5",
                "rounded-lg bg-neutral-100",
                "text-sm text-muted-foreground hover:bg-neutral-200 hover:text-foreground"
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
              "flex min-h-[40px] items-center justify-center gap-2",
              "px-6 py-2.5",
              "rounded-lg bg-[#9E4876] text-primary-foreground",
              "hover:bg-[#9E4876]/90"
            )}
          >
            {isSubmitting ? "Loading..." : nextLabel}
          </Button>
        </div>
      </nav>
    </div>
  )
}

export default ReferralLayout
