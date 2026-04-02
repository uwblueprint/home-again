"use client"

import { useState } from "react"
import FurnitureItemCard from "@/components/referral-form/FurnitureItemCard"
import SummaryList from "@/components/referral-form/SummaryList"
import { cn } from "@/lib/utils"

type Item = {
  id: string
  label: string
  category: string
}

const SAMPLE_ITEMS: Item[] = [
  { id: "sofa", label: "Sofa/Couch", category: "Seating" },
  { id: "table", label: "Dining Table", category: "Tables" },
  { id: "bed", label: "Mattress Only", category: "Bed" },
  { id: "box", label: "Box Spring Only", category: "Bed" },
  { id: "metal", label: "Metal Bed Frame", category: "Bed" },
  { id: "captain", label: "Captain's/Mate's Bed", category: "Bed" },
]

const CATEGORIES = [
  "Seating",
  "Storage & Shelving",
  "Bed",
  "Household",
  "Electronics",
  "Tables",
]

export default function ReferralFormDevPage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    sofa: true,
  })
  const [subOptions, setSubOptions] = useState<Record<
    string,
    { id: string; label: string; quantity: number }[]
  >>({
    bed: [
      { id: "twin", label: "Twin", quantity: 2 },
      { id: "double", label: "Double", quantity: 1 },
      { id: "queen", label: "Queen", quantity: 0 },
    ],
    box: [
      { id: "twin", label: "Twin", quantity: 2 },
      { id: "double", label: "Double", quantity: 1 },
      { id: "queen", label: "Queen", quantity: 0 },
    ],
    metal: [
      { id: "twdb", label: "TW/DB", quantity: 1 },
      { id: "dbqn", label: "DB/QN", quantity: 0 },
    ],
  })
  const [quantities, setQuantities] = useState<Record<string, number>>({
    sofa: 1,
    table: 1,
    bed: 0,
    box: 0,
    metal: 0,
    captain: 0,
  })
  const [notes, setNotes] = useState<Record<string, string>>({
    sofa: "",
    table: "",
    bed: "",
    box: "",
    metal: "",
    captain: "",
  })

  const [activeCategory, setActiveCategory] = useState<string>("Bed")
  const [search, setSearch] = useState("")

  const filteredItems = SAMPLE_ITEMS.filter((item) => {
    const inCategory = item.category === activeCategory
    const matchesSearch = item.label.toLowerCase().includes(search.toLowerCase())
    return inCategory && matchesSearch
  })

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.08em] text-muted-foreground">
          Referral Form · Dev Preview
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          Furniture Item Card
        </h1>
        <p className="text-muted-foreground">
          Toggle an item to reveal the quantity stepper and notes input. This
          page is for UI/dev testing only.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition",
              activeCategory === cat
                ? "border-[#9E4876] text-[#9E4876]"
                : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
            )}
          >
            {cat}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1">
          <span className="text-neutral-400">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for furniture"
            className="w-48 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const isSelected = selected[item.id] ?? false
          const qty = quantities[item.id] ?? 0
          const note = notes[item.id] ?? ""

          return (
            <FurnitureItemCard
              key={item.id}
              className="w-full"
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

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Summary</h2>
        <SummaryList
          items={SAMPLE_ITEMS}
          selected={selected}
          quantities={quantities}
          notes={notes}
          subOptions={subOptions}
        />
      </section>
    </main>
  )
}
