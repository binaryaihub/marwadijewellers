import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

// Lazy init — Next.js's build step imports server modules to collect page data,
// and we don't want neon() to validate the connection string before runtime
// (during build, DATABASE_URL is often absent or a placeholder).
let _db: DB | null = null;

function getDb(): DB {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("postgres")) {
    throw new Error(
      "DATABASE_URL is not set to a Postgres connection string. " +
        "Provision a database at https://neon.tech (free) and put the URL in .env.local.",
    );
  }
  _db = drizzle(neon(url), { schema });
  return _db;
}

export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
}) as DB;

export { schema };
