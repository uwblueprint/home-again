import { inventory } from "@/mocks/fixtures/inventory";
import {
  FALLBACK_CATALOG,
  catalogFromInventory,
  inventoryIdFor,
} from "./catalog";

describe("catalogFromInventory", () => {
  it("rebuilds the bundled list from inventory rows", () => {
    const catalog = catalogFromInventory(inventory);
    expect(catalog.items).toEqual(FALLBACK_CATALOG.items);
    expect(catalog.categories).toEqual(FALLBACK_CATALOG.categories);
    expect(catalog.subOptions).toEqual(FALLBACK_CATALOG.subOptions);
  });

  it("groups sized rows under one item, in position order", () => {
    const catalog = catalogFromInventory([
      {
        ...inventory[0],
        id: "mattress-only-queen",
        name: "Mattress Only",
        size: "Queen",
        category: "Bed",
        position: 2,
      },
      {
        ...inventory[0],
        id: "mattress-only-twin",
        name: "Mattress Only",
        size: "Twin",
        category: "Bed",
        position: 1,
      },
      {
        ...inventory[0],
        id: "futon",
        name: "Futon",
        size: null,
        category: "Seating",
        position: 0,
      },
    ]);
    expect(catalog.items.map((item) => item.id)).toEqual([
      "futon",
      "mattress-only",
    ]);
    expect(catalog.subOptions["mattress-only"].map((s) => s.id)).toEqual([
      "twin",
      "queen",
    ]);
    expect(catalog.categories).toEqual(["Seating", "Bed"]);
  });
});

describe("inventoryIdFor", () => {
  it("uses the item id, plus the size for sized items", () => {
    expect(inventoryIdFor("sofa-couch")).toBe("sofa-couch");
    expect(inventoryIdFor("metal-bed-frame", "tw-db")).toBe(
      "metal-bed-frame-tw-db"
    );
  });
});
