import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ComponentProps } from "react";

import { PhotoLightboxDialog } from "./PhotoLightboxDialog";

const PHOTOS = [
  { url: "https://example.com/a.jpg", alt: "Photo A" },
  { url: "https://example.com/b.jpg", alt: "Photo B" },
  { url: "https://example.com/c.jpg", alt: "Photo C" },
];

function renderDialog(
  props: Partial<ComponentProps<typeof PhotoLightboxDialog>> = {}
) {
  const onOpenChange = jest.fn();
  render(
    <PhotoLightboxDialog
      open
      onOpenChange={onOpenChange}
      photos={PHOTOS}
      {...props}
    />
  );
  return { onOpenChange };
}

/** The large image is the one that is NOT inside a thumbnail button. */
function mainImageAlt(): string | null {
  const imgs = screen.getAllByRole("img");
  const main = imgs.find((img) => !img.closest("button"));
  return main?.getAttribute("alt") ?? null;
}

describe("PhotoLightboxDialog", () => {
  it("opens on the initial index", () => {
    renderDialog({ initialIndex: 1 });
    expect(mainImageAlt()).toBe("Photo B");
  });

  it("advances to the next photo", () => {
    renderDialog({ initialIndex: 0 });
    fireEvent.click(screen.getByRole("button", { name: /next photo/i }));
    expect(mainImageAlt()).toBe("Photo B");
  });

  it("wraps around when going previous from the first photo", () => {
    renderDialog({ initialIndex: 0 });
    fireEvent.click(screen.getByRole("button", { name: /previous photo/i }));
    expect(mainImageAlt()).toBe("Photo C");
  });

  it("jumps to a thumbnail when clicked", () => {
    renderDialog({ initialIndex: 0 });
    const dialog = screen.getByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "View photo 3" })
    );
    expect(mainImageAlt()).toBe("Photo C");
  });

  it("renders nothing when there are no photos", () => {
    const { container } = render(
      <PhotoLightboxDialog open onOpenChange={jest.fn()} photos={[]} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
