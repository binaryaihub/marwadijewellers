#!/usr/bin/env node
// One-time (re-runnable) seed: read content/products.json and INSERT into the
// products table on Postgres. Skips slugs that already exist, so it's safe to
// run multiple times.
//
// Run after `pnpm db:push` has created the schema, with DATABASE_URL set.
//
//   node scripts/seed-products-from-json.mjs            # full seed
//   node scripts/seed-products-from-json.mjs --limit 5  # smoke test

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const args = process.argv.slice(2);
const LIMIT = (() => {
  const i = args.indexOf("--limit");
  return i >= 0 ? Number(args[i + 1]) : Infinity;
})();

async function loadEnv() {
  // Try .env.local then .env. Don't pull in dotenv to avoid extra deps.
  for (const name of [".env.local", ".env"]) {
    try {
      const text = await fs.readFile(path.join(ROOT, name), "utf8");
      for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq < 0) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      /* ignore */
    }
  }
}

await loadEnv();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local then re-run.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const jsonPath = path.join(ROOT, "content/products.json");
let raw;
try {
  raw = await fs.readFile(jsonPath, "utf8");
} catch {
  console.error(`Couldn't read ${jsonPath}. Has the file been removed already?`);
  process.exit(1);
}
const products = JSON.parse(raw).slice(0, LIMIT === Infinity ? undefined : LIMIT);

console.log(`\n→ Seeding ${products.length} products into Postgres\n`);

let inserted = 0;
let skipped = 0;
let failed = 0;

for (const p of products) {
  const slug = p.slug;
  if (!slug) {
    failed++;
    continue;
  }

  // Check existence first; safer than ON CONFLICT DO NOTHING because we want
  // an honest count without surprising RLS or index quirks.
  const existing = await sql`SELECT 1 FROM products WHERE slug = ${slug} LIMIT 1`;
  if (existing.length > 0) {
    skipped++;
    process.stdout.write(`\r  ${inserted} new · ${skipped} skipped · ${failed} failed     `);
    continue;
  }

  const occasion = Array.isArray(p.occasion) ? p.occasion.join("\n") : "";
  const images = Array.isArray(p.images) ? p.images.join("\n") : "";
  const policy = p.returnPolicy ?? { type: "returnable", days: 7 };

  try {
    await sql`
      INSERT INTO products (
        slug, name, category, subcategory, price, mrp, material, occasion,
        images, description, dimensions, care, stock, featured, is_new, status,
        return_policy_type, return_days, return_note, source_id, source_category
      ) VALUES (
        ${slug}, ${p.name}, ${p.category}, ${p.subcategory}, ${p.price}, ${p.mrp},
        ${p.material ?? ""}, ${occasion}, ${images}, ${p.description ?? ""},
        ${p.dimensions ?? null}, ${p.care ?? null}, ${p.stock ?? 0},
        ${!!p.featured}, ${!!p.new}, ${"active"},
        ${policy.type ?? "returnable"}, ${policy.days ?? 7}, ${policy.note ?? null},
        ${p.sourceId ?? null}, ${p.sourceCategory ?? null}
      )
    `;
    inserted++;
  } catch (e) {
    failed++;
    console.error(`\n  ✗ ${slug}: ${e instanceof Error ? e.message : e}`);
  }
  process.stdout.write(`\r  ${inserted} new · ${skipped} skipped · ${failed} failed     `);
}

console.log(`\n\n✓ Done. ${inserted} new, ${skipped} skipped, ${failed} failed.`);

if (inserted > 0) {
  console.log("\nTip: archive the JSON file once you're confident the seed is good:");
  console.log("  mv content/products.json content/products.seed.json\n");
}
