CREATE OR REPLACE FUNCTION public.validate_class_student_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  class_type_value class_type;
  student_count integer;
BEGIN
  SELECT type INTO class_type_value FROM classes WHERE id = COALESCE(NEW.class_id, OLD.class_id);
  SELECT count(*) INTO student_count FROM class_students WHERE class_id = COALESCE(NEW.class_id, OLD.class_id);
  IF class_type_value = 'individual' AND student_count <> 1 THEN RAISE EXCEPTION 'Individual classes require exactly one student'; END IF;
  IF class_type_value = 'pair' AND student_count <> 2 THEN RAISE EXCEPTION 'Pair classes require exactly two students'; END IF;
  IF class_type_value = 'group' AND student_count NOT BETWEEN 3 AND 4 THEN RAISE EXCEPTION 'Group classes require three or four students'; END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
