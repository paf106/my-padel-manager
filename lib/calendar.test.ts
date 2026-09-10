import { describe, expect, it } from "vitest";
import { buildCalendarHref, getCalendarDays, parseCalendarMonth } from "./calendar";

describe("calendar helpers", () => {
  it("falls back to the current month for invalid URL params", () => {
    expect(parseCalendarMonth("2026", "13").month).toBeGreaterThanOrEqual(1);
    expect(parseCalendarMonth("2026", "13").month).toBeLessThanOrEqual(12);
  });

  it("starts September 2026 on Tuesday with one Monday placeholder", () => {
    const { cells } = getCalendarDays(2026, 9);
    expect(cells[0]).toBeNull();
    expect(cells[1]).toMatchObject({ date: "2026-09-01", dayNumber: 1 });
  });

  it("preserves month and selected day in calendar links", () => {
    expect(buildCalendarHref("/calendar", 2026, 9, "2026-09-15")).toBe("/calendar?year=2026&month=9&day=2026-09-15");
  });
});
