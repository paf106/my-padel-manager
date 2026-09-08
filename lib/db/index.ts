import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL is required in production");
}

export const sqlClient = postgres(connectionString ?? "postgres://localhost:5432/padel", { prepare: false });
export const db = drizzle(sqlClient, { schema });
