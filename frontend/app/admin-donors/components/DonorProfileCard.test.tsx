import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import type { Donor } from "@/common/types";
import { DonorProfileCard } from "./DonorProfileCard";

function makeDonor(overrides: Partial<Donor> = {}): Donor {
  return {
    id: "donor-001",
    name: "Katie Sun",
    first_name: "Katie",
    last_name: "Sun",
    email: "katiesun@uwblueprint.org",
    phone: "647-909-9581",
    address: null,
    city: null,
    postal_code: null,
    country: null,
    smoking_household: null,
    donation_type: null,
    is_anonymous: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function renderCard(
  onSave: jest.Mock = jest.fn().mockResolvedValue(undefined),
  donor: Donor = makeDonor()
) {
  const user = userEvent.setup();
  const { rerender } = render(
    <DonorProfileCard donor={donor} onSave={onSave} />
  );
  const rerenderWith = (next: Donor) =>
    rerender(<DonorProfileCard donor={next} onSave={onSave} />);
  return { user, onSave, rerenderWith };
}

const saveButton = () => screen.getByRole("button", { name: "Save" });

async function startEditing(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Edit" }));
}

describe("DonorProfileCard", () => {
  it("shows the donor's contact details with a copy-email button", () => {
    renderCard();

    expect(screen.getByText("Katie")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("katiesun@uwblueprint.org")).toBeInTheDocument();
    expect(screen.getByText("(+1) 647-909-9581")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy email" })
    ).toBeInTheDocument();
  });

  it("prefills the form when editing and locks the email", async () => {
    const { user } = renderCard();
    await startEditing(user);

    expect(screen.getByLabelText("First name")).toHaveValue("Katie");
    expect(screen.getByLabelText("Last name")).toHaveValue("Sun");
    expect(screen.getByLabelText("Phone number")).toHaveValue("647-909-9581");
    const email = screen.getByLabelText("Email Address");
    expect(email).toHaveValue("katiesun@uwblueprint.org");
    expect(email).toBeDisabled();
  });

  it("locks the collapse toggle while editing", async () => {
    const { user } = renderCard();
    const toggle = screen.getByRole("button", {
      name: "Collapse donor information",
    });
    expect(toggle).toBeEnabled();

    await startEditing(user);

    expect(toggle).toBeDisabled();
  });

  it("enables Save only while the draft differs from the donor", async () => {
    const { user } = renderCard();
    await startEditing(user);
    expect(saveButton()).toBeDisabled();

    const firstName = screen.getByLabelText("First name");
    await user.type(firstName, "e");
    expect(saveButton()).toBeEnabled();

    await user.type(firstName, "{Backspace}");
    expect(saveButton()).toBeDisabled();
  });

  it("treats whitespace-only edits as unchanged", async () => {
    const { user } = renderCard();
    await startEditing(user);

    await user.type(screen.getByLabelText("Last name"), "  ");

    expect(saveButton()).toBeDisabled();
  });

  it("shows inline errors and does not save an invalid draft", async () => {
    const { user, onSave } = renderCard();
    await startEditing(user);

    await user.clear(screen.getByLabelText("First name"));
    const phone = screen.getByLabelText("Phone number");
    await user.clear(phone);
    await user.type(phone, "abc");
    await user.click(saveButton());

    expect(screen.getByText("Enter a first name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid phone number.")).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("clears a field's error once it is edited", async () => {
    const { user } = renderCard();
    await startEditing(user);

    const firstName = screen.getByLabelText("First name");
    await user.clear(firstName);
    await user.click(saveButton());
    expect(screen.getByText("Enter a first name.")).toBeInTheDocument();

    await user.type(firstName, "K");
    expect(screen.queryByText("Enter a first name.")).not.toBeInTheDocument();
  });

  it("saves only the changed fields, trimmed, and never the email", async () => {
    const { user, onSave } = renderCard();
    await startEditing(user);

    const firstName = screen.getByLabelText("First name");
    await user.clear(firstName);
    await user.type(firstName, "  Sonya ");
    await user.click(saveButton());

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ first_name: "Sonya" });
    expect(
      await screen.findByRole("button", { name: "Edit" })
    ).toBeInTheDocument();
  });

  it("submits on Enter", async () => {
    const { user, onSave } = renderCard();
    await startEditing(user);

    await user.type(screen.getByLabelText("Last name"), "g{Enter}");

    expect(onSave).toHaveBeenCalledWith({ last_name: "Sung" });
  });

  it("disables the actions while a save is in flight", async () => {
    let resolveSave: () => void = () => {};
    const onSave = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        })
    );
    const { user } = renderCard(onSave);
    await startEditing(user);

    await user.type(screen.getByLabelText("First name"), "e");
    await user.click(saveButton());

    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    resolveSave();
    expect(
      await screen.findByRole("button", { name: "Edit" })
    ).toBeInTheDocument();
  });

  it("discards the draft on Cancel", async () => {
    const { user, onSave } = renderCard();
    await startEditing(user);

    await user.type(screen.getByLabelText("First name"), "xyz");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Katie")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    await startEditing(user);
    expect(screen.getByLabelText("First name")).toHaveValue("Katie");
  });

  it("stays in edit mode with the draft kept when the save fails", async () => {
    const onSave = jest.fn().mockRejectedValue(new Error("Network down"));
    const { user } = renderCard(onSave);
    await startEditing(user);

    await user.type(screen.getByLabelText("First name"), "e");
    await user.click(saveButton());

    expect(
      await screen.findByText(/couldn't save your changes/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveValue("Katiee");
    expect(saveButton()).toBeEnabled();
  });

  it("doesn't overwrite fields that change underneath an edit", async () => {
    const { user, onSave, rerenderWith } = renderCard();
    await startEditing(user);

    // Someone else renames the donor; the refetched prop arrives mid-edit.
    rerenderWith(makeDonor({ first_name: "Janet" }));
    expect(saveButton()).toBeDisabled();

    const phone = screen.getByLabelText("Phone number");
    await user.clear(phone);
    await user.type(phone, "613-555-9999");
    await user.click(saveButton());

    expect(onSave).toHaveBeenCalledWith({ phone: "613-555-9999" });
  });

  it("drops an in-progress edit when switched to another donor", async () => {
    const { user, rerenderWith } = renderCard();
    await startEditing(user);
    await user.type(screen.getByLabelText("First name"), "xyz");

    rerenderWith(makeDonor({ id: "donor-002", first_name: "Robert" }));

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByText("Robert")).toBeInTheDocument();
    expect(screen.queryByLabelText("First name")).not.toBeInTheDocument();
  });

  it("shows a placeholder for missing details", () => {
    renderCard(undefined, makeDonor({ email: null, phone: null }));

    expect(screen.getAllByText("—")).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Copy email" })
    ).not.toBeInTheDocument();
  });
});
