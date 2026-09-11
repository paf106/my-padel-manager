export type ClassType = "individual" | "pair" | "group";

export type BillingClass = {
  id: string;
  type: ClassType;
  courtPriceCents: number;
  ratePerStudentCents: number;
  studentIds: string[];
};

export type BillingLine = {
  classId: string;
  studentId: string;
  classShareCents: number;
  courtShareCents: number;
  amountCents: number;
};

const getExpectedStudentCount = (type: ClassType) =>
  type === "individual" ? 1 : type === "pair" ? 2 : [3, 4];

export function validateClassStudentCount(type: ClassType, count: number) {
  const expected = getExpectedStudentCount(type);
  return Array.isArray(expected) ? expected.includes(count) : expected === count;
}

export function splitCents(totalCents: number, count: number) {
  if (!Number.isInteger(totalCents) || totalCents < 0) {
    throw new Error("totalCents must be a non-negative integer");
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("count must be a positive integer");
  }

  const base = Math.floor(totalCents / count);
  const remainder = totalCents % count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

export function buildBillingLines(classes: BillingClass[]): BillingLine[] {
  return classes.flatMap((padelClass) => {
    const count = padelClass.studentIds.length;
    if (!validateClassStudentCount(padelClass.type, count)) {
      throw new Error(`Invalid student count for ${padelClass.type} class`);
    }

    const courtShares = splitCents(padelClass.courtPriceCents, count);
    return padelClass.studentIds.map((studentId, index) => ({
      classId: padelClass.id,
      studentId,
      classShareCents: padelClass.ratePerStudentCents,
      courtShareCents: courtShares[index],
      amountCents: padelClass.ratePerStudentCents + courtShares[index],
    }));
  });
}
