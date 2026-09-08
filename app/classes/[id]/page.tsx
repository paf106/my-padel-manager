import Link from "next/link";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { classes } from "@/lib/db/schema";
import { deleteClass, updateClassNotes, updateClassStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item] = await db.select().from(classes).where(eq(classes.id, id));
  if (!item) return <main className="mx-auto max-w-2xl px-5 pt-8"><p>Clase no encontrada.</p></main>;
  return <main className="mx-auto min-h-screen max-w-2xl px-5 pb-12 pt-8"><Link href="/calendar" className="text-sm font-bold text-emerald-700">← Volver al calendario</Link><h1 className="mt-6 text-3xl font-black">{format(item.startsAt, "d/MM · HH:mm")}</h1><p className="mt-2 text-slate-500">{item.type === "individual" ? "Clase individual" : item.type === "pair" ? "Clase de pareja" : "Clase de grupo"} · {item.durationMin} min</p><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-500">Estado</p><div className="mt-3 flex flex-wrap gap-2">{(["pending", "completed", "cancelled"] as const).map((status) => <form key={status} action={updateClassStatus.bind(null, id, status)}><button className={`min-h-11 rounded-xl px-4 text-sm font-bold ${item.status === status ? "bg-emerald-800 text-white" : "bg-slate-100 text-slate-600"}`}>{status === "pending" ? "Pendiente" : status === "completed" ? "Terminada" : "Cancelada"}</button></form>)}</div></div><form action={updateClassNotes.bind(null, id)} className="mt-4 rounded-2xl border border-slate-200 bg-white p-5"><label className="block text-sm font-bold">Comentario de la clase<textarea name="notes" defaultValue={item.notes ?? ""} maxLength={1000} className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 p-3" /></label><button className="mt-4 min-h-11 rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white">Guardar comentario</button></form><form action={deleteClass.bind(null, id)} className="mt-6"><button className="text-sm font-bold text-red-700">Eliminar clase</button></form></main>;
}
