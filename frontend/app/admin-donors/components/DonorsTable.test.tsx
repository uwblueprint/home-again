import { act, fireEvent, render, screen, within } from "@testing-library/react";

import { DonorsTable } from "./DonorsTable";
import type { DonorListRow } from "./DonorsTableColumns";

function makeRow(overrides: Partial<DonorListRow> = {}): DonorListRow {
  return {
    id: "donor-1",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    phone: "647 123 4567",
    donationCount: 1,
    ...overrides,
  };
}

// Given out of name order, so header sorts visibly change the order.
const donors: DonorListRow[] = [
  makeRow({
    id: "ava",
    firstName: "Ava",
    lastName: "Zhou",
    email: "ava@example.com",
    donationCount: 5,
  }),
  makeRow({
    id: "ben",
    firstName: "Ben",
    lastName: "Young",
    email: "ben@example.com",
    donationCount: 0,
  }),
  makeRow({
    id: "carla",
    firstName: "Carla",
    lastName: "Xu",
    email: "carla@example.com",
    donationCount: 12,
  }),
  makeRow({
    id: "dan",
    firstName: "Dan",
    lastName: "Wong",
    email: "dan@example.com",
    donationCount: 2,
  }),
];

function makeMany(count: number): DonorListRow[] {
  return Array.from({ length: count }, (_, i) =>
    makeRow({
      id: `donor-${i}`,
      firstName: `First${i}`,
      lastName: `Last${i}`,
      email: `donor${i}@example.com`,
    })
  );
}

/** Text of one column, top to bottom, on the current page. */
function columnText(columnIndex: number) {
  return screen
    .getAllByTestId(/^donors-data-table-row-/)
    .map((row) => within(row).getAllByRole("cell")[columnIndex].textContent);
}

const firstNames = () => columnText(0);

/** Text of each cell in one row, left to right. */
function rowText(rowIndex: number) {
  return within(screen.getByTestId(`donors-data-table-row-${rowIndex}`))
    .getAllByRole("cell")
    .map((cell) => cell.textContent);
}

function clickHeader(title: string) {
  fireEvent.click(screen.getByRole("button", { name: title }));
}

function search(value: string) {
  fireEvent.change(screen.getByPlaceholderText("Search for donor"), {
    target: { value },
  });
}

