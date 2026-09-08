import { describe, expect, it } from "vitest";
import { buildBillingLines, splitCents, validateClassStudentCount } from "./billing";

describe("billing", () => {
  it("splits cents without losing the remainder", () => {
    expect(splitCents(2000, 3)).toEqual([667, 667, 666]);
  });

  it("validates student counts by class type", () => {
    expect(validateClassStudentCount("individual", 1)).toBe(true);
    expect(validateClassStudentCount("pair", 1)).toBe(false);
    expect(validateClassStudentCount("group", 4)).toBe(true);
  });

  it("builds per-student billing lines", () => {
    const lines = buildBillingLines([{
      id: "class-1",
      type: "pair",
      courtPriceCents: 1800,
      ratePerStudentCents: 1200,
      studentIds: ["student-1", "student-2"],
    }]);
    expect(lines.map((line) => line.amountCents)).toEqual([2100, 2100]);
  });
});
