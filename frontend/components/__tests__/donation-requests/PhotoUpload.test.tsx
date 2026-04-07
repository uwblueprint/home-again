import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PhotoUpload from "../../donation-requests/PhotoUpload";

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | undefined | null | false)[]) =>
    inputs.filter(Boolean).join(" "),
}));

global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

// Helpers

function createFile(name: string) {
  return new File([""], name, { type: "image/png" });
}

function renderDialog(
  props: Partial<React.ComponentProps<typeof PhotoUpload>> = {},
) {
  const defaultProps: React.ComponentProps<typeof PhotoUpload> = {
    open: true,
    onOpenChange: jest.fn(),
    currentPhotos: [],
    onSave: jest.fn(),
    ...props,
  };
  return { ...render(<PhotoUpload {...defaultProps} />), defaultProps };
}

function selectFiles(input: HTMLElement, files: File[]) {
  Object.defineProperty(input, "files", {
    value: files,
    configurable: true,
    writable: true,
  });
  fireEvent.change(input);
}

// Tests

describe("PhotoUpload", () => {
  beforeEach(() => {
    (global.URL.createObjectURL as jest.Mock).mockClear();
    (global.URL.revokeObjectURL as jest.Mock).mockClear();
  });

  describe("rendering", () => {
    it("renders dialog content when open", () => {
      renderDialog({ open: true });
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByText("Upload photos of your item"),
      ).toBeInTheDocument();
      expect(screen.getByText("Max 5 uploads")).toBeInTheDocument();
    });

    it("renders nothing when closed", () => {
      renderDialog({ open: false });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("initializes thumbnails from currentPhotos when opened", () => {
      const file = createFile("existing.png");
      renderDialog({ currentPhotos: [file] });
      expect(screen.getByAltText("existing.png")).toBeInTheDocument();
    });

    it("clamps currentPhotos to MAX_PHOTOS on open and shows overflow message", () => {
      const files = Array.from({ length: 7 }, (_, i) =>
        createFile(`existing-${i}.png`),
      );
      renderDialog({ currentPhotos: files });

      expect(screen.getAllByRole("img")).toHaveLength(5);
      expect(
        screen.getByText(/Only 5 photos allowed\. 2 files were discarded\./),
      ).toBeInTheDocument();
      expect(screen.queryByAltText("existing-5.png")).not.toBeInTheDocument();
      expect(screen.queryByAltText("existing-6.png")).not.toBeInTheDocument();
    });

    it("moves focus to the first focusable element when opened", () => {
      renderDialog({ open: true });
      expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
    });
  });

  describe("Save button", () => {
    it("is disabled when no photos are pending", () => {
      renderDialog({ currentPhotos: [] });
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    it("is enabled after files are selected", () => {
      renderDialog({ currentPhotos: [] });
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [createFile("photo.png")]);
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });

    it("is enabled when initialized with currentPhotos", () => {
      renderDialog({ currentPhotos: [createFile("photo.png")] });
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });
  });

  describe("Save and Cancel", () => {
    it("calls onSave with pending photos and closes dialog when Save is clicked", () => {
      const onSave = jest.fn();
      const onOpenChange = jest.fn();
      renderDialog({ onSave, onOpenChange });

      const file = createFile("photo.png");
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [file]);

      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      expect(onSave).toHaveBeenCalledWith([file]);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("calls onOpenChange(false) without calling onSave when Cancel is clicked", () => {
      const onSave = jest.fn();
      const onOpenChange = jest.fn();
      renderDialog({ onSave, onOpenChange });

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSave).not.toHaveBeenCalled();
    });

    it("releases pending preview URLs when Cancel is clicked", () => {
      const onOpenChange = jest.fn();
      renderDialog({ onOpenChange });

      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [createFile("cancel.png")]);
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("calls onOpenChange(false) without calling onSave when X is clicked", () => {
      const onSave = jest.fn();
      const onOpenChange = jest.fn();
      renderDialog({ onSave, onOpenChange });

      fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSave).not.toHaveBeenCalled();
    });

    it("closes when Escape is pressed", () => {
      const onOpenChange = jest.fn();
      renderDialog({ onOpenChange });

      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("thumbnails", () => {
    it("shows a thumbnail for each selected file", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [createFile("a.png"), createFile("b.png")]);
      expect(screen.getAllByRole("img")).toHaveLength(2);
    });

    it("removes a thumbnail when its remove button is clicked", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [createFile("a.png")]);
      expect(screen.getByAltText("a.png")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Remove a.png" }));

      expect(screen.queryByAltText("a.png")).not.toBeInTheDocument();
    });

    it("releases preview URL when a thumbnail is removed", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [createFile("release.png")]);

      fireEvent.click(screen.getByRole("button", { name: "Remove release.png" }));

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("overflow / max photos", () => {
    it("shows error message when selected files exceed MAX_PHOTOS", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      const files = Array.from({ length: 6 }, (_, i) =>
        createFile(`photo${i}.png`),
      );
      selectFiles(input, files);

      expect(
        screen.getByText(/Only 5 photos allowed\. 1 file was discarded\./),
      ).toBeInTheDocument();
    });

    it("applies destructive border to file input when overflow occurs", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      const files = Array.from({ length: 6 }, (_, i) =>
        createFile(`photo${i}.png`),
      );
      selectFiles(input, files);

      expect(input.className).toContain("border-destructive");
    });

    it("only accepts photos up to MAX_PHOTOS limit", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      const files = Array.from({ length: 7 }, (_, i) =>
        createFile(`photo${i}.png`),
      );
      selectFiles(input, files);

      expect(screen.getAllByRole("img")).toHaveLength(5);
    });

    it("shows overflow error and keeps first files when current photos already exist", () => {
      renderDialog({ currentPhotos: [createFile("existing.png")] });
      const input = screen.getByLabelText("Choose files");
      const files = Array.from({ length: 5 }, (_, i) =>
        createFile(`new-${i}.png`),
      );
      selectFiles(input, files);

      expect(screen.getAllByRole("img")).toHaveLength(5);
      expect(
        screen.getByText(/Only 5 photos allowed\. 1 file was discarded\./),
      ).toBeInTheDocument();
      expect(screen.queryByAltText("new-4.png")).not.toBeInTheDocument();
    });
  });

  describe("reset on re-open", () => {
    it("resets pending photos to currentPhotos when re-opened", () => {
      const onOpenChange = jest.fn();

      const { rerender } = render(
        <PhotoUpload
          open={true}
          onOpenChange={onOpenChange}
          currentPhotos={[]}
          onSave={jest.fn()}
        />,
      );

      // Add a file while open
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [createFile("added.png")]);
      expect(screen.getAllByRole("img")).toHaveLength(1);

      // Close
      rerender(
        <PhotoUpload
          open={false}
          onOpenChange={onOpenChange}
          currentPhotos={[]}
          onSave={jest.fn()}
        />,
      );

      // Re-open with empty currentPhotos
      rerender(
        <PhotoUpload
          open={true}
          onOpenChange={onOpenChange}
          currentPhotos={[]}
          onSave={jest.fn()}
        />,
      );

      // Pending photos should be reset — no thumbnails
      expect(screen.queryAllByRole("img")).toHaveLength(0);
    });
  });

  describe("focus trap", () => {
    it("wraps focus from last to first on Tab", () => {
      renderDialog();

      const dialog = screen.getByRole("dialog");
      const closeBtn = screen.getByRole("button", { name: "Close dialog" });
      const cancelBtn = screen.getByRole("button", { name: "Cancel" });

      cancelBtn.focus();
      expect(cancelBtn).toHaveFocus();

      fireEvent.keyDown(dialog, { key: "Tab" });
      expect(closeBtn).toHaveFocus();
    });

    it("wraps focus from first to last on Shift+Tab", () => {
      renderDialog();

      const dialog = screen.getByRole("dialog");
      const closeBtn = screen.getByRole("button", { name: "Close dialog" });
      const cancelBtn = screen.getByRole("button", { name: "Cancel" });

      closeBtn.focus();
      expect(closeBtn).toHaveFocus();

      fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
      expect(cancelBtn).toHaveFocus();
    });
  });
});
