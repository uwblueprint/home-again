import { formatDate, formatShortDate } from "@/common/utils/DateUtils";

// jest.config.js pins TZ to America/St_Johns (UTC-03:30), so a date-only string
// parsed as UTC midnight would land on the previous local day. These tests fail
// if that regression comes back.
describe("formatDate", () => {
  it("keeps a date-only string on its own calendar day", () => {
    expect(formatDate("2026-03-14")).toBe("Mar 14, 2026");
  });

  it("does not shift a date-only string across a month boundary", () => {
    expect(formatDate("2026-04-01")).toBe("Apr 1, 2026");
  });

  it("formats a full timestamp in local time", () => {
    // 12:00Z is midday everywhere west of UTC, so this is not near a boundary.
    expect(formatDate("2026-03-14T12:00:00Z")).toBe("Mar 14, 2026");
  });

  it("returns a placeholder for an empty string", () => {
    expect(formatDate("")).toBe("—");
  });

  it("returns the input unchanged when it is not a date", () => {
    expect(formatDate("not a date")).toBe("not a date");
  });
});

describe("formatShortDate", () => {
  it("formats a date-only string without the year", () => {
    expect(formatShortDate("2026-03-26")).toBe("Mar 26");
  });

  it("keeps a date-only string on its own calendar day", () => {
    expect(formatShortDate("2026-03-14")).toBe("Mar 14");
  });
});
