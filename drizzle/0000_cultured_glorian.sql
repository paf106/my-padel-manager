CREATE TYPE "public"."class_status" AS ENUM('pending', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."class_type" AS ENUM('individual', 'pair', 'group');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."level" AS ENUM('intro', 'beginner', 'intermediate', 'advanced', 'competition');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bizum', 'transfer');--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"default_court_price_cents" integer DEFAULT 2000 NOT NULL,
	"rate_individual_cents" integer DEFAULT 1800 NOT NULL,
	"rate_pair_cents" integer DEFAULT 1200 NOT NULL,
	"rate_group_cents" integer DEFAULT 1000 NOT NULL,
	"default_duration_min" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_singleton_check" CHECK ("app_settings"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "class_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "class_type" NOT NULL,
	"weekday" smallint NOT NULL,
	"time_of_day" time NOT NULL,
	"duration_min" integer DEFAULT 60 NOT NULL,
	"court_price_cents" integer NOT NULL,
	"rate_per_student_cents" integer NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_series_weekday_check" CHECK ("class_series"."weekday" between 0 and 6)
);
--> statement-breakpoint
CREATE TABLE "class_students" (
	"class_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	CONSTRAINT "class_students_class_id_student_id_pk" PRIMARY KEY("class_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_id" uuid,
	"type" "class_type" NOT NULL,
	"status" "class_status" DEFAULT 'pending' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_min" integer DEFAULT 60 NOT NULL,
	"court_price_cents" integer NOT NULL,
	"rate_per_student_cents" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_lines" (
	"payment_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"student_count" integer NOT NULL,
	"class_share_cents" integer NOT NULL,
	"court_share_cents" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	CONSTRAINT "payment_lines_payment_id_class_id_pk" PRIMARY KEY("payment_id","class_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"period" date NOT NULL,
	"computed_amount_cents" integer DEFAULT 0 NOT NULL,
	"override_amount_cents" integer,
	"override_reason" text,
	"paid_amount_cents" integer DEFAULT 0 NOT NULL,
	"method" "payment_method",
	"paid_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_student_period_unique" UNIQUE("student_id","period"),
	CONSTRAINT "payments_period_first_day_check" CHECK (extract(day from "payments"."period") = 1),
	CONSTRAINT "payments_amounts_nonnegative_check" CHECK ("payments"."computed_amount_cents" >= 0 and "payments"."paid_amount_cents" >= 0 and ("payments"."override_amount_cents" is null or "payments"."override_amount_cents" >= 0))
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"birth_date" date,
	"level" "level" DEFAULT 'intro' NOT NULL,
	"gender" "gender" NOT NULL,
	"phone" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_students" ADD CONSTRAINT "class_students_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_students" ADD CONSTRAINT "class_students_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_series_id_class_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."class_series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_lines" ADD CONSTRAINT "payment_lines_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_lines" ADD CONSTRAINT "payment_lines_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;