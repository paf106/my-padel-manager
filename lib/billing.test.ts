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
    const lines = buildBillingLines([
      {
        id: "class-1",
        type: "pair",
        courtPriceCents: 1800,
        ratePerStudentCents: 1200,
        studentIds: ["student-1", "student-2"],
      },
    ]);
    expect(lines.map((line) => line.amountCents)).toEqual([2100, 2100]);
  });

  it("splits a group court price and preserves the total cents", () => {
    const lines = buildBillingLines([
      {
        id: "group-1",
        type: "group",
        courtPriceCents: 2000,
        ratePerStudentCents: 1000,
        studentIds: ["student-3", "student-1", "student-2"],
      },
    ]);
    expect(lines.map((line) => line.courtShareCents)).toEqual([667, 667, 666]);
    expect(lines.reduce((sum, line) => sum + line.courtShareCents, 0)).toBe(2000);
    expect(lines.reduce((sum, line) => sum + line.amountCents, 0)).toBe(5000);
  });

  it("rejects invalid student counts", () => {
    expect(() =>
      buildBillingLines([
        {
          id: "invalid-1",
          type: "pair",
          courtPriceCents: 2000,
          ratePerStudentCents: 1000,
          studentIds: ["student-1"],
        },
      ]),
    ).toThrow("Invalid student count");
  });

  it("builds lines for multiple classes", () => {
    const lines = buildBillingLines([
      {
        id: "class-1",
        type: "individual",
        courtPriceCents: 1000,
        ratePerStudentCents: 1800,
        studentIds: ["student-1"],
      },
      {
        id: "class-2",
        type: "pair",
        courtPriceCents: 2000,
        ratePerStudentCents: 1200,
        studentIds: ["student-1", "student-2"],
      },
    ]);
    expect(lines).toHaveLength(3);
    expect(lines.filter((line) => line.studentId === "student-1")).toHaveLength(2);
    expect(lines.reduce((sum, line) => sum + line.amountCents, 0)).toBe(7200);
  });
});
