"use client"

import { useState } from "react"
import FurnitureItemCard from "@/components/referral-form/FurnitureItemCard"

type Item = {
  id: string
  label: string
}

const SAMPLE_ITEMS: Item[] = [
  { id: "sofa", label: "Sofa/Couch" },
  { id: "table", label: "Dining Table" },
  { id: "bed", label: "Mattress Only" },
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
  })
  const [quantities, setQuantities] = useState<Record<string, number>>({
    sofa: 1,
    table: 1,
    bed: 1,
  })
  const [notes, setNotes] = useState<Record<string, string>>({
    sofa: "",
    table: "",
    bed: "",
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_ITEMS.map((item) => {
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
    </main>
  )
}
