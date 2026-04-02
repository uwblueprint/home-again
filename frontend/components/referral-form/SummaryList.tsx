import { cn } from "@/lib/utils"

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
  className?: string
}

export default function SummaryList({
  items,
  selected,
  quantities,
  notes,
  subOptions,
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

  return (
    <div className={cn("space-y-3", className)}>
      {chosen.map((item) => {
        const subList = subOptions[item.id]
        const activeSubs = subList?.filter((s) => (s.quantity ?? 0) > 0) ?? []
        const displayQuantity = subList
          ? activeSubs.reduce((sum, s) => sum + (s.quantity ?? 0), 0)
          : quantities[item.id] ?? 0
        const note = notes[item.id] ?? ""

        return (
          <div
            key={`summary-${item.id}`}
            className="rounded-xl border border-muted-foreground/20 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  {item.label}
                </p>

                {note ? (
                  <p className="text-sm text-foreground/80">{note}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Specification here
                  </p>
                )}

                {activeSubs.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {activeSubs.map((sub) => (
                      <span
                        key={sub.id}
                        className="rounded-full bg-[#B5BD7E] px-2.5 py-1 text-xs font-semibold text-[#2f3121]"
                      >
                        ({sub.quantity}) {sub.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <p className="text-sm text-foreground">Quantity: {displayQuantity}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
