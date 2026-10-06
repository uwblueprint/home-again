import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the custom font sizes from app/globals.css so tailwind-merge treats
// `text-paragraph-small` etc. as font sizes instead of colors. Otherwise a
// later `text-<color>` class silently removes them.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
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
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
