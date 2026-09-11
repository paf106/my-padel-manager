import { describe, expect, it } from "vitest";
import {
  madridDateKey,
  madridFromLocalInput,
  madridLocalInputValue,
  madridMonthKeys,
  madridMonthRange,
  madridMonthWindow,
  madridTime,
  madridUpcomingRange,
} from "./dates";

describe("Madrid date boundaries", () => {
  it("keeps a midnight Madrid class on the correct local day", () => {
    const instant = new Date("2026-09-01T00:30:00+02:00");
    expect(madridDateKey(instant)).toBe("2026-09-01");
    expect(madridTime(instant)).toBe("00:30");
  });

  it("builds month boundaries in the Madrid timezone", () => {
    const { start, end } = madridMonthRange(new Date("2026-09-15T12:00:00Z"));
    expect(start.toISOString()).toBe("2026-08-31T22:00:00.000Z");
    expect(end.toISOString()).toBe("2026-09-30T21:59:59.999Z");
  });

  it("builds an inclusive month window around the anchor month", () => {
    const { start, end } = madridMonthWindow(new Date("2026-09-15T12:00:00Z"));
    expect(start.toISOString()).toBe("2025-08-31T22:00:00.000Z");
    expect(end.toISOString()).toBe("2027-09-30T22:00:00.000Z");
  });

  it("builds chart month keys in Madrid time", () => {
    expect(madridMonthKeys(new Date("2026-09-15T12:00:00Z"))).toEqual([
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
    ]);
  });

  it("converts datetime-local values using Madrid time", () => {
    const instant = madridFromLocalInput("2026-09-10T18:00");
    expect(instant.toISOString()).toBe("2026-09-10T16:00:00.000Z");
    expect(madridLocalInputValue(instant)).toBe("2026-09-10T18:00");
  });

  it("builds a Madrid-local upcoming range", () => {
    const { start, end } = madridUpcomingRange(new Date("2026-09-10T12:00:00Z"));
    expect(madridDateKey(start)).toBe("2026-09-10");
    expect(madridDateKey(new Date(end.getTime() - 1))).toBe("2026-09-16");
  });
});
