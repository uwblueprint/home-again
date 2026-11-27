import { fireEvent, render, screen } from "@testing-library/react";

import { AdminsTable } from "./AdminsTable";
import type { ActiveAdminRow } from "./ActiveAdminsTableColumns";
import type { InvitedAdminRow } from "./InvitedAdminsTableColumns";

const activeAdmins: ActiveAdminRow[] = [
  { id: "admin-1", name: "Jane Doe", role: "superadmin", email: "jane@homeagainfb.com" },
  { id: "admin-2", name: "John Smith", role: "admin", email: "john@homeagainfb.com" },
];

const invitedAdmins: InvitedAdminRow[] = [
  {
    id: "invite-1",
    name: "Pending Invite",
    role: "admin",
    email: "pending@homeagainfb.com",
    invitedBy: "Jane Doe",
    inviteDate: "2026-03-14",
    status: "invite_pending",
  },
  {
    id: "invite-2",
    name: "Expired Invite",
    role: "admin",
    email: "expired@homeagainfb.com",
    invitedBy: "Jane Doe",
    inviteDate: "2026-01-02",
    status: "invite_expired",
  },
];

describe("AdminsTable", () => {
  it("shows the active admins table by default, with its tab count", () => {
    render(
      <AdminsTable activeAdmins={activeAdmins} invitedAdmins={invitedAdmins} />
    );

    expect(screen.getByText("Active Admins (2)")).toBeInTheDocument();
    expect(screen.getByText("Invited (2)")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByText("Pending Invite")).not.toBeInTheDocument();
  });

  it("switches to the invited admins table on tab click", () => {
    render(
      <AdminsTable activeAdmins={activeAdmins} invitedAdmins={invitedAdmins} />
    );

    fireEvent.click(screen.getByText("Invited (2)"));

    expect(screen.getByText("Pending Invite")).toBeInTheDocument();
    expect(screen.getByText("Expired Invite")).toBeInTheDocument();
    expect(screen.getByText("Invite Date")).toBeInTheDocument();
    expect(screen.getByText("Invited By")).toBeInTheDocument();
  });
});
