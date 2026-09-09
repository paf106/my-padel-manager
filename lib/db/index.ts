import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString && process.env.NEXT_PHASE !== "phase-production-build") {
  throw new Error("DATABASE_URL is required");
}
export const sqlClient = postgres(connectionString ?? "postgres://localhost:5432/padel", { prepare: false });
export const db = drizzle(sqlClient, { schema });
