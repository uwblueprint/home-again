type HighlightTextProps = {
  text: string;
  query?: string;
  className?: string;
};

/**
 * Highlights case-insensitive substrings matching `query`. Uses `bg-muted`
 * so the mark stays visible on both white rows and hovered (`bg-muted/50`) rows.
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
            className="rounded-sm bg-muted text-inherit"
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
