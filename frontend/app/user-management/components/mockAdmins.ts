import type { ActiveAdminRow } from "./ActiveAdminsTableColumns";
import type { InvitedAdminRow } from "./InvitedAdminsTableColumns";

export const MOCK_ACTIVE_ADMINS: ActiveAdminRow[] = [
  {
    id: "admin-1",
    name: "Jane Doe",
    role: "superadmin",
    email: "user@homeagainfb.com",
  },
  {
    id: "admin-2",
    name: "Jane Doe",
    role: "admin",
    email: "user@homeagainfb.com",
  },
];

export const MOCK_INVITED_ADMINS: InvitedAdminRow[] = [
  {
    id: "invite-1",
    name: "Jane Doe",
    role: "admin",
    email: "user@homeagainfb.com",
    invitedBy: "John Smith",
    inviteDate: "2026-03-14",
    status: "invite_pending",
  },
  {
    id: "invite-2",
    name: "Jane Doe",
    role: "admin",
    email: "user@homeagainfb.com",
    invitedBy: "John Smith",
    inviteDate: "2026-01-02",
    status: "invite_expired",
  },
];
