/**
 * Formats ISO date strings to a readable format.
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
