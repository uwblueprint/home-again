/**
 * Get the API base URL from environment variables.
 * Works in both browser and server contexts (Next.js).
 */
export function getAPIBaseURL(): string {
  // In Next.js client components, use NEXT_PUBLIC_API_URL
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }
  // In server components or server-side code
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}
