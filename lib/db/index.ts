import "server-only";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const url = process.env.DATABASE_URL?.replace(/^file:/, "") ?? "./dev.db";

const globalForDb = globalThis as unknown as { __mjSqlite?: Database.Database };
const sqlite = globalForDb.__mjSqlite ?? new Database(url);
sqlite.pragma("journal_mode = WAL");
if (process.env.NODE_ENV !== "production") globalForDb.__mjSqlite = sqlite;

export const db = drizzle(sqlite, { schema });
export { schema };
