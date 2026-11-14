"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bed,
  LampDesk,
  Package,
  PlugZap,
  Search,
  Sofa,
} from "lucide-react"

import FurnitureItemCard from "@/common/components/forms/FurnitureItemCard"
import {
  FALLBACK_CATALOG,
  type Item,
  type ReferralCatalog,
  type SubOption,
} from "@/app/referral-form/catalog"
import SummaryList from "./SummaryList"
import { cn } from "@/common/lib/utils"


export type { Item }

/** The bundled item list; the form itself uses its `catalog` prop. */
export const ITEMS = FALLBACK_CATALOG.items

export type FurnitureFormData = {
  selected: Record<string, boolean>
  quantities: Record<string, number>
  notes: Record<string, string>
  subOptions: Record<string, SubOption[]>
}

type FurnitureFormProps = {
  className?: string
  data?: FurnitureFormData
  showHeader?: boolean
  showSummary?: boolean
  onValidityChange?: (isValid: boolean) => void
  onDataChange?: (data: FurnitureFormData) => void
  /** Items, sizes and categories to offer; see useReferralCatalog. */
  catalog?: ReferralCatalog
}




const buildDefaults = (items: Item[], value: number) =>
  Object.fromEntries(items.map((item) => [item.id, value]))

const buildDefaultNotes = (items: Item[]) =>
  Object.fromEntries(items.map((item) => [item.id, ""]))

const cloneSubOptions = (
  source: Record<string, { id: string; label: string; quantity: number }[]>
) =>
  Object.fromEntries(
    Object.entries(source).map(([itemId, options]) => [
      itemId,
      options.map((option) => ({ ...option })),
    ])
  )

const normalizeFurnitureData = (
  catalog: ReferralCatalog,
  data?: FurnitureFormData
): FurnitureFormData => ({
  selected: { ...(data?.selected ?? {}) },
  quantities: { ...buildDefaults(catalog.items, 0), ...(data?.quantities ?? {}) },
  notes: { ...buildDefaultNotes(catalog.items), ...(data?.notes ?? {}) },
  subOptions: {
    ...cloneSubOptions(catalog.subOptions),
    ...(data?.subOptions
      ? cloneSubOptions(data.subOptions)
      : {}),
  },
})

const CATEGORY_ICONS: Record<string, typeof Sofa> = {
  Seating: Sofa,
  "Storage and Shelving": Package,
  Bed: Bed,
  Electronics: PlugZap,
  Tables: LampDesk,
}

