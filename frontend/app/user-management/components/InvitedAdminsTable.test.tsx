import { fireEvent, render, screen, within } from "@testing-library/react";

import { InvitedAdminsTable } from "./InvitedAdminsTable";
import type { InvitedAdminRow } from "./InvitedAdminsTableColumns";

function makeRow(overrides: Partial<InvitedAdminRow> = {}): InvitedAdminRow {
  return {
    id: "invite-1",
    name: "Jane Doe",
    role: "admin",
    email: "jane@homeagainfb.com",
    invitedBy: "John Smith",
    inviteDate: "2026-03-14",
    status: "invite_pending",
    ...overrides,
  };
}

describe("InvitedAdminsTable", () => {
  it("renders the invited-only columns", () => {
    render(<InvitedAdminsTable data={[makeRow()]} />);

    expect(
      screen.getAllByRole("columnheader").map((th) => th.textContent)
    ).toEqual([
      "Admin Name",
      "Role",
      "Email",
      "Invited By",
      "Invite Date",
      "Status",
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
});
