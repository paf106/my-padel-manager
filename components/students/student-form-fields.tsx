import { Input, Select, Field } from "@/components/ui/field";

type StudentFormValue = {
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: string | null;
  level?: "intro" | "beginner" | "intermediate" | "advanced" | "competition";
  gender?: "male" | "female";
  phone?: string | null;
};

export function StudentFormFields({ student }: { student?: StudentFormValue }) {
  return (
    <>
      <Field label="Nombre">
        <Input name="firstName" required maxLength={80} defaultValue={student?.firstName ?? ""} />
      </Field>
      <Field label="Apellidos">
        <Input name="lastName" required maxLength={120} defaultValue={student?.lastName ?? ""} />
      </Field>
      <Field label="Fecha de nacimiento">
        <Input name="birthDate" type="date" defaultValue={student?.birthDate ?? ""} />
      </Field>
      <Field label="Nivel">
        <Select name="level" defaultValue={student?.level ?? "intro"}>
          <option value="intro">Iniciación</option>
          <option value="beginner">Principiante</option>
          <option value="intermediate">Medio</option>
          <option value="advanced">Avanzado</option>
          <option value="competition">Competición</option>
        </Select>
      </Field>
      <Field label="Sexo">
        <Select name="gender" defaultValue={student?.gender ?? "male"}>
          <option value="male">Hombre</option>
          <option value="female">Mujer</option>
        </Select>
      </Field>
      <Field label="Teléfono">
        <Input name="phone" type="tel" autoComplete="tel" defaultValue={student?.phone ?? ""} />
      </Field>
    </>
  );
}
