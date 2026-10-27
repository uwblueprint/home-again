import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the typography tokens (styles/typography.css) as font sizes.
// Otherwise tailwind-merge reads `text-paragraph-small` as a text color and
// drops it whenever a color like `text-foreground` is in the same cn() call.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "heading-1",
            "heading-2",
            "heading-3",
            "heading-4",
            "paragraph-large",
            "paragraph-regular",
            "paragraph-small",
            "paragraph-mini",
            "caption",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
