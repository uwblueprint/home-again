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
if (
  config.isDevelopment &&
  config.supabase.url &&
  !isHttpUrl(config.supabase.url)
) {
  console.warn(
    "NEXT_PUBLIC_SUPABASE_URL is not a valid URL; Supabase auth is disabled."
  );
}

export const supabase = createClient(
  isHttpUrl(config.supabase.url) ? config.supabase.url : fallbackUrl,
  config.supabase.anonKey || "public-anon-key"
);
