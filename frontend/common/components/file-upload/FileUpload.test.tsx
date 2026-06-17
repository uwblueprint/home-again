import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FileUpload from "./FileUpload";

jest.mock("@/common/lib/utils", () => ({
  cn: (...inputs: (string | undefined | null | false)[]) =>
    inputs.filter(Boolean).join(" "),
}));

global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

// Helpers

function createFile(name: string, type = "image/png") {
  return new File([""], name, { type });
}

function renderDialog(
  props: Partial<React.ComponentProps<typeof FileUpload>> = {}
) {
  const defaultProps: React.ComponentProps<typeof FileUpload> = {
    open: true,
    onOpenChange: jest.fn(),
    currentFiles: [],
    onSave: jest.fn(),
    ...props,
  };
  return { ...render(<FileUpload {...defaultProps} />), defaultProps };
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

describe("FileUpload", () => {
  beforeEach(() => {
    (global.URL.createObjectURL as jest.Mock).mockClear();
    (global.URL.revokeObjectURL as jest.Mock).mockClear();
  });

  describe("rendering", () => {
    it("renders dialog content when open", () => {
      renderDialog({ open: true });
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Upload files")).toBeInTheDocument();
      expect(screen.getByText("Maximum 5 uploads")).toBeInTheDocument();
    });

    it("renders a custom title and description", () => {
      renderDialog({
        title: "Upload your resume",
        description: "PDF only, up to 1 file",
      });
      expect(screen.getByText("Upload your resume")).toBeInTheDocument();
      expect(screen.getByText("PDF only, up to 1 file")).toBeInTheDocument();
    });

    it("derives the default description from maxFiles", () => {
      renderDialog({ maxFiles: 3 });
      expect(screen.getByText("Maximum 3 uploads")).toBeInTheDocument();
    });

    it("renders nothing when closed", () => {
      renderDialog({ open: false });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("initializes thumbnails from currentFiles when opened", () => {
      const file = createFile("existing.png");
      renderDialog({ currentFiles: [file] });
      expect(screen.getByAltText("existing.png")).toBeInTheDocument();
    });

    it("clamps currentFiles to maxFiles on open and shows overflow message", () => {
      const files = Array.from({ length: 7 }, (_, i) =>
        createFile(`existing-${i}.png`)
      );
      renderDialog({ currentFiles: files });

      expect(screen.getAllByRole("img")).toHaveLength(5);
      expect(
        screen.getByText(
          /You can upload up to 5 files\. 2 files weren't added\./
        )
      ).toBeInTheDocument();
      expect(screen.queryByAltText("existing-5.png")).not.toBeInTheDocument();
      expect(screen.queryByAltText("existing-6.png")).not.toBeInTheDocument();
    });

    it("labels the dialog with its title for assistive tech", () => {
      renderDialog({ title: "Upload files" });
      expect(
        screen.getByRole("dialog", { name: "Upload files" })
      ).toBeInTheDocument();
    });
  });

  describe("accepted file types", () => {
    it("passes the accept prop through to the file input", () => {
      renderDialog({ accept: ".pdf,application/pdf" });
      expect(screen.getByLabelText("Choose files")).toHaveAttribute(
        "accept",
        ".pdf,application/pdf"
      );
    });

    it("ignores files whose type is not accepted", () => {
      renderDialog({ accept: "image/*" });
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [
        createFile("photo.png", "image/png"),
        createFile("notes.txt", "text/plain"),
      ]);

      expect(screen.getByAltText("photo.png")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
      // Only the image was kept; the text file was filtered out.
      expect(screen.getAllByRole("img")).toHaveLength(1);
    });

    it("accepts files matched by extension", () => {
      renderDialog({ accept: ".pdf" });
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [
        createFile("report.pdf", "application/pdf"),
        createFile("photo.png", "image/png"),
      ]);

      expect(screen.getByText("report.pdf")).toBeInTheDocument();
      expect(screen.queryByText("photo.png")).not.toBeInTheDocument();
    });

    it("accepts every file type when accept is omitted", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [
        createFile("photo.png", "image/png"),
        createFile("notes.txt", "text/plain"),
      ]);

      expect(screen.getByAltText("photo.png")).toBeInTheDocument();
      expect(screen.getByText("notes.txt")).toBeInTheDocument();
    });
  });

  describe("non-image previews", () => {
    it("renders the file name instead of an image for non-image files", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [createFile("contract.pdf", "application/pdf")]);

      expect(screen.getByText("contract.pdf")).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  describe("Save button", () => {
    it("is disabled when no files are pending", () => {
      renderDialog({ currentFiles: [] });
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    it("is enabled after files are selected", () => {
      renderDialog({ currentFiles: [] });
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [createFile("photo.png")]);
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });

    it("is enabled when initialized with currentFiles", () => {
      renderDialog({ currentFiles: [createFile("photo.png")] });
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });
  });

  describe("Save and Cancel", () => {
    it("calls onSave with pending files and closes dialog when Save is clicked", () => {
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
    it("shows a thumbnail for each selected image", () => {
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

      fireEvent.click(
        screen.getByRole("button", { name: "Remove release.png" })
      );

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("overflow / max files", () => {
    it("shows error message when selected files exceed maxFiles", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      const files = Array.from({ length: 6 }, (_, i) =>
        createFile(`photo${i}.png`)
      );
      selectFiles(input, files);

      expect(
        screen.getByText(/You can upload up to 5 files\. 1 file wasn't added\./)
      ).toBeInTheDocument();
    });

    it("respects a custom maxFiles limit", () => {
      renderDialog({ maxFiles: 2 });
      const input = screen.getByLabelText("Choose files");
      const files = Array.from({ length: 3 }, (_, i) =>
        createFile(`photo${i}.png`)
      );
      selectFiles(input, files);

      expect(screen.getAllByRole("img")).toHaveLength(2);
      expect(
        screen.getByText(/You can upload up to 2 files\. 1 file wasn't added\./)
      ).toBeInTheDocument();
    });

    it("applies destructive border to file chooser button when overflow occurs", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      const files = Array.from({ length: 6 }, (_, i) =>
        createFile(`photo${i}.png`)
      );
      selectFiles(input, files);

      const chooserButton = screen.getByRole("button", {
        name: /choose file/i,
      });
      expect(chooserButton.className).toContain(
        "border-[var(--unofficial-destructive-border)]"
      );
    });

    it("only accepts files up to the maxFiles limit", () => {
      renderDialog();
      const input = screen.getByLabelText("Choose files");
      const files = Array.from({ length: 7 }, (_, i) =>
        createFile(`photo${i}.png`)
      );
      selectFiles(input, files);

      expect(screen.getAllByRole("img")).toHaveLength(5);
    });

    it("shows overflow error and keeps first files when current files already exist", () => {
      renderDialog({ currentFiles: [createFile("existing.png")] });
      const input = screen.getByLabelText("Choose files");
      const files = Array.from({ length: 5 }, (_, i) =>
        createFile(`new-${i}.png`)
      );
      selectFiles(input, files);

      expect(screen.getAllByRole("img")).toHaveLength(5);
      expect(
        screen.getByText(/You can upload up to 5 files\. 1 file wasn't added\./)
      ).toBeInTheDocument();
      expect(screen.queryByAltText("new-4.png")).not.toBeInTheDocument();
    });

    it("renders a single-file input when maxFiles is 1", () => {
      renderDialog({ maxFiles: 1 });
      expect(screen.getByLabelText("Choose files")).not.toHaveAttribute(
        "multiple"
      );
      expect(screen.getByText("Maximum 1 uploads")).toBeInTheDocument();
    });
  });

  describe("reset on re-open", () => {
    it("resets pending files to currentFiles when re-opened", () => {
      const onOpenChange = jest.fn();

      const { rerender } = render(
        <FileUpload
          open={true}
          onOpenChange={onOpenChange}
          currentFiles={[]}
          onSave={jest.fn()}
        />
      );

      // Add a file while open
      const input = screen.getByLabelText("Choose files");
      selectFiles(input, [createFile("added.png")]);
      expect(screen.getAllByRole("img")).toHaveLength(1);

      // Close
      rerender(
        <FileUpload
          open={false}
          onOpenChange={onOpenChange}
          currentFiles={[]}
          onSave={jest.fn()}
        />
      );

      // Re-open with empty currentFiles
      rerender(
        <FileUpload
          open={true}
          onOpenChange={onOpenChange}
          currentFiles={[]}
          onSave={jest.fn()}
        />
      );

      // Pending files should be reset — no thumbnails
      expect(screen.queryAllByRole("img")).toHaveLength(0);
    });
  });
});
