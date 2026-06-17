import type { Route } from "@/common/types";

export const routes: Route[] = [
  {
    id: "route-001",
    date: "2024-07-15",
    pickup_furniture_ids: "furn-001,furn-002,furn-003",
    dropoff_furniture_ids: "furn-004,furn-005",
    created_at: "2024-07-10T08:00:00Z",
    updated_at: "2024-07-14T16:30:00Z",
  },
  {
    id: "route-002",
    date: "2024-07-16",
    pickup_furniture_ids: "furn-006",
    dropoff_furniture_ids: null,
    created_at: "2024-07-11T09:15:00Z",
    updated_at: "2024-07-15T11:00:00Z",
  },
];
