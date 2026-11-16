import { http, HttpResponse } from "msw";
import { inventory } from "../fixtures/inventory";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export const inventoryHandlers = [
  http.get(`${BASE}/inventory`, () => HttpResponse.json(inventory)),

  http.get(`${BASE}/inventory/:id`, ({ params }) => {
    const item = inventory.find((row) => row.id === params.id);
    return item
      ? HttpResponse.json(item)
      : HttpResponse.json(
          { detail: "Inventory item not found" },
          { status: 404 }
        );
  }),
];
