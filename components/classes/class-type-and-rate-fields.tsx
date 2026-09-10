"use client";

import { useState } from "react";
import { Field, Select } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";

type ClassType = "individual" | "pair" | "group";

type Props = {
  rates: Record<ClassType, number>;
};

export function ClassTypeAndRateFields({ rates }: Props) {
  const [type, setType] = useState<ClassType>("individual");
  const [rate, setRate] = useState(() => (rates.individual / 100).toFixed(2));
  const [rateEdited, setRateEdited] = useState(false);

  function handleTypeChange(nextType: ClassType) {
    setType(nextType);
    if (!rateEdited) setRate((rates[nextType] / 100).toFixed(2));
  }

  return (
    <>
      <Field label="Tipo">
        <Select name="type" value={type} onChange={(event) => handleTypeChange(event.target.value as ClassType)}>
          <option value="individual">Individual · 1 alumno</option>
          <option value="pair">Pareja · 2 alumnos</option>
          <option value="group">Grupo · 3 o 4 alumnos</option>
        </Select>
      </Field>
      <Field label="Precio clase / alumno">
        <MoneyInput name="ratePerStudentCents" value={rate} onChange={(event) => { setRateEdited(true); setRate(event.target.value); }} />
      </Field>
    </>
  );
}
