"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { StudentFormFields } from "@/components/students/student-form-fields";

export type StudentFormState = { ok: true } | { error: string };
export type StudentFormAction = (
  state: StudentFormState,
  formData: FormData,
) => Promise<StudentFormState>;

const initialState: StudentFormState = { ok: true };

export function StudentForm({
  action,
  submitLabel,
  onSuccess,
  successHref,
}: {
  action: StudentFormAction;
  submitLabel: string;
  onSuccess?: () => void;
  successHref?: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if ("ok" in state && isPending === false && formRef.current?.dataset.submitted === "true") {
      formRef.current.dataset.submitted = "false";
      if (successHref) router.push(successHref);
      onSuccess?.();
    }
  }, [isPending, onSuccess, router, state, successHref]);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        if (formRef.current) formRef.current.dataset.submitted = "true";
        formAction(formData);
      }}
      aria-busy={isPending}
      className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-2"
    >
      {"error" in state && (
        <div className="lg:col-span-2">
          <Alert>Revisa los datos introducidos.</Alert>
        </div>
      )}
      <StudentFormFields />
      <button
        type="submit"
        disabled={isPending}
        className="min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60 lg:col-span-2 lg:w-fit lg:px-6"
      >
        {isPending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
