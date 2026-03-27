"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type FurnitureItemCardProps = {
  className?: string
  label: string
  selected: boolean
  quantity: number
  notes?: string
  subOptions?: {
    id: string
    label: string
    quantity: number
  }[]
  minQuantity?: number
  maxQuantity?: number
  onToggle?: (nextSelected: boolean) => void
  onQuantityChange?: (nextQuantity: number) => void
  onNotesChange?: (nextNotes: string) => void
  onSubQuantityChange?: (id: string, nextQuantity: number) => void
}

const ACCENT = "#9E4876"

export function FurnitureItemCard({
  label,
  selected,
  quantity,
  notes = "",
  subOptions,
  minQuantity = 1,
  maxQuantity,
  onToggle,
  onQuantityChange,
  onNotesChange,
  onSubQuantityChange,
  className,
}: FurnitureItemCardProps) {
  const showMainStepper = !subOptions || subOptions.length === 0

  const handleToggle = () => {
    const next = !selected
    onToggle?.(next)
    if (!next) {
      onQuantityChange?.(Math.max(minQuantity, 1))
      if (subOptions?.length && onSubQuantityChange) {
        subOptions.forEach((sub) => onSubQuantityChange(sub.id, 0))
      }
    } else if (quantity < Math.max(minQuantity, 1)) {
      onQuantityChange?.(Math.max(minQuantity, 1))
    }
  }

  const setQuantity = (next: number) => {
    const clamped =
      maxQuantity !== undefined
        ? Math.min(Math.max(next, minQuantity), maxQuantity)
        : Math.max(next, minQuantity)
    onQuantityChange?.(clamped)
  }

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border border-[#D4D4D4] bg-white p-3 shadow-sm",
        "min-h-[104px] max-w-sm",
        className
      )}
    >
      <div className="flex w-full items-center gap-3">
        <label
          className="relative inline-flex cursor-pointer items-center justify-center"
          style={{ width: "16px", height: "16px" }}
        >
          <input
            type="checkbox"
            className="peer h-full w-full appearance-none rounded-[4px] border border-neutral-300 bg-white text-[#9E4876] accent-[#9E4876] shadow-inner transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E4876]"
            checked={selected}
            onChange={handleToggle}
            aria-label={`Select ${label}`}
          />
          <span
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center rounded-[4px] border border-neutral-300 text-white transition-all",
              "peer-checked:border-transparent peer-checked:bg-[#9E4876]"
            )}
          >
            <svg
              className={cn(
                "h-3.5 w-3.5 transition-opacity",
                selected ? "opacity-100" : "opacity-0"
              )}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </label>

        <h3 className="flex-1 text-base font-medium leading-6 text-[#171717]">
          {label}
        </h3>

        {showMainStepper ? (
          <div className="flex min-w-[122px] justify-end">
            <div
              className={cn(
                "flex items-center gap-2 rounded-2xl border border-neutral-300 px-3 py-1.5 text-base text-foreground transition-opacity",
                selected ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-hidden={!selected}
            >
              <button
                type="button"
                onClick={() => setQuantity(quantity - 1)}
                disabled={quantity <= minQuantity}
                className="text-2xl text-neutral-500 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" strokeWidth={2.25} />
              </button>
              <span className="min-w-[1.5ch] text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                disabled={
                  maxQuantity !== undefined ? quantity >= maxQuantity : false
                }
                className="text-2xl text-neutral-700 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selected ? (
        <div className="w-full animate-in fade-in-50">
          {subOptions?.length ? (
            <div className="mb-3 rounded-xl border border-neutral-300 bg-white px-3 py-2.5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {subOptions.map((sub) => {
                  const active = sub.quantity > 0
                  return (
                    <span
                      key={sub.id}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold transition",
                        active
                          ? "bg-[#B5BD7E] text-[#2f3121]"
                          : "bg-neutral-200 text-neutral-600"
                      )}
                    >
                      ({sub.quantity || 0}) {sub.label}
                    </span>
                  )
                })}
              </div>

              <div className="space-y-2.5">
                {subOptions.map((sub) => {
                  const dec = () =>
                    onSubQuantityChange?.(
                      sub.id,
                      Math.max((sub.quantity ?? 0) - 1, 0)
                    )
                  const inc = () =>
                    onSubQuantityChange?.(sub.id, (sub.quantity ?? 0) + 1)
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm text-foreground">
                        {sub.label}
                      </span>
                      <div className="flex items-center gap-2 rounded-2xl border border-neutral-300 px-3 py-1.5 text-base text-foreground">
                        <button
                          type="button"
                          onClick={dec}
                          disabled={sub.quantity <= 0}
                          className="text-2xl text-neutral-500 disabled:opacity-40"
                          aria-label={`Decrease ${sub.label}`}
                        >
                          <Minus className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <span className="min-w-[1.5ch] text-center">
                          {sub.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={inc}
                          className="text-2xl text-neutral-700"
                          aria-label={`Increase ${sub.label}`}
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          <Input
            value={notes}
            onChange={(e) => onNotesChange?.(e.target.value)}
            placeholder="Add item details or specifications"
            className="h-12 rounded-lg border-neutral-300 text-base placeholder:text-neutral-500"
          />
        </div>
      ) : null}
    </div>
  )
}

export default FurnitureItemCard
