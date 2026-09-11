CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "students_name_phone_trgm_idx" ON "students" USING gin ("first_name" gin_trgm_ops, "last_name" gin_trgm_ops, "phone" gin_trgm_ops);
