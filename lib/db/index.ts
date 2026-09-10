import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString && process.env.NEXT_PHASE !== "phase-production-build") {
  throw new Error("DATABASE_URL is required");
}
const globalForDb = globalThis as typeof globalThis & { __padelSqlClient?: ReturnType<typeof postgres>; __padelDb?: ReturnType<typeof drizzle<typeof schema>> };
export const sqlClient = globalForDb.__padelSqlClient ?? postgres(connectionString ?? "postgres://localhost:5432/padel", { prepare: false, max: 4, idle_timeout: 20, connect_timeout: 10 });
export const db = globalForDb.__padelDb ?? drizzle(sqlClient, { schema });
if (process.env.NODE_ENV !== "production") {
  globalForDb.__padelSqlClient = sqlClient;
  globalForDb.__padelDb = db;
}
