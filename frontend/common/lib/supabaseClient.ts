import { createClient } from "@supabase/supabase-js";

import { config } from "@/common/constants/config";

export const supabase = createClient(
  config.supabase.url || "https://placeholder.supabase.co",
  config.supabase.anonKey || "public-anon-key"
);
