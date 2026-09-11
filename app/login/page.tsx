import { signIn } from "./actions";
import { Input, Field } from "@/components/ui/field";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
            Padel Ledger
          </p>
          <h1 className="text-4xl font-black tracking-tight">Tu pista de control.</h1>
          <p className="mt-3 text-slate-500">
            Gestiona clases, alumnos y cobros desde cualquier sitio.
          </p>
        </div>
        <form
          action={signIn}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5"
        >
          <h2 className="text-xl font-black">Entrar</h2>
          {params.error && (
            <p
              className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
              role="alert"
            >
              El email o la contraseña no son correctos.
            </p>
          )}
          <div className="mt-6">
            <Field label="Email">
              <Input name="email" type="email" autoComplete="email" required />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Contraseña">
              <Input name="password" type="password" autoComplete="current-password" required />
            </Field>
          </div>
          <button
            type="submit"
            className="mt-6 min-h-12 w-full rounded-xl bg-emerald-800 font-bold text-white transition hover:bg-emerald-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
