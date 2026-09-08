import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
export const sqlClient = postgres(connectionString ?? "postgres://localhost:5432/padel", { prepare: false });
export const db = drizzle(sqlClient, { schema });
