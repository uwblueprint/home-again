/** Matches a date-only ISO string, e.g. "2026-03-14". */
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse an ISO string for display.
 *
 * Date-only strings ("2026-03-14") are parsed as UTC midnight per the ECMAScript
 * spec, so formatting them in local time renders the *previous* day anywhere west
 * of UTC — including all of Newfoundland. Those are built in local time instead.
 * Strings carrying a time are left to the platform parser, which handles offsets.
 */
function parseForDisplay(dateString: string): Date {
  const dateOnly = DATE_ONLY.exec(dateString);
  if (!dateOnly) return new Date(dateString);

  const [, year, month, day] = dateOnly;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/**
 * Formats ISO date strings to a readable format.
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "—";

  const date = parseForDisplay(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats an ISO date string to a compact "Mar 26" label.
 */
export function formatShortDate(dateString: string): string {
  if (!dateString) return "—";

  const date = parseForDisplay(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
