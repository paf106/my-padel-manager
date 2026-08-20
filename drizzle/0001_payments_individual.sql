-- Preserve the legacy monthly ledger before introducing individual payments.
ALTER TABLE "payments" RENAME TO "payments_legacy";

CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" numeric(10, 2) NOT NULL CHECK ("amount" > 0),
	"paid" boolean DEFAULT false NOT NULL,
	"paid_at" date,
	"notes" text,
	"legacy_period" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_paid_state_check" CHECK (("paid" = true AND "paid_at" IS NOT NULL) OR ("paid" = false))
);

CREATE TABLE "payment_students" (
	"payment_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	CONSTRAINT "payment_students_payment_id_student_id_pk" PRIMARY KEY("payment_id", "student_id"),
	CONSTRAINT "payment_students_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE,
	CONSTRAINT "payment_students_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT
);

CREATE TABLE "payment_class_students" (
	"payment_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	CONSTRAINT "payment_class_students_pk" PRIMARY KEY("payment_id", "class_id", "student_id"),
	CONSTRAINT "payment_class_students_payment_student_fk" FOREIGN KEY ("payment_id", "student_id") REFERENCES "payment_students"("payment_id", "student_id") ON DELETE CASCADE,
	CONSTRAINT "payment_class_students_class_student_fk" FOREIGN KEY ("class_id", "student_id") REFERENCES "class_students"("class_id", "student_id") ON DELETE RESTRICT
);

INSERT INTO "payments" ("id", "amount", "paid", "paid_at", "notes", "legacy_period", "created_at")
SELECT "id", "amount", "paid", CASE WHEN "paid" THEN COALESCE("paid_at", make_date("year", "month", 1)) ELSE NULL END, "notes",
       make_date("year", "month", 1), "created_at"
FROM "payments_legacy"
WHERE "amount"::numeric > 0
  AND "year" BETWEEN 1 AND 9999
  AND "month" BETWEEN 1 AND 12;

INSERT INTO "payment_students" ("payment_id", "student_id")
SELECT "id", "student_id"
FROM "payments_legacy"
WHERE "amount"::numeric > 0
  AND "year" BETWEEN 1 AND 9999
  AND "month" BETWEEN 1 AND 12;

CREATE INDEX "payment_students_student_id_idx" ON "payment_students" USING btree ("student_id", "payment_id");
CREATE INDEX "payment_class_students_class_idx" ON "payment_class_students" USING btree ("class_id", "student_id");

-- Keep the legacy table for manual review and rollback. Drop it only after validation.
