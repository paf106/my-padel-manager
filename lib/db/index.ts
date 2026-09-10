import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;
type GlobalDatabase = typeof globalThis & { __padelSqlClient?: ReturnType<typeof postgres>; __padelDb?: Database };

const globalForDb = globalThis as GlobalDatabase;

function getDatabase() {
  if (globalForDb.__padelDb) return globalForDb.__padelDb;

  const rawConnectionString = process.env.DATABASE_URL?.trim();
  const connectionString = rawConnectionString?.replace(/^(["'])(.*)\1$/, "$2").trim();
  if (!connectionString) throw new Error("DATABASE_URL is required and must point to Supabase PostgreSQL.");

  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL is invalid. Use the Supabase PostgreSQL URL without surrounding quotes or a `psql` prefix.");
  }
  if (!parsed.protocol.startsWith("postgres")) throw new Error("DATABASE_URL must use the postgres:// or postgresql:// protocol.");

  const sqlClient = globalForDb.__padelSqlClient ?? postgres(connectionString, { prepare: false, max: 4, idle_timeout: 20, connect_timeout: 10 });
  const database = globalForDb.__padelDb ?? drizzle(sqlClient, { schema });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__padelSqlClient = sqlClient;
    globalForDb.__padelDb = database;
  }
  return database;
}

export const db = new Proxy({} as Database, {
  get(_target, property, receiver) {
    return Reflect.get(getDatabase(), property, receiver);
  },
});
