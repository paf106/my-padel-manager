import { describe, expect, it } from "vitest";
import { buildCalendarHref, getCalendarDays, getStripDays, getWeekStartKey, parseCalendarMonth } from "./calendar";

describe("calendar helpers", () => {
  it("falls back to the current month for invalid URL params", () => {
    expect(parseCalendarMonth("2026", "13").month).toBeGreaterThanOrEqual(1);
    expect(parseCalendarMonth("2026", "13").month).toBeLessThanOrEqual(12);
  });

  it("falls back for years outside the supported calendar range", () => {
    const parsed = parseCalendarMonth("999999", "5");
    expect(parsed.year).toBe(parseCalendarMonth().year);
  });

  it("starts September 2026 on Tuesday with one Monday placeholder", () => {
    const { cells } = getCalendarDays(2026, 9);
    expect(cells[0]).toBeNull();
    expect(cells[1]).toMatchObject({ date: "2026-09-01", dayNumber: 1 });
  });

  it("preserves month and selected day in calendar links", () => {
    expect(buildCalendarHref("/calendar", 2026, 9, "2026-09-15")).toBe("/calendar?year=2026&month=9&day=2026-09-15");
  });

  it("calculates Monday as the start of every week", () => {
    expect(getWeekStartKey("2026-09-10")).toBe("2026-09-07");
    expect(getWeekStartKey("2026-09-13")).toBe("2026-09-07");
  });

  it("builds a strip spanning the surrounding months", () => {
    const days = getStripDays(2026, 9);
    expect(days[0].weekdayLabel).toMatch(/lun/i);
    expect(days.some((day) => day.date.startsWith("2026-08"))).toBe(true);
    expect(days.some((day) => day.date.startsWith("2026-10"))).toBe(true);
  });
});
