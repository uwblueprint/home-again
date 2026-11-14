import { FALLBACK_CATALOG, inventoryIdFor } from "@/app/referral-form/catalog";
import type { InventoryItem } from "@/common/types";

const NOW = "2026-11-14T00:00:00";

/**
 * Sample GET /inventory response: the referral form's items, one row per size,
 * like the migration seeds them. A few have stock so the counts aren't all 0.
 */
type Row = Pick<InventoryItem, "id" | "name" | "size" | "category">;

export const inventory: InventoryItem[] = FALLBACK_CATALOG.items
  .flatMap((item): Row[] => {
    const sizes = FALLBACK_CATALOG.subOptions[item.id];
    return sizes
      ? sizes.map((size) => ({
          id: inventoryIdFor(item.id, size.id),
          name: item.label,
          size: size.label,
          category: item.category,
        }))
      : [
          {
            id: item.id,
            name: item.label,
            size: null,
            category: item.category,
          },
        ];
  })
  .map((row, position) => ({
    ...row,
    quantity: position % 3 === 0 ? 2 : 0,
    position,
    created_at: NOW,
    updated_at: NOW,
  }));