export default function FurnitureForm({
  className,
  data,
  showHeader = true,
  showSummary = true,
  onValidityChange,
  onDataChange,
  catalog = FALLBACK_CATALOG,
}: FurnitureFormProps) {
  const initialData = useMemo(
    () => normalizeFurnitureData(catalog, data),
    // Only the first catalog seeds state; later ones are merged in below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )
  const [selected, setSelected] = useState<Record<string, boolean>>(
    initialData.selected
  )
  const [subOptions, setSubOptions] = useState(initialData.subOptions)
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    initialData.quantities
  )
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    initialData.notes
  )

  const [activeCategory, setActiveCategory] = useState<string>(
    catalog.categories[0]
  )
  const [search, setSearch] = useState("")

  // The catalog can arrive after the form mounts (bundled list first, then
  // inventory). Add any sized items it brings without touching chosen sizes.
  useEffect(() => {
    setSubOptions((prev) => {
      const missing = Object.entries(catalog.subOptions).filter(
        ([itemId]) => !prev[itemId]
      )
      if (!missing.length) return prev
      return { ...prev, ...cloneSubOptions(Object.fromEntries(missing)) }
    })
  }, [catalog])

  const currentCategory = catalog.categories.includes(activeCategory)
    ? activeCategory
    : catalog.categories[0]

  const isSearchActive = search.trim().length > 0

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return catalog.items.filter((item) => {
      const matchesSearch = normalizedSearch
        ? item.label.toLowerCase().includes(normalizedSearch)
        : true
      const matchesCategory = normalizedSearch
        ? true
        : item.category === currentCategory
      return matchesSearch && matchesCategory
    })
  }, [catalog, currentCategory, search])

  const hasSizeError = useMemo(() => {
    return catalog.items.some((item) => {
      if (!selected[item.id]) return false
      const subs = subOptions[item.id]
      if (!subs?.length) return false
      const total = subs.reduce((sum, sub) => sum + (sub.quantity ?? 0), 0)
      return total === 0
    })
  }, [catalog, selected, subOptions])

  useEffect(() => {
    onValidityChange?.(!hasSizeError)
  }, [hasSizeError, onValidityChange])

  useEffect(() => {
    onDataChange?.({ selected, quantities, notes, subOptions })
  }, [selected, quantities, notes, subOptions, onDataChange])

  const handleSummaryQuantityChange = (itemId: string, nextQuantity: number) => {
    setQuantities((prev) => ({ ...prev, [itemId]: nextQuantity }))
    setSelected((prev) => ({ ...prev, [itemId]: nextQuantity > 0 }))
  }

  const handleSummarySubQuantityChange = (
    itemId: string,
    subId: string,
    nextQuantity: number
  ) => {
    setSubOptions((prev) => {
      const list = prev[itemId]
      if (!list) return prev
      const nextList = list.map((sub) =>
        sub.id === subId ? { ...sub, quantity: nextQuantity } : sub
      )
      const total = nextList.reduce((sum, sub) => sum + (sub.quantity ?? 0), 0)
      setSelected((prevSelected) => ({
        ...prevSelected,
        [itemId]: total > 0,
      }))
      return {
        ...prev,
        [itemId]: nextList,
      }
    })
  }

  return (
    <div className={cn("self-stretch flex flex-col items-start gap-6", className)}>
      {showHeader ? (
        <div className="self-stretch flex flex-col items-start gap-3">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <h2 className="justify-start text-black text-3xl font-semibold font-['Geist'] leading-8">
              Furniture Selection
            </h2>
            <div className="flex h-10 items-center gap-2 rounded-md border border-neutral-200 px-3">
              <Search className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for furniture"
                className="w-56 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <p className="self-stretch justify-start text-neutral-500 text-lg font-normal font-['Geist'] leading-7">
            Add one or more requested furniture or household items.
          </p>
        </div>
      ) : null}
      <div className="self-stretch space-y-3">
        {!showHeader ? (
          <div className="flex justify-end">
            <div className="flex h-10 items-center gap-2 rounded-md border border-neutral-200 px-3">
              <Search className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for furniture"
                className="w-56 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
        ) : null}
        <div className="flex w-full flex-wrap items-center border-b border-neutral-200 pb-2">
          {catalog.categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] ?? Package
            const isActive = currentCategory === cat
            const isActiveCategory = isActive && !isSearchActive
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat)
                  setSearch("")
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 border-b-2 px-1 pb-2 text-sm font-normal transition",
                  isActiveCategory
                    ? "border-[#9E4876] text-[#1F1F1F]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      <div className="self-stretch grid items-stretch gap-xl md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const isSelected = selected[item.id] ?? false
          const qty = quantities[item.id] ?? 0
          const note = notes[item.id] ?? ""

          return (
            <FurnitureItemCard
              key={item.id}
              className="h-full w-full"
              label={item.label}
              selected={isSelected}
              quantity={qty}
              notes={note}
              subOptions={subOptions[item.id]}
              onToggle={(next) =>
                setSelected((prev) => ({ ...prev, [item.id]: next }))
              }
              onQuantityChange={(nextQty) =>
                setQuantities((prev) => ({ ...prev, [item.id]: nextQty }))
              }
              onNotesChange={(nextNotes) =>
                setNotes((prev) => ({ ...prev, [item.id]: nextNotes }))
              }
              onSubQuantityChange={(subId, nextQty) =>
                setSubOptions((prev) => {
                  const list = prev[item.id]
                  if (!list) return prev
                  return {
                    ...prev,
                    [item.id]: list.map((sub) =>
                      sub.id === subId ? { ...sub, quantity: nextQty } : sub
                    ),
                  }
                })
              }
            />
          )
        })}
      </div>


      {showSummary ? (
        <section className="self-stretch mt-8 space-y-4">
          <h3 className="text-[24px] font-semibold tracking-[-1px] text-foreground">
            Summary
          </h3>
          <SummaryList
            items={catalog.items}
            selected={selected}
            quantities={quantities}
            notes={notes}
            subOptions={subOptions}
            onQuantityChange={handleSummaryQuantityChange}
            onSubQuantityChange={handleSummarySubQuantityChange}
          />
        </section>
      ) : null}
    </div>
  )
}
