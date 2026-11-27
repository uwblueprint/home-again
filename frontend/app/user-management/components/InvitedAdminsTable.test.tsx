import { fireEvent, render, screen, within } from "@testing-library/react";

import { InvitedAdminsTable } from "./InvitedAdminsTable";
import type { InvitedAdminRow } from "./InvitedAdminsTableColumns";

function makeRow(overrides: Partial<InvitedAdminRow> = {}): InvitedAdminRow {
  return {
    id: "invite-1",
    name: "Jane Doe",
    role: "admin",
    email: "jane@homeagainfb.com",
    status: "invite_pending",
    hoursLeft: 48,
    ...overrides,
  };
}

function names() {
  return screen
    .getAllByTestId(/^invited-admins-data-table-row-/)
    .map((row) => within(row).getAllByRole("cell")[0].textContent);
}

describe("InvitedAdminsTable", () => {
  it("renders the invited-only columns", () => {
    render(<InvitedAdminsTable data={[makeRow()]} />);

    expect(
      screen.getAllByRole("columnheader").map((th) => th.textContent)
    ).toEqual([
      "Admin Name",
      "Email",
      "Role",
      "Status",
      "Expires In",
      "",
    ]);
  });

  it("shows the invite actions menu (Resend/Cancel) for a pending invite", () => {
    render(<InvitedAdminsTable data={[makeRow()]} />);

    const row = screen.getByTestId("invited-admins-data-table-row-0");
    expect(screen.getByText("Invite Pending")).toBeInTheDocument();

    fireEvent.click(within(row).getByRole("button"));
    expect(screen.getByText("Resend invite")).toBeInTheDocument();
    expect(screen.getByText("Cancel invite")).toBeInTheDocument();
  });

  it("shows a red trash button instead of the actions menu for an expired invite", () => {
    render(<InvitedAdminsTable data={[makeRow({ status: "invite_expired" })]} />);

    expect(screen.getByText("Invite Expired")).toBeInTheDocument();

    const row = screen.getByTestId("invited-admins-data-table-row-0");
    const button = within(row).getByRole("button");
    expect(button).toHaveAccessibleName("Delete invite for jane@homeagainfb.com");

    // No-op for now — clicking should not throw, and no menu should open.
    fireEvent.click(button);
    expect(screen.queryByText("Resend invite")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel invite")).not.toBeInTheDocument();
  });

  it("pluralizes the hours remaining and reddens it at 0", () => {
    render(
      <InvitedAdminsTable
        data={[
          makeRow({ id: "a", hoursLeft: 48 }),
          makeRow({ id: "b", hoursLeft: 1 }),
          makeRow({ id: "c", hoursLeft: 0 }),
        ]}
      />
    );

    expect(screen.getByText("48 hours")).toBeInTheDocument();
    expect(screen.getByText("1 hour")).toBeInTheDocument();

    const zeroHours = screen.getByText("0 hours");
    expect(zeroHours).toHaveClass("text-destructive");
  });

  it("defaults to soonest-to-expire first, then superadmin, then name", () => {
    const rows: InvitedAdminRow[] = [
      makeRow({ id: "a", name: "Zed", hoursLeft: 10 }),
      makeRow({ id: "b", name: "Amy", hoursLeft: 5 }),
      makeRow({ id: "c", name: "Bob", role: "admin", hoursLeft: 5 }),
      makeRow({ id: "d", name: "Cara", role: "superadmin", hoursLeft: 5 }),
    ];

    render(<InvitedAdminsTable data={rows} />);

    // hoursLeft 5 before 10; within hoursLeft 5, superadmin (Cara) before
    // admins, then admins alphabetically (Amy before Bob).
    expect(names()).toEqual(["Cara", "Amy", "Bob", "Zed"]);
  });
});
