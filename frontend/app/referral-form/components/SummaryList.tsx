import { Minus, Plus, Trash2 } from "lucide-react"
import { cn } from "@/common/lib/utils"

type SummaryItem = {
  id: string
  label: string
}

type SummaryListProps = {
  items: SummaryItem[]
  selected: Record<string, boolean>
  quantities: Record<string, number>
  notes: Record<string, string>
  subOptions: Record<
    string,
    { id: string; label: string; quantity: number }[] | undefined
  >
  onQuantityChange?: (itemId: string, nextQuantity: number) => void
  onSubQuantityChange?: (itemId: string, subId: string, nextQuantity: number) => void
  className?: string
}

export default function SummaryList({
  items,
  selected,
  quantities,
  notes,
  subOptions,
  onQuantityChange,
  onSubQuantityChange,
  className,
}: SummaryListProps) {
  const chosen = items.filter((item) => {
    if (!selected[item.id]) return false
    const subs = subOptions[item.id]
    if (subs && subs.length) {
      const total = subs.reduce((sum, s) => sum + (s.quantity ?? 0), 0)
      return total > 0
    }
    return (quantities[item.id] ?? 0) > 0
  })

  if (chosen.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No items selected yet.
      </div>
    )
  }

  type SummaryEntry = {
    key: string
    itemId: string
    label: string
    quantity: number
    subId?: string
    subLabel?: string
  }

  const summaryEntries = chosen.flatMap((item): SummaryEntry[] => {
    const subList = subOptions[item.id]
    const activeSubs = subList?.filter((s) => (s.quantity ?? 0) > 0) ?? []
    if (activeSubs.length > 0) {
      return activeSubs.map((sub) => ({
        key: `${item.id}-${sub.id}`,
        itemId: item.id,
        label: item.label,
        subId: sub.id,
        subLabel: sub.label,
        quantity: sub.quantity ?? 0,
      }))
    }

    return [
      {
        key: item.id,
        itemId: item.id,
        label: item.label,
        quantity: quantities[item.id] ?? 0,
      },
    ]
  })

  return (
    <div className={cn("space-y-3", className)}>
      {summaryEntries.map((entry) => {
        const note = notes[entry.itemId] ?? ""

        return (
            <div
              key={`summary-${entry.key}`}
              className="rounded-xl border border-muted-foreground/20 bg-white p-4 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-foreground">
                      {entry.label}
                    </p>
                    {entry.subLabel ? (
                      <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-muted px-3 py-1 text-sm font-medium leading-5 text-secondary-foreground">
                        {entry.subLabel}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-2xl border border-neutral-300 px-3 py-1.5 text-base text-foreground">
                      <button
                        type="button"
                        onClick={() => {
                          const nextQty = Math.max((entry.quantity ?? 1) - 1, 1)
                          if (entry.subId) {
                            onSubQuantityChange?.(entry.itemId, entry.subId, nextQty)
                          } else {
                            onQuantityChange?.(entry.itemId, nextQty)
                          }
                        }}
                        disabled={entry.quantity <= 1}
                        className="text-2xl text-neutral-500 disabled:opacity-40"
                        aria-label={`Decrease ${entry.label}`}
                      >
                        <Minus className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                      <span className="min-w-[1.5ch] text-center">
                        {entry.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextQty = (entry.quantity ?? 0) + 1
                          if (entry.subId) {
                            onSubQuantityChange?.(entry.itemId, entry.subId, nextQty)
                          } else {
                            onQuantityChange?.(entry.itemId, nextQty)
                          }
                        }}
                        className="text-2xl text-neutral-700"
                        aria-label={`Increase ${entry.label}`}
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (entry.subId) {
                          onSubQuantityChange?.(entry.itemId, entry.subId, 0)
                        } else {
                          onQuantityChange?.(entry.itemId, 0)
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:text-neutral-700"
                      aria-label={`Delete ${entry.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {note ? (
                  <p className="text-sm text-foreground/80">{note}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Specification here
                  </p>
                )}
              </div>
          </div>
        )
      })}
    </div>
  )
}
