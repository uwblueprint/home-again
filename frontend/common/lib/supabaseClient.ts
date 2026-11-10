import { createClient } from "@supabase/supabase-js";
import { config } from "@/common/constants/config";
const fallbackUrl = "https://placeholder.supabase.co";
const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};
export const supabase = createClient(
  isHttpUrl(config.supabase.url) ? config.supabase.url : fallbackUrl,
  config.supabase.anonKey || "public-anon-key"
);
