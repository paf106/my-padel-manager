import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums (values in English; UI labels are mapped in lib/labels.ts)
// ---------------------------------------------------------------------------

export const levelEnum = pgEnum("level", [
  "beginner_intro",
  "beginner",
  "intermediate",
  "advanced",
]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const classTypeEnum = pgEnum("class_type", [
  "individual",
  "pair",
  "group",
]);

export const classStatusEnum = pgEnum("class_status", [
  "pending",
  "cancelled",
  "completed",
]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull().default(""),
  birthDate: date("birth_date"),
  level: levelEnum("level").notNull().default("beginner_intro"),
  gender: genderEnum("gender"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: classTypeEnum("type").notNull().default("individual"),
  status: classStatusEnum("status").notNull().default("pending"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  durationMin: integer("duration_min").notNull().default(60),
  courtPrice: numeric("court_price", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  classPrice: numeric("class_price", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const classStudents = pgTable(
  "class_students",
  {
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.classId, t.studentId] })]
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    month: integer("month").notNull(), // 1-12
    amount: numeric("amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    paid: boolean("paid").notNull().default(false),
    paidAt: date("paid_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("payments_student_period").on(t.studentId, t.year, t.month)]
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const studentsRelations = relations(students, ({ many }) => ({
  classStudents: many(classStudents),
  payments: many(payments),
}));

export const classesRelations = relations(classes, ({ many }) => ({
  classStudents: many(classStudents),
}));

export const classStudentsRelations = relations(classStudents, ({ one }) => ({
  class: one(classes, {
    fields: [classStudents.classId],
    references: [classes.id],
  }),
  student: one(students, {
    fields: [classStudents.studentId],
    references: [students.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
}));

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Level = (typeof levelEnum.enumValues)[number];
export type Gender = (typeof genderEnum.enumValues)[number];
export type ClassType = (typeof classTypeEnum.enumValues)[number];
export type ClassStatus = (typeof classStatusEnum.enumValues)[number];
