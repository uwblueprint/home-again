import { fireEvent, render, screen, within } from "@testing-library/react";

import { ActiveAdminsTable } from "./ActiveAdminsTable";
import type { ActiveAdminRow } from "./ActiveAdminsTableColumns";

const rows: ActiveAdminRow[] = [
  {
    id: "admin-1",
    name: "Jane Doe",
    role: "superadmin",
    email: "jane@homeagainfb.com",
  },
];

describe("ActiveAdminsTable", () => {
  it("renders the columns and a row actions menu for each row", () => {
    render(<ActiveAdminsTable data={rows} />);

    expect(
      screen.getAllByRole("columnheader").map((th) => th.textContent)
    ).toEqual(["Admin Name", "Role", "Email", ""]);

    const row = screen.getByTestId("active-admins-data-table-row-0");
    fireEvent.click(within(row).getByRole("button"));

    // Jane Doe is superadmin, so the offered switch is to admin.
    expect(
      screen.getAllByText(
        (_, element) => element?.textContent === "Change to Admin"
      ).length
    ).toBeGreaterThan(0);
    expect(screen.getByText("Delete admin")).toBeInTheDocument();
  });
});
