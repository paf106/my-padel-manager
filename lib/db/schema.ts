import {
  boolean,
  check,
  date,
  integer,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const levelEnum = pgEnum("level", [
  "intro",
  "beginner",
  "intermediate",
  "advanced",
  "competition",
]);
export const genderEnum = pgEnum("gender", ["male", "female"]);
export const classTypeEnum = pgEnum("class_type", ["individual", "pair", "group"]);
export const classStatusEnum = pgEnum("class_status", ["pending", "cancelled", "completed"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "bizum", "transfer"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const appSettings = pgTable(
  "app_settings",
  {
    id: smallint("id").primaryKey().default(1),
    defaultCourtPriceCents: integer("default_court_price_cents").notNull().default(2000),
    rateIndividualCents: integer("rate_individual_cents").notNull().default(1800),
    ratePairCents: integer("rate_pair_cents").notNull().default(1200),
    rateGroupCents: integer("rate_group_cents").notNull().default(1000),
    defaultDurationMin: integer("default_duration_min").notNull().default(60),
    ...timestamps,
  },
  (table) => [check("app_settings_singleton_check", sql`${table.id} = 1`)],
);

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    birthDate: date("birth_date"),
    level: levelEnum("level").notNull().default("intro"),
    gender: genderEnum("gender").notNull(),
    phone: text("phone"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [index("students_last_name_first_name_idx").on(table.lastName, table.firstName)],
);

export const classSeries = pgTable(
  "class_series",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: classTypeEnum("type").notNull(),
    weekday: smallint("weekday").notNull(),
    timeOfDay: time("time_of_day").notNull(),
    durationMin: integer("duration_min").notNull().default(60),
    courtPriceCents: integer("court_price_cents").notNull(),
    ratePerStudentCents: integer("rate_per_student_cents").notNull(),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on"),
    ...timestamps,
  },
  (table) => [check("class_series_weekday_check", sql`${table.weekday} between 0 and 6`)],
);

export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    seriesId: uuid("series_id").references(() => classSeries.id, { onDelete: "set null" }),
    type: classTypeEnum("type").notNull(),
    status: classStatusEnum("status").notNull().default("pending"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationMin: integer("duration_min").notNull().default(60),
    courtPriceCents: integer("court_price_cents").notNull(),
    ratePerStudentCents: integer("rate_per_student_cents").notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("classes_series_id_idx").on(table.seriesId),
    index("classes_starts_at_idx").on(table.startsAt),
    index("classes_status_starts_at_idx").on(table.status, table.startsAt),
  ],
);

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
  (table) => [
    primaryKey({ columns: [table.classId, table.studentId] }),
    index("class_students_student_id_idx").on(table.studentId),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    period: date("period").notNull(),
    computedAmountCents: integer("computed_amount_cents").notNull().default(0),
    overrideAmountCents: integer("override_amount_cents"),
    overrideReason: text("override_reason"),
    paidAmountCents: integer("paid_amount_cents").notNull().default(0),
    method: paymentMethodEnum("method"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    unique("payments_student_period_unique").on(table.studentId, table.period),
    index("payments_period_idx").on(table.period),
    check("payments_period_first_day_check", sql`extract(day from ${table.period}) = 1`),
    check(
      "payments_amounts_nonnegative_check",
      sql`${table.computedAmountCents} >= 0 and ${table.paidAmountCents} >= 0 and (${table.overrideAmountCents} is null or ${table.overrideAmountCents} >= 0)`,
    ),
  ],
);

export const paymentLines = pgTable(
  "payment_lines",
  {
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    studentCount: integer("student_count").notNull(),
    classShareCents: integer("class_share_cents").notNull(),
    courtShareCents: integer("court_share_cents").notNull(),
    amountCents: integer("amount_cents").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.paymentId, table.classId] }),
    index("payment_lines_class_id_idx").on(table.classId),
  ],
);

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type PadelClass = typeof classes.$inferSelect;
export type NewPadelClass = typeof classes.$inferInsert;
export type Payment = typeof payments.$inferSelect;
