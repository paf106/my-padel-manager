import { toNumber } from "./format";

export type BillingClass = {
  id: string;
  startsAt: Date;
  classPrice: string;
  courtPrice: string;
  students: { id: string; firstName: string; lastName: string }[];
};

export type BillingLine = {
  classId: string;
  startsAt: string;
  classPrice: string;
  courtPrice: string;
  studentCount: number;
  amount: string;
};

export type MonthlyDraft = {
  studentId: string;
  studentName: string;
  lines: BillingLine[];
  total: string;
};

function cents(value: string | number) {
  return Math.round(toNumber(value) * 100);
}

/** Splits a class total exactly, assigning remainder cents deterministically. */
export function splitClassCents(classPrice: string | number, courtPrice: string | number, studentIds: string[]) {
  const total = cents(classPrice) + cents(courtPrice);
  const base = Math.floor(total / studentIds.length);
  const remainder = total % studentIds.length;
  return new Map(studentIds.slice().sort().map((id, index) => [id, base + (index < remainder ? 1 : 0)]));
}

export function buildMonthlyDraft(classes: BillingClass[]): MonthlyDraft[] {
  const drafts = new Map<string, MonthlyDraft>();
  for (const cls of classes) {
    const ids = cls.students.map((student) => student.id).sort();
    if (!ids.length) continue;
    const amounts = splitClassCents(cls.classPrice, cls.courtPrice, ids);
    for (const student of cls.students) {
      const draft = drafts.get(student.id) ?? { studentId: student.id, studentName: [student.firstName, student.lastName].filter(Boolean).join(" "), lines: [], total: "0.00" };
      const amount = amounts.get(student.id) ?? 0;
      draft.lines.push({ classId: cls.id, startsAt: cls.startsAt.toISOString(), classPrice: cls.classPrice, courtPrice: cls.courtPrice, studentCount: ids.length, amount: (amount / 100).toFixed(2) });
      draft.total = ((cents(draft.total) + amount) / 100).toFixed(2);
      drafts.set(student.id, draft);
    }
  }
  for (const draft of drafts.values()) draft.lines.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return [...drafts.values()].sort((a, b) => a.studentName.localeCompare(b.studentName, "es"));
}

export function draftIsStale(draft: MonthlyDraft, snapshot: { classId: string; amount: string }[]) {
  if (draft.lines.length !== snapshot.length) return true;
  const expected = new Map(draft.lines.map((line) => [line.classId, line.amount]));
  return snapshot.some((line) => expected.get(line.classId) !== line.amount);
}
