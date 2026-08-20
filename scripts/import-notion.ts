/**
 * Imports the Notion databases (CSV) into the database.
 *
 * Usage:
 *   1. In Notion, export each database as CSV:
 *      "···" (top-right of the DB) > Export > Markdown & CSV.
 *   2. Copy the 3 CSV files to the ./notion-export folder with these names:
 *        ./notion-export/alumnos.csv
 *        ./notion-export/clases.csv
 *        ./notion-export/pagos.csv
 *      (or pass them via the STUDENTS_CSV, CLASSES_CSV, PAYMENTS_CSV env vars)
 *   3. Make sure DATABASE_URL is set in .env.local.
 *   4. Run:  bun run import:notion
 *
 * The script is idempotent by student name and payment period:
 * you can re-run it without duplicating students or payments.
 *
 * NOTE: Adjust the column mapping (the `pick(...)` aliases) if your export
 * headers don't match. The script prints the detected headers on start.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import Papa from "papaparse";
import { and, eq } from "drizzle-orm";

config({ path: ".env.local" });

import { db } from "@/lib/db";
import {
  classStudents,
  classes,
  payments,
  students,
  type ClassStatus,
  type ClassType,
  type Gender,
  type Level,
} from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

type Row = Record<string, string>;

const EXPORT_DIR = resolve(process.cwd(), "notion-export");

function readCsv(envVar: string, defaultName: string): Row[] | null {
  const path = process.env[envVar] ?? resolve(EXPORT_DIR, defaultName);
  if (!existsSync(path)) {
    console.warn(`⚠️  No encontrado: ${path} (se omite)`);
    return null;
  }
  const content = readFileSync(path, "utf8");
  const parsed = Papa.parse<Row>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  console.log(`\n📄 ${defaultName} — columnas: ${parsed.meta.fields?.join(" | ")}`);
  return parsed.data;
}

/** Returns the first non-empty value among several possible column names. */
function pick(row: Row, aliases: string[]): string {
  for (const key of Object.keys(row)) {
    const norm = key.trim().toLowerCase();
    if (aliases.some((a) => norm === a.toLowerCase())) {
      const v = row[key]?.trim();
      if (v) return v;
    }
  }
  // Coincidencia parcial como fallback.
  for (const key of Object.keys(row)) {
    const norm = key.trim().toLowerCase();
    if (aliases.some((a) => norm.includes(a.toLowerCase()))) {
      const v = row[key]?.trim();
      if (v) return v;
    }
  }
  return "";
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Enum mapping (Notion text -> English value)
// ---------------------------------------------------------------------------

function mapLevel(value: string): Level {
  const v = normalize(value);
  if (v.startsWith("inici")) return "beginner_intro";
  if (v.startsWith("princ")) return "beginner";
  if (v.startsWith("med")) return "intermediate";
  if (v.startsWith("avan")) return "advanced";
  return "beginner_intro";
}

function mapGender(value: string): Gender | null {
  const v = normalize(value);
  if (!v) return null;
  if (v.startsWith("hombre") || v === "h" || v.startsWith("masc") || v.startsWith("var"))
    return "male";
  if (v.startsWith("muj") || v === "m" || v.startsWith("fem")) return "female";
  return "other";
}

function mapClassType(value: string): ClassType {
  const v = normalize(value);
  if (v.startsWith("indiv")) return "individual";
  if (v.startsWith("pare") || v.startsWith("dob")) return "pair";
  if (v.startsWith("grup")) return "group";
  return "individual";
}

function mapClassStatus(value: string): ClassStatus {
  const v = normalize(value);
  if (v.startsWith("cancel")) return "cancelled";
  if (v.startsWith("termin") || v.startsWith("complet") || v.startsWith("final"))
    return "completed";
  return "pending";
}

/** Convierte "12,50 €" / "12.5" -> 12.5 */
function parseAmount(value: string): number {
  if (!value) return 0;
  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "") // thousands separators
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  // Notion usually exports "July 6, 2026 5:30 PM" or ISO. Date handles most of them.
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d;
  // Fallback dd/MM/yyyy [HH:mm]
  const m = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (m) {
    const [, dd, mm, yy, hh = "0", mi = "0"] = m;
    const year = yy.length === 2 ? 2000 + Number(yy) : Number(yy);
    return new Date(year, Number(mm) - 1, Number(dd), Number(hh), Number(mi));
  }
  return null;
}

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toMonthStart(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Splits a Notion relation cell into individual names. */
function splitNames(value: string): string[] {
  if (!value) return [];
  return value
    .split(/,|;|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

// Cache normalized-name -> studentId
const studentIdByName = new Map<string, string>();

async function importStudents() {
  const rows = readCsv("STUDENTS_CSV", "alumnos.csv");
  if (!rows) return;

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const firstName = pick(row, ["nombre", "name", "first name"]);
    const lastName = pick(row, ["apellidos", "apellido", "last name", "surname"]);
    if (!firstName && !lastName) continue;

    const birthRaw = pick(row, ["fecha de nacimiento", "nacimiento", "birth", "birthdate"]);
    const birth = parseDate(birthRaw);

    const values = {
      firstName: firstName || lastName,
      lastName: firstName ? lastName : "",
      birthDate: birth ? toDateOnly(birth) : null,
      level: mapLevel(pick(row, ["nivel", "level"])),
      gender: mapGender(pick(row, ["sexo", "genero", "género", "gender"])),
      phone: pick(row, ["telefono", "teléfono", "phone", "móvil", "movil"]) || null,
    };

    const fullKey = normalize(`${values.firstName} ${values.lastName}`);

    // Upsert by full name.
    const existing = await db
      .select({ id: students.id })
      .from(students)
      .where(
        and(
          eq(students.firstName, values.firstName),
          eq(students.lastName, values.lastName)
        )
      )
      .limit(1);

    if (existing[0]) {
      await db.update(students).set(values).where(eq(students.id, existing[0].id));
      studentIdByName.set(fullKey, existing[0].id);
      // Also index by first name only, for relations that use only the name.
      studentIdByName.set(normalize(values.firstName), existing[0].id);
      updated++;
    } else {
      const [ins] = await db.insert(students).values(values).returning({ id: students.id });
      studentIdByName.set(fullKey, ins.id);
      studentIdByName.set(normalize(values.firstName), ins.id);
      created++;
    }
  }

  console.log(`✅ Alumnos: ${created} creados, ${updated} actualizados.`);
}

function resolveStudentId(name: string): string | null {
  const key = normalize(name);
  if (studentIdByName.has(key)) return studentIdByName.get(key)!;
  // Match by prefix (partial name).
  for (const [k, id] of studentIdByName) {
    if (k.startsWith(key) || key.startsWith(k)) return id;
  }
  return null;
}

async function importClasses() {
  const rows = readCsv("CLASSES_CSV", "clases.csv");
  if (!rows) return;

  let created = 0;
  const missing = new Set<string>();

  for (const row of rows) {
    const startRaw = pick(row, ["fecha y hora", "fecha", "date", "cuando", "cuándo"]);
    const start = parseDate(startRaw);
    if (!start) {
      console.warn(`  ↳ Clase sin fecha válida, se omite: "${startRaw}"`);
      continue;
    }

    const values = {
      type: mapClassType(pick(row, ["tipo", "tipo de clase", "type"])),
      status: mapClassStatus(pick(row, ["estado", "status"])),
      startsAt: start,
      durationMin: 60,
      courtPrice: parseAmount(pick(row, ["precio pista", "precio de la pista", "pista"])).toFixed(2),
      classPrice: parseAmount(pick(row, ["precio clase", "precio de la clase", "clase", "precio"])).toFixed(2),
      notes: pick(row, ["comentario", "comentarios", "notas", "notes"]) || null,
    };

    const [cls] = await db.insert(classes).values(values).returning({ id: classes.id });
    created++;

    // Students of the class (relation).
    const names = splitNames(pick(row, ["alumnos", "alumno", "students", "jugadores"]));
    const studentIds = new Set<string>();
    for (const name of names) {
      const id = resolveStudentId(name);
      if (id) studentIds.add(id);
      else missing.add(name);
    }
    if (studentIds.size) {
      await db
        .insert(classStudents)
        .values([...studentIds].map((studentId) => ({ classId: cls.id, studentId })))
        .onConflictDoNothing();
    }
  }

  console.log(`✅ Clases: ${created} creadas.`);
  if (missing.size) {
    console.warn(
      `⚠️  Alumnos no encontrados para algunas clases: ${[...missing].join(", ")}`
    );
  }
}

async function importPayments() {
  const rows = readCsv("PAYMENTS_CSV", "pagos.csv");
  if (!rows) return;

  let count = 0;
  const missing = new Set<string>();

  for (const row of rows) {
    const studentName = pick(row, ["alumno", "jugador", "alumnos", "student", "name", "nombre"]);
    const studentId = resolveStudentId(studentName);
    if (!studentId) {
      if (studentName) missing.add(studentName);
      continue;
    }

    // Period: may come as a "month" (date) or as separate columns.
    const periodRaw = pick(row, ["mes", "periodo", "período", "month", "fecha"]);
    const period = parseDate(periodRaw);
    const amount = parseAmount(pick(row, ["importe", "cantidad", "precio", "amount", "total"]));
    const paidRaw = normalize(pick(row, ["pagado", "estado", "paid", "status"]));
    const paid = ["si", "sí", "true", "yes", "ok", "pagado", "cobrado"].includes(paidRaw);

    const [inserted] = await db
      .insert(payments)
      .values({
        amount: amount.toFixed(2),
        paid,
        paidAt: paid ? toDateOnly(period ?? new Date()) : null,
        studentId,
        period: toMonthStart(period ?? new Date()),
      })
      .onConflictDoNothing({ target: [payments.studentId, payments.period] })
      .returning({ id: payments.id });
    if (!inserted) continue;
    count++;
  }

  console.log(`✅ Pagos: ${count} importados.`);
  if (missing.size) {
    console.warn(`⚠️  Alumnos no encontrados para algunos pagos: ${[...missing].join(", ")}`);
  }
}

async function main() {
  console.log("🎾 Importando datos de Notion…");
  // Preload existing students into the index (in case classes/payments are imported separately).
  const existing = await db
    .select({ id: students.id, firstName: students.firstName, lastName: students.lastName })
    .from(students);
  for (const s of existing) {
    studentIdByName.set(normalize(`${s.firstName} ${s.lastName}`), s.id);
    studentIdByName.set(normalize(s.firstName), s.id);
  }

  await importStudents();
  await importClasses();
  await importPayments();

  console.log("\n🏁 Importación finalizada.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error en la importación:", err);
  process.exit(1);
});
