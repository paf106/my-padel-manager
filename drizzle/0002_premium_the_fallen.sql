CREATE INDEX IF NOT EXISTS "class_students_student_id_idx" ON "class_students" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "classes_series_id_idx" ON "classes" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "classes_starts_at_idx" ON "classes" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "classes_status_starts_at_idx" ON "classes" USING btree ("status","starts_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_lines_class_id_idx" ON "payment_lines" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_period_idx" ON "payments" USING btree ("period");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "students_last_name_first_name_idx" ON "students" USING btree ("last_name","first_name");
