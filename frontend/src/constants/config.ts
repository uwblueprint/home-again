/**
 * Environment Variables
 *
 * Central location for all environment configuration.
 * All NEXT_PUBLIC_* variables are safe to expose to the client.
 */

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  isDevelopment: process.env.NODE_ENV === "development",
};
