import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL?.trim()
  .replace(/^("|')(.*)\1$/, "$2")
  .trim();
if (!databaseUrl) throw new Error("DATABASE_URL is required to run Drizzle migrations.");

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
});
