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
    lastDonatedAt: "2026-01-01T12:00:00Z",
    ...overrides,
  };
}

// Last donated on different days, so Recency has a clear order:
// Carla (most recent) → Ben → Ava → Dan.
const donors: DonorListRow[] = [
  makeRow({
    id: "ava",
    firstName: "Ava",
    lastName: "Zhou",
    email: "ava@example.com",
    donationCount: 5,
    lastDonatedAt: "2026-02-01T12:00:00Z",
  }),
  makeRow({
    id: "ben",
    firstName: "Ben",
    lastName: "Young",
    email: "ben@example.com",
    donationCount: 0,
    lastDonatedAt: "2026-03-01T12:00:00Z",
  }),
  makeRow({
    id: "carla",
    firstName: "Carla",
    lastName: "Xu",
    email: "carla@example.com",
    donationCount: 12,
    lastDonatedAt: "2026-04-01T12:00:00Z",
  }),
  makeRow({
    id: "dan",
    firstName: "Dan",
    lastName: "Wong",
    email: "dan@example.com",
    donationCount: 2,
    lastDonatedAt: "2026-01-01T12:00:00Z",
  }),
];

function makeMany(count: number): DonorListRow[] {
  return Array.from({ length: count }, (_, i) =>
    makeRow({
      id: `donor-${i}`,
      firstName: `First${i}`,
      lastName: `Last${i}`,
      email: `donor${i}@example.com`,
      // Most recent first by index, so Recency keeps index order.
      lastDonatedAt: new Date(
        Date.UTC(2026, 0, 1) - i * 86_400_000
      ).toISOString(),
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

function openSortMenu() {
  fireEvent.click(screen.getByRole("button", { name: "Sort" }));
}

function pickSort(label: string) {
  openSortMenu();
  fireEvent.click(screen.getByRole("radio", { name: label }));
}

function search(value: string) {
  fireEvent.change(screen.getByPlaceholderText("Search for donor"), {
    target: { value },
  });
}

describe("DonorsTable", () => {
  describe("layout", () => {
    it("renders the title, search, sort and columns", () => {
      render(<DonorsTable data={donors} />);

      expect(
        screen.getByRole("heading", { name: "Donors" })
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Search for donor")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sort" })).toBeInTheDocument();

      // Sort/search-only columns (Recency, full name) never render.
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

    it("keeps search and sort outside the table card", () => {
      render(<DonorsTable data={donors} />);
      const card = screen.getByTestId("donors-data-table");
      expect(
        within(card).queryByPlaceholderText("Search for donor")
      ).toBeNull();
      expect(within(card).queryByRole("button", { name: "Sort" })).toBeNull();
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
    it("starts on Recency, most recent donation first", () => {
      render(<DonorsTable data={donors} />);
      expect(firstNames()).toEqual(["Carla", "Ben", "Ava", "Dan"]);

      openSortMenu();
      expect(screen.getByRole("radio", { name: "Recency" })).toBeChecked();
      expect(
        screen.getByRole("button", { name: "Descending" })
      ).toHaveAttribute("aria-pressed", "true");
    });

    it.each([
      ["First Name", "Ascending", ["Ava", "Ben", "Carla", "Dan"]],
      // Last names: Wong, Xu, Young, Zhou.
      ["Last Name", "Ascending", ["Dan", "Carla", "Ben", "Ava"]],
      // Counts: 12, 5, 2, 0.
      ["Donation Count", "Descending", ["Carla", "Ava", "Dan", "Ben"]],
    ])(
      "applies %s's default direction (%s)",
      (label, pressedArrow, expected) => {
        render(<DonorsTable data={donors} />);
        pickSort(label);

        expect(firstNames()).toEqual(expected);
        expect(screen.getByRole("radio", { name: label })).toBeChecked();
        expect(
          screen.getByRole("button", { name: pressedArrow })
        ).toHaveAttribute("aria-pressed", "true");
      }
    );

    it("reverses the current option with the arrows", () => {
      render(<DonorsTable data={donors} />);
      openSortMenu();

      fireEvent.click(screen.getByRole("button", { name: "Ascending" }));
      expect(firstNames()).toEqual(["Dan", "Ava", "Ben", "Carla"]);

      fireEvent.click(screen.getByRole("button", { name: "Descending" }));
      expect(firstNames()).toEqual(["Carla", "Ben", "Ava", "Dan"]);
    });

    it("applies the new option's default direction after the arrows were used", () => {
      render(<DonorsTable data={donors} />);
      openSortMenu();
      fireEvent.click(screen.getByRole("button", { name: "Ascending" }));

      fireEvent.click(screen.getByRole("radio", { name: "Donation Count" }));
      expect(firstNames()).toEqual(["Carla", "Ava", "Dan", "Ben"]);
      expect(
        screen.getByRole("button", { name: "Descending" })
      ).toHaveAttribute("aria-pressed", "true");
    });

    it("resets to Recency, most recent donation first", () => {
      render(<DonorsTable data={donors} />);
      pickSort("First Name");
      fireEvent.click(screen.getByRole("button", { name: "Descending" }));
      expect(firstNames()).toEqual(["Dan", "Carla", "Ben", "Ava"]);

      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(firstNames()).toEqual(["Carla", "Ben", "Ava", "Dan"]);
      expect(screen.getByRole("radio", { name: "Recency" })).toBeChecked();
      expect(
        screen.getByRole("button", { name: "Descending" })
      ).toHaveAttribute("aria-pressed", "true");
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
      pickSort("First Name");
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
      pickSort("First Name");
      expect(firstNames()).toEqual(["Al", "Bea", "—"]);

      fireEvent.click(screen.getByRole("button", { name: "Descending" }));
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
      pickSort("First Name");
      expect(firstNames()).toEqual(["Al", "Zed"]);
    });

    it("puts donors who've never donated last in both directions", () => {
      render(
        <DonorsTable
          data={[
            makeRow({ id: "1", firstName: "Never", lastDonatedAt: null }),
            makeRow({
              id: "2",
              firstName: "Old",
              lastDonatedAt: "2025-01-01T12:00:00Z",
            }),
            makeRow({
              id: "3",
              firstName: "New",
              lastDonatedAt: "2026-01-01T12:00:00Z",
            }),
          ]}
        />
      );
      expect(firstNames()).toEqual(["New", "Old", "Never"]);

      openSortMenu();
      fireEvent.click(screen.getByRole("button", { name: "Ascending" }));
      expect(firstNames()).toEqual(["Old", "New", "Never"]);
    });

    it("orders Recency by time, not by the date string", () => {
      render(
        <DonorsTable
          data={[
            // Lexically "…00Z" > "…00.500Z", but .500 is later.
            makeRow({
              id: "1",
              firstName: "Earlier",
              lastDonatedAt: "2026-01-01T12:00:00Z",
            }),
            makeRow({
              id: "2",
              firstName: "Later",
              lastDonatedAt: "2026-01-01T12:00:00.500Z",
            }),
          ]}
        />
      );
      expect(firstNames()).toEqual(["Later", "Earlier"]);
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

    it("doesn't match donation counts or creation dates", () => {
      // No phones, so digits can only come from the count or date.
      render(
        <DonorsTable data={donors.map((row) => ({ ...row, phone: null }))} />
      );
      search("12"); // Carla's donation count
      expect(screen.getByText("No results found for '12'")).toBeVisible();

      // Recency sorts on epoch milliseconds; a slice of one shouldn't match.
      const epochDigits = String(Date.parse(donors[0].lastDonatedAt!)).slice(
        0,
        6
      );
      search(epochDigits);
      expect(
        screen.getByText(`No results found for '${epochDigits}'`)
      ).toBeVisible();
    });

    it("keeps the chosen sort while searching", () => {
      render(<DonorsTable data={donors} />);
      pickSort("First Name");
      search("a"); // every email has "a" ("example.com")
      expect(firstNames()).toEqual(["Ava", "Ben", "Carla", "Dan"]);
      search("an");
      expect(firstNames()).toEqual(["Dan"]);
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
