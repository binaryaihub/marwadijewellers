import type { Config } from "drizzle-kit";

const url = process.env.DATABASE_URL?.replace(/^file:/, "") ?? "./dev.db";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url },
} satisfies Config;