describe("DonorsTable", () => {
  describe("layout", () => {
    it("renders the title, search and columns inside the table card", () => {
      render(<DonorsTable data={donors} />);
      const card = screen.getByTestId("donors-data-table");

      expect(
        within(card).getByRole("heading", { name: "Donors" })
      ).toBeInTheDocument();
      expect(
        within(card).getByPlaceholderText("Search for donor")
      ).toBeInTheDocument();
      // Sorting is on the headers; there's no Sort dropdown.
      expect(screen.queryByRole("button", { name: "Sort" })).toBeNull();

      // The search-only full name column never renders.
      expect(
        screen.getAllByRole("columnheader").map((th) => th.textContent)
      ).toEqual([
        "First Name",
        "Last Name",
        "Email",
        "Phone number",
        "Donation Count",
      ]);
    });

    it("makes only the name and donation count headers sortable", () => {
      render(<DonorsTable data={donors} />);
      for (const title of ["First Name", "Last Name", "Donation Count"]) {
        expect(screen.getByRole("button", { name: title })).toBeInTheDocument();
      }
      for (const title of ["Email", "Phone number"]) {
        expect(screen.queryByRole("button", { name: title })).toBeNull();
      }
    });

    it("renders a row's values, with the phone's international code", () => {
      render(
        <DonorsTable
          data={[makeRow({ phone: "647 123 4567", donationCount: 3 })]}
        />
      );
      expect(rowText(0)).toEqual([
        "Jane",
        "Smith",
        "jane@example.com",
        "(+1) 647 123 4567",
        "3",
      ]);
    });

    it("doesn't double the international code", () => {
      render(<DonorsTable data={[makeRow({ phone: "+1 647 123 4567" })]} />);
      expect(screen.getByText("+1 647 123 4567")).toBeInTheDocument();
    });

    it('shows "—" for missing values', () => {
      render(
        <DonorsTable
          data={[
            makeRow({
              firstName: null,
              lastName: "  ",
              email: "",
              phone: null,
              donationCount: 0,
            }),
          ]}
        />
      );
      expect(rowText(0)).toEqual(["—", "—", "—", "—", "0"]);
    });
  });

  describe("sorting", () => {
    it("starts in the order given", () => {
      render(<DonorsTable data={donors} />);
      expect(firstNames()).toEqual(["Ava", "Ben", "Carla", "Dan"]);
    });

    it.each([
      ["First Name", ["Ava", "Ben", "Carla", "Dan"]],
      // Last names: Wong, Xu, Young, Zhou.
      ["Last Name", ["Dan", "Carla", "Ben", "Ava"]],
      // First click high-low. Counts: 12, 5, 2, 0.
      ["Donation Count", ["Carla", "Ava", "Dan", "Ben"]],
    ])("sorts by %s, then reverses on a second click", (title, expected) => {
      render(<DonorsTable data={donors} />);

      clickHeader(title);
      expect(firstNames()).toEqual(expected);

      clickHeader(title);
      expect(firstNames()).toEqual([...expected].reverse());
    });

    it("replaces the previous column's sort", () => {
      render(<DonorsTable data={donors} />);
      clickHeader("Donation Count");
      clickHeader("Last Name");
      expect(firstNames()).toEqual(["Dan", "Carla", "Ben", "Ava"]);
    });

    it("sorts names ignoring case and accents", () => {
      render(
        <DonorsTable
          data={[
            makeRow({ id: "1", firstName: "zoe" }),
            makeRow({ id: "2", firstName: "Émile" }),
            makeRow({ id: "3", firstName: "adam" }),
            makeRow({ id: "4", firstName: "Bea" }),
          ]}
        />
      );
      clickHeader("First Name");
      expect(firstNames()).toEqual(["adam", "Bea", "Émile", "zoe"]);
    });

    it("puts missing names last in both directions", () => {
      render(
        <DonorsTable
          data={[
            makeRow({ id: "1", firstName: null }),
            makeRow({ id: "2", firstName: "Bea" }),
            makeRow({ id: "3", firstName: "Al" }),
          ]}
        />
      );
      // Also checks the first click is A-Z even though the first row's name
      // is missing (TanStack would otherwise guess Z-A from it).
      clickHeader("First Name");
      expect(firstNames()).toEqual(["Al", "Bea", "—"]);

      clickHeader("First Name");
      expect(firstNames()).toEqual(["Bea", "Al", "—"]);
    });

    it("ignores surrounding spaces in names", () => {
      render(
        <DonorsTable
          data={[
            makeRow({ id: "1", firstName: " Zed" }),
            makeRow({ id: "2", firstName: "Al" }),
          ]}
        />
      );
      clickHeader("First Name");
      expect(firstNames()).toEqual(["Al", "Zed"]);
    });
  });

  describe("search", () => {
    it.each([
      ["first name", "carl", ["Carla"]],
      ["last name", "ZHOU", ["Ava"]],
      ["email", "ben@", ["Ben"]],
      ["full name", "dan wong", ["Dan"]],
    ])("matches by %s", (_field, query, expected) => {
      render(<DonorsTable data={donors} />);
      search(query);
      expect(firstNames()).toEqual(expected);
    });

    it("doesn't match donation counts", () => {
      // No phones, so digits can only come from the count.
      render(
        <DonorsTable data={donors.map((row) => ({ ...row, phone: null }))} />
      );
      search("12"); // Carla's donation count
      expect(screen.getByText("No results found for '12'")).toBeVisible();
    });

    it("keeps the chosen sort while searching", () => {
      render(<DonorsTable data={donors} />);
      clickHeader("Last Name");
      search("a"); // every email has "a" ("example.com")
      expect(firstNames()).toEqual(["Dan", "Carla", "Ben", "Ava"]);
      search("n"); // Ben Young, Dan Wong
      expect(firstNames()).toEqual(["Dan", "Ben"]);
    });

    it("goes back to page 1 when the query changes", async () => {
      render(<DonorsTable data={makeMany(25)} />);
      // TanStack arms its page-index auto-reset in a microtask after the
      // first render; a real user can't type before that, so flush it.
      await act(async () => {});

      fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
      expect(screen.getByText("11 - 20 of 25 results")).toBeInTheDocument();

      search("First1"); // First1, First10–First19
      expect(
        await screen.findByText("1 - 10 of 11 results")
      ).toBeInTheDocument();
    });
  });

  describe("pagination", () => {
    it("shows 10 donors per page", () => {
      render(<DonorsTable data={makeMany(25)} />);
      expect(screen.getAllByTestId(/^donors-data-table-row-/)).toHaveLength(10);
      expect(screen.getByText("1 - 10 of 25 results")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
      expect(screen.getByText("11 - 20 of 25 results")).toBeInTheDocument();
      expect(firstNames()[0]).toBe("First10");
    });
  });

  describe("row click", () => {
    it("calls onRowClick on click and Enter, with a chevron column", () => {
      const onRowClick = jest.fn();
      render(<DonorsTable data={donors} onRowClick={onRowClick} />);
      expect(screen.getAllByRole("columnheader")).toHaveLength(6);

      fireEvent.click(screen.getByText("Ava"));
      expect(onRowClick).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: "ava" })
      );

      const benRow = screen.getByText("Ben").closest("tr")!;
      fireEvent.keyDown(benRow, { key: "Enter" });
      expect(onRowClick).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: "ben" })
      );
      expect(onRowClick).toHaveBeenCalledTimes(2);
    });

    it("has no chevron or clickable rows without onRowClick", () => {
      render(<DonorsTable data={donors} />);
      expect(screen.getAllByRole("columnheader")).toHaveLength(5);
      expect(screen.getByTestId("donors-data-table-row-0")).not.toHaveAttribute(
        "role",
        "button"
      );
    });
  });

  describe("states", () => {
    it("shows skeleton rows while loading", () => {
      render(<DonorsTable data={[]} loading />);
      expect(screen.queryByTestId(/^donors-data-table-row-/)).toBeNull();
      // Header row + 5 skeleton rows, each with one cell per visible column.
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(6);
      expect(within(rows[1]).getAllByRole("cell")).toHaveLength(5);
    });

    it("shows the error message", () => {
      render(
        <DonorsTable data={[]} error={new Error("Couldn't load donors")} />
      );
      expect(screen.getByText("Couldn't load donors")).toBeInTheDocument();
    });

    it("shows the empty state when there are no donors", () => {
      render(<DonorsTable data={[]} />);
      expect(screen.getByText("No donors found")).toBeInTheDocument();
    });
  });
});
