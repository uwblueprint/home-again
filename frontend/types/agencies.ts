import type { Agency } from "./index";

export type AgencyFormValues = Omit<Agency, "id" | "created_at" | "updated_at">;
