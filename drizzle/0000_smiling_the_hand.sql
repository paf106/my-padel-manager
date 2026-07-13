CREATE TYPE "public"."class_status" AS ENUM('pending', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."class_type" AS ENUM('individual', 'pair', 'group');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."level" AS ENUM('beginner_intro', 'beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TABLE "class_students" (
	"class_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	CONSTRAINT "class_students_class_id_student_id_pk" PRIMARY KEY("class_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "class_type" DEFAULT 'individual' NOT NULL,
	"status" "class_status" DEFAULT 'pending' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_min" integer DEFAULT 60 NOT NULL,
	"court_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"class_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"paid_at" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_student_period" UNIQUE("student_id","year","month")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text DEFAULT '' NOT NULL,
	"birth_date" date,
	"level" "level" DEFAULT 'beginner_intro' NOT NULL,
	"gender" "gender",
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_students" ADD CONSTRAINT "class_students_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_students" ADD CONSTRAINT "class_students_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;