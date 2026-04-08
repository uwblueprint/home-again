"use client"

import { useMemo, useState } from "react"
import {
  Armchair,
  Archive,
  BedDouble,
  Home,
  Plug,
  Search,
  Table2,
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

const CATEGORY_ICONS: Record<string, typeof Armchair> = {
  Seating: Armchair,
  "Storage and Shelving": Archive,
  Bed: BedDouble,
  Household: Home,
  Electronics: Plug,
  Tables: Table2,
}

export default function FurnitureForm({
  className,
  showHeader = true,
  showSummary = true,
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

  return (
    <section className={cn("space-y-5", className)}>
      {showHeader ? (
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Furniture Selection
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground">
              Add one or more requested furniture or household items.
            </p>
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1">
              <Search className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for furniture"
                className="w-48 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
        </header>
      ) : null}

      <div className="space-y-3">
        {!showHeader ? (
          <div className="flex justify-end">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1">
              <Search className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for furniture"
                className="w-48 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
        ) : null}
        <div className="flex w-full flex-wrap items-center border-b border-neutral-200 pb-2">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat]
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat)
                  setSearch("")
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 border-b-2 px-1 pb-2 text-sm font-medium transition",
                  isActive
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
          <h3 className="text-xl font-semibold text-foreground">Summary</h3>
          <SummaryList
            items={ITEMS}
            selected={selected}
            quantities={quantities}
            notes={notes}
            subOptions={subOptions}
          />
        </section>
      ) : null}
    </section>
  )
}
