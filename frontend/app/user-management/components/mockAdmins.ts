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
    email: "jane@homeagainfb.com",
    status: "invite_pending",
    hoursLeft: 48,
  },
  {
    id: "invite-2",
    name: "Amy Lee",
    role: "superadmin",
    email: "amy@homeagainfb.com",
    status: "invite_pending",
    hoursLeft: 48,
  },
  {
    id: "invite-3",
    name: "Zed Carter",
    role: "superadmin",
    email: "zed@homeagainfb.com",
    status: "invite_pending",
    hoursLeft: 48,
  },
  {
    id: "invite-4",
    name: "Bob Smith",
    role: "admin",
    email: "bob@homeagainfb.com",
    status: "invite_expired",
    hoursLeft: 0,
  },
  {
    id: "invite-5",
    name: "Wes Turner",
    role: "superadmin",
    email: "wes@homeagainfb.com",
    status: "invite_expired",
    hoursLeft: 0,
  },
];
