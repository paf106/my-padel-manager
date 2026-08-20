-- Payments are rebuilt as one snapshot invoice per student and month.
DROP TABLE IF EXISTS "payment_class_students";
DROP TABLE IF EXISTS "payment_students";
DROP TABLE IF EXISTS "payments";
DROP TABLE IF EXISTS "payments_legacy";

CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "period" date NOT NULL,
  "amount" numeric(10, 2) NOT NULL CHECK ("amount" >= 0),
  "paid" boolean DEFAULT false NOT NULL,
  "paid_at" date,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "payments_student_period_unique" UNIQUE ("student_id", "period"),
  CONSTRAINT "payments_period_first_day_check" CHECK (EXTRACT(DAY FROM "period") = 1),
  CONSTRAINT "payments_paid_state_check" CHECK ("paid" = false OR "paid_at" IS NOT NULL)
);
CREATE INDEX "payments_period_idx" ON "payments" USING btree ("period");

CREATE TABLE "payment_classes" (
  "payment_id" uuid NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
  "class_id" uuid NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
  "class_price" numeric(10, 2) NOT NULL,
  "court_price" numeric(10, 2) NOT NULL,
  "student_count" integer NOT NULL,
  "amount" numeric(10, 2) NOT NULL,
  CONSTRAINT "payment_classes_pk" PRIMARY KEY ("payment_id", "class_id")
);
CREATE INDEX "payment_classes_class_idx" ON "payment_classes" USING btree ("class_id");
