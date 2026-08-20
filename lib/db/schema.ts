import { relations, sql } from "drizzle-orm";
import {
  boolean, check, date, index, integer, numeric, pgEnum, pgTable,
  primaryKey, text, timestamp, unique, uuid,
} from "drizzle-orm/pg-core";

export const levelEnum = pgEnum("level", ["beginner_intro", "beginner", "intermediate", "advanced"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const classTypeEnum = pgEnum("class_type", ["individual", "pair", "group"]);
export const classStatusEnum = pgEnum("class_status", ["pending", "cancelled", "completed"]);

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(), lastName: text("last_name").notNull().default(""),
  birthDate: date("birth_date"), level: levelEnum("level").notNull().default("beginner_intro"),
  gender: genderEnum("gender"), phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(), type: classTypeEnum("type").notNull().default("individual"),
  status: classStatusEnum("status").notNull().default("pending"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(), durationMin: integer("duration_min").notNull().default(60),
  courtPrice: numeric("court_price", { precision: 10, scale: 2 }).notNull().default("0"),
  classPrice: numeric("class_price", { precision: 10, scale: 2 }).notNull().default("0"), notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("classes_starts_at_idx").on(t.startsAt)]);

export const classStudents = pgTable("class_students", {
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.classId, t.studentId] }), index("class_students_student_id_idx").on(t.studentId, t.classId)]);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  period: date("period").notNull(), amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paid: boolean("paid").notNull().default(false), paidAt: date("paid_at"), notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("payments_student_period_unique").on(t.studentId, t.period),
  index("payments_period_idx").on(t.period),
  check("payments_amount_positive_check", sql`"amount" >= 0`),
  check("payments_period_first_day_check", sql`EXTRACT(DAY FROM "period") = 1`),
  check("payments_paid_state_check", sql`"paid" = false OR "paid_at" IS NOT NULL`),
]);

export const paymentClasses = pgTable("payment_classes", {
  paymentId: uuid("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  classPrice: numeric("class_price", { precision: 10, scale: 2 }).notNull(),
  courtPrice: numeric("court_price", { precision: 10, scale: 2 }).notNull(),
  studentCount: integer("student_count").notNull(), amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
}, (t) => [primaryKey({ columns: [t.paymentId, t.classId] }), index("payment_classes_class_idx").on(t.classId)]);

export const studentsRelations = relations(students, ({ many }) => ({ classStudents: many(classStudents), payments: many(payments) }));
export const classesRelations = relations(classes, ({ many }) => ({ classStudents: many(classStudents), paymentClasses: many(paymentClasses) }));
export const classStudentsRelations = relations(classStudents, ({ one }) => ({
  class: one(classes, { fields: [classStudents.classId], references: [classes.id] }),
  student: one(students, { fields: [classStudents.studentId], references: [students.id] }),
}));
export const paymentsRelations = relations(payments, ({ one, many }) => ({
  student: one(students, { fields: [payments.studentId], references: [students.id] }), classes: many(paymentClasses),
}));
export const paymentClassesRelations = relations(paymentClasses, ({ one }) => ({
  payment: one(payments, { fields: [paymentClasses.paymentId], references: [payments.id] }),
  class: one(classes, { fields: [paymentClasses.classId], references: [classes.id] }),
}));

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
