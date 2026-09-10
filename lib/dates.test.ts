import { describe, expect, it } from "vitest";
import { madridDateKey, madridMonthRange, madridTime } from "./dates";

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
});
