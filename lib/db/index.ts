import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

// Reuse a single connection across hot-reloads in development to avoid
// exhausting the connection pool.
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
  db: Db | undefined;
};

function createDb(): Db {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está definida. Copia .env.example a .env.local y añade la cadena de conexión de Supabase."
    );
  }

  // `prepare: false` is required when using Supabase's transaction pooler (pgBouncer).
  const client =
    globalForDb.client ?? postgres(connectionString, { prepare: false });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.client = client;
  }

  return drizzle(client, { schema });
}

/**
 * Lazily-initialized Drizzle client. The connection is only created the first
 * time a query is executed, so importing this module (e.g. during `next build`)
 * does not require DATABASE_URL to be present.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const instance = globalForDb.db ?? (globalForDb.db = createDb());
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export { schema };
