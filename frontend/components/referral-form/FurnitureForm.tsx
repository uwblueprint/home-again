"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bed,
  LampDesk,
  Package,
  PlugZap,
  Search,
  Sofa,
  Utensils,
} from "lucide-react"

import FurnitureItemCard from "@/components/referral-form/FurnitureItemCard"
import SummaryList from "@/components/referral-form/SummaryList"
import { cn } from "@/lib/utils"

type Item = {
  id: string
  label: string
  category: string
}

type FurnitureFormProps = {
  className?: string
  showHeader?: boolean
  showSummary?: boolean
  onValidityChange?: (isValid: boolean) => void
}

const CATEGORIES = [
  "Seating",
  "Storage and Shelving",
  "Bed",
  "Household",
  "Electronics",
  "Tables",
]

const ITEMS: Item[] = [
  { id: "sofa-couch", label: "Sofa/Couch", category: "Seating" },
  { id: "love-seat", label: "Love Seat", category: "Seating" },
  {
    id: "rocker-glider-recliner",
    label: "Rocker/Glider/Recliner",
    category: "Seating",
  },
  {
    id: "kitchen-dining-chair",
    label: "Kitchen/Dining Chair",
    category: "Seating",
  },
  {
    id: "upholstered-arm-chair",
    label: "Upholstered Arm Chair",
    category: "Seating",
  },
  { id: "dresser", label: "Dresser", category: "Storage and Shelving" },
  {
    id: "youth-small-dresser",
    label: "Youth/Small Dresser",
    category: "Storage and Shelving",
  },
  {
    id: "night-stand",
    label: "Night Stand",
    category: "Storage and Shelving",
  },
  { id: "armoire", label: "Armoire", category: "Storage and Shelving" },
  { id: "bookcase", label: "Bookcase", category: "Storage and Shelving" },
  {
    id: "microwave-stand",
    label: "Microwave Stand",
    category: "Storage and Shelving",
  },
  { id: "tv-stand", label: "TV Stand", category: "Storage and Shelving" },
  {
    id: "box-spring-only",
    label: "Box Spring Only",
    category: "Bed",
  },
  {
    id: "mattress-only",
    label: "Mattress Only",
    category: "Bed",
  },
  {
    id: "metal-bed-frame",
    label: "Metal Bed Frame",
    category: "Bed",
  },
  {
    id: "captains-bed",
    label: "Captain's/Mate's Bed",
    category: "Bed",
  },

  { id: "toaster", label: "Toaster", category: "Electronics" },
  { id: "radio", label: "Radio", category: "Electronics" },
  { id: "cutlery", label: "Cutlery", category: "Household" },
  { id: "dishes", label: "Dishes", category: "Household" },
  { id: "glasses", label: "Glasses", category: "Household" },
  { id: "kettle", label: "Kettle", category: "Household" },
  { id: "towels", label: "Towels", category: "Household" },
  { id: "rug", label: "Rug", category: "Household" },
  {
    id: "misc-household-item",
    label: "Misc. Household Item",
    category: "Household",
  },
  {
    id: "table-lamp",
    label: "Table Lamp",
    category: "Electronics",
  },
  {
    id: "coffee-maker",
    label: "Coffee Maker",
    category: "Electronics",
  },
  {
    id: "cooking-pots",
    label: "Cooking Pots",
    category: "Household",
  },
  {
    id: "frying-pans",
    label: "Frying Pans",
    category: "Household",
  },
  {
    id: "microwave",
    label: "Microwave",
    category: "Electronics",
  },
  {
    id: "flatscreen-tv",
    label: "Flatscreen T.V.",
    category: "Electronics",
  },
  {
    id: "dining-kitchen-table",
    label: "Dining/Kitchen Table",
    category: "Tables",
  },
  {
    id: "side-end-table",
    label: "Side/End Table",
    category: "Tables",
  },
  {
    id: "coffee-table",
    label: "Coffee Table",
    category: "Tables",
  },
  { id: "desk", label: "Desk", category: "Tables" },
]

const SUB_OPTIONS: Record<
  string,
  { id: string; label: string; quantity: number }[]
> = {
  "box-spring-only": [
    { id: "twin", label: "Twin", quantity: 0 },
    { id: "double", label: "Double", quantity: 0 },
    { id: "queen", label: "Queen", quantity: 0 },
  ],
  "mattress-only": [
    { id: "twin", label: "Twin", quantity: 0 },
    { id: "double", label: "Double", quantity: 0 },
    { id: "queen", label: "Queen", quantity: 0 },
  ],
  "metal-bed-frame": [
    { id: "tw-db", label: "TW/DB", quantity: 0 },
    { id: "db-qn", label: "DB/QN", quantity: 0 },
  ],
}

const buildDefaults = (value: number) =>
  Object.fromEntries(ITEMS.map((item) => [item.id, value]))

const CATEGORY_ICONS: Record<string, typeof Sofa> = {
  Seating: Sofa,
  "Storage and Shelving": Package,
  Bed: Bed,
  Household: Utensils,
  Electronics: PlugZap,
  Tables: LampDesk,
}

export default function FurnitureForm({
  className,
  showHeader = true,
  showSummary = true,
  onValidityChange,
}: FurnitureFormProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [subOptions, setSubOptions] = useState(SUB_OPTIONS)
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    buildDefaults(0)
  )
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(ITEMS.map((item) => [item.id, ""]))
  )

  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0])
  const [search, setSearch] = useState("")

  const isSearchActive = search.trim().length > 0

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return ITEMS.filter((item) => {
      const matchesSearch = normalizedSearch
        ? item.label.toLowerCase().includes(normalizedSearch)
        : true
      const matchesCategory = normalizedSearch
        ? true
        : item.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [activeCategory, search])

  const hasSizeError = useMemo(() => {
    return ITEMS.some((item) => {
      if (!selected[item.id]) return false
      const subs = subOptions[item.id]
      if (!subs?.length) return false
      const total = subs.reduce((sum, sub) => sum + (sub.quantity ?? 0), 0)
      return total === 0
    })
  }, [selected, subOptions])

  useEffect(() => {
    onValidityChange?.(!hasSizeError)
  }, [hasSizeError, onValidityChange])

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
    <section className={cn("space-y-5", className)}>
      {showHeader ? (
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[30px] font-semibold tracking-[-1px] text-foreground">
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
          <p className="text-[18px] font-normal text-muted-foreground">
            Add one or more requested furniture or household items.
          </p>
        </header>
      ) : null}

      <div className="space-y-3">
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
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat]
            const isActive = activeCategory === cat
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

      <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const isSelected = selected[item.id] ?? false
          const qty = quantities[item.id] ?? 0
          const note = notes[item.id] ?? ""

          return (
            <FurnitureItemCard
              key={item.id}
              className="w-full self-start"
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
        <section className="mt-8 space-y-4">
          <h3 className="text-[24px] font-semibold tracking-[-1px] text-foreground">
            Summary
          </h3>
          <SummaryList
            items={ITEMS}
            selected={selected}
            quantities={quantities}
            notes={notes}
            subOptions={subOptions}
            onQuantityChange={handleSummaryQuantityChange}
            onSubQuantityChange={handleSummarySubQuantityChange}
          />
        </section>
      ) : null}
    </section>
  )
}
