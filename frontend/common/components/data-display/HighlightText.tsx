import type { ReactNode } from "react";

import { cn } from "@/common/lib/utils";

type HighlightTextProps = {
  text: string;
  query?: string;
  className?: string;
};

/**
 * Highlights case-insensitive substrings matching `query` using the
 * unofficial secondary hover token from the design system.
 */
export function HighlightText({ text, query, className }: HighlightTextProps) {
  const trimmed = query?.trim() ?? "";
  if (!trimmed) {
    return <span className={className}>{text}</span>;
  }

  const parts = splitByQuery(text, trimmed);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.isMatch ? (
          <mark
            key={`${part.value}-${index}`}
            className="rounded-sm bg-[var(--unofficial-secondary-hover)] text-inherit"
          >
            {part.value}
          </mark>
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        )
      )}
    </span>
  );
}

function splitByQuery(
  text: string,
  query: string
): { value: string; isMatch: boolean }[] {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: { value: string; isMatch: boolean }[] = [];
  let start = 0;

  while (start < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, start);
    if (matchIndex === -1) {
      parts.push({ value: text.slice(start), isMatch: false });
      break;
    }
    if (matchIndex > start) {
      parts.push({ value: text.slice(start, matchIndex), isMatch: false });
    }
    parts.push({
      value: text.slice(matchIndex, matchIndex + query.length),
      isMatch: true,
    });
    start = matchIndex + query.length;
  }

  return parts;
}

export type DataTableSearchEmptyStateProps = {
  query: string;
  className?: string;
  children?: ReactNode;
};

export function DataTableSearchEmptyState({
  query,
  className,
}: DataTableSearchEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[280px] flex-col items-center justify-center gap-xs rounded-xl border border-border px-xl py-2xl text-center",
        className
      )}
      data-testid="data-table-search-empty"
    >
      <p className="text-heading-3 font-semibold text-muted-foreground">
        Search not found
      </p>
      <p className="text-paragraph-small text-muted-foreground">
        No results found for &apos;{query}&apos;
      </p>
    </div>
  );
}
