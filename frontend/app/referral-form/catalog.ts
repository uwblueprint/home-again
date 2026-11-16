"use client";

import { useMemo } from "react";

import { useInventory } from "@/common/hooks/useApi";
import type { InventoryItem } from "@/common/types";

/**
 * The items the referral form offers. Loaded from GET /inventory; the bundled
 * list below is shown while that loads or if it fails. The inventory table was
 * seeded from this same list, so ids line up: an unsized item's id is its
 * inventory id, and a size's inventory id is `${itemId}-${sizeId}`.
 */

export type Item = {
  id: string;
  label: string;
  category: string;
};

export type SubOption = { id: string; label: string; quantity: number };

export interface ReferralCatalog {
  items: Item[];
  /** Sizes for items that come in sizes, keyed by item id. */
  subOptions: Record<string, SubOption[]>;
  categories: string[];
}

const FALLBACK_CATEGORIES = [
  "Seating",
  "Storage and Shelving",
  "Bed",
  "Electronics",
  "Tables",
];

const FALLBACK_ITEMS: Item[] = [
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
  { id: "desk-chair", label: "Desk Chair", category: "Seating" },
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
    id: "laundry-basket",
    label: "Laundry Basket",
    category: "Storage and Shelving",
  },
  { id: "hangers", label: "Hangers", category: "Storage and Shelving" },
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
    id: "clock",
    label: "Clock",
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
];

const FALLBACK_SUB_OPTIONS: Record<string, SubOption[]> = {
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
};

export const FALLBACK_CATALOG: ReferralCatalog = {
  items: FALLBACK_ITEMS,
  subOptions: FALLBACK_SUB_OPTIONS,
  categories: FALLBACK_CATEGORIES,
};

/** "TW/DB" → "tw-db", matching the inventory ids' size suffixes. */
function slug(value: string) {
  return value.trim().toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-");
}

/** The inventory row a requested item (and size, if any) refers to. */
export function inventoryIdFor(itemId: string, sizeId?: string) {
  return sizeId ? `${itemId}-${sizeId}` : itemId;
}

/**
 * Group inventory rows back into the form's shape: one item per type, with a
 * size list for types that have one row per size.
 */
export function catalogFromInventory(rows: InventoryItem[]): ReferralCatalog {
  const sorted = [...rows].sort((a, b) => a.position - b.position);
  const items: Item[] = [];
  const subOptions: Record<string, SubOption[]> = {};
  const categories: string[] = [];

  for (const row of sorted) {
    if (!categories.includes(row.category)) categories.push(row.category);

    if (!row.size) {
      items.push({ id: row.id, label: row.name, category: row.category });
      continue;
    }

    const sizeId = slug(row.size);
    const itemId = row.id.endsWith(`-${sizeId}`)
      ? row.id.slice(0, -(sizeId.length + 1))
      : row.id;
    if (!subOptions[itemId]) {
      subOptions[itemId] = [];
      items.push({ id: itemId, label: row.name, category: row.category });
    }
    subOptions[itemId].push({ id: sizeId, label: row.size, quantity: 0 });
  }

  return { items, subOptions, categories };
}

/** Item selections, as the furniture step keeps them. */
type Selections = {
  selected: Record<string, boolean>;
  subOptions: Record<string, SubOption[]>;
};

/**
 * Merge a newly loaded catalog's sizes into the form's. Each item gets the
 * catalog's sizes in its order, keeping quantities already chosen, plus any
 * chosen size the catalog doesn't list, so a selection is never lost.
 */
export function mergeSubOptions(
  catalogSubOptions: Record<string, SubOption[]>,
  current: Record<string, SubOption[]>
): Record<string, SubOption[]> {
  const merged: Record<string, SubOption[]> = { ...current };
  for (const [itemId, sizes] of Object.entries(catalogSubOptions)) {
    const previous = current[itemId] ?? [];
    const chosen = (sizeId: string) =>
      previous.find((option) => option.id === sizeId)?.quantity ?? 0;
    merged[itemId] = [
      ...sizes.map((size) => ({ ...size, quantity: chosen(size.id) })),
      ...previous.filter(
        (option) =>
          option.quantity > 0 && !sizes.some((size) => size.id === option.id)
      ),
    ];
  }
  return merged;
}

/**
 * The catalog's items, plus any bundled item that has a selection but isn't in
 * the catalog (picked before inventory loaded), so it's still reviewed and
 * submitted rather than silently dropped.
 */
export function itemsWithSelections(
  catalog: ReferralCatalog,
  furniture: Selections
): Item[] {
  const listed = new Set(catalog.items.map((item) => item.id));
  const extra = FALLBACK_ITEMS.filter(
    (item) =>
      !listed.has(item.id) &&
      (furniture.selected[item.id] ||
        furniture.subOptions[item.id]?.some((option) => option.quantity > 0))
  );
  return [...catalog.items, ...extra];
}

/** The referral form's items from inventory, or the bundled list until then. */
export function useReferralCatalog(): ReferralCatalog {
  const { data } = useInventory();
  return useMemo(
    () => (data?.length ? catalogFromInventory(data) : FALLBACK_CATALOG),
    [data]
  );
}
