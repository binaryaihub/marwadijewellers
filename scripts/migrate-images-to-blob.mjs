#!/usr/bin/env node
// Migrates locally committed product images (public/images/products/serdiya/*)
// to Vercel Blob and rewrites products.images in Postgres to use the Blob URLs.
//
// Idempotent: re-running with images already uploaded is fast — `put` with
// allowOverwrite:true skips the body if it matches.
//
// Requires DATABASE_URL and BLOB_READ_WRITE_TOKEN in env (loaded from
// .env.local automatically below).

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const CONCURRENCY = 8;
const LOCAL_PREFIX = "/images/products/serdiya/";
const BLOB_PREFIX = "products/serdiya";

async function loadEnv() {
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
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is not set. Add it to .env.local then re-run.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

function contentTypeFor(filename) {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "application/octet-stream";
}

// Memoise so two products that share an image (rare but possible) only upload once.
const cache = new Map();

async function uploadOne(localImagePath) {
  if (cache.has(localImagePath)) return cache.get(localImagePath);
  const filename = path.basename(localImagePath);
  const fullPath = path.join(ROOT, "public", localImagePath);
  const buf = await fs.readFile(fullPath);
  const blobPath = `${BLOB_PREFIX}/${filename}`;
  const blob = await put(blobPath, buf, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: contentTypeFor(filename),
  });
  cache.set(localImagePath, blob.url);
  return blob.url;
}

async function pool(items, limit, worker) {
  let cursor = 0;
  let done = 0;
  const errs = [];
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (cursor < items.length) {
        const idx = cursor++;
        try {
          await worker(items[idx], idx);
        } catch (e) {
          errs.push({ item: items[idx], error: e instanceof Error ? e.message : String(e) });
        }
        done++;
        process.stdout.write(`\r  ${done}/${items.length} processed   `);
      }
    }),
  );
  process.stdout.write("\n");
  return errs;
}

console.log("\n→ Migrating product images to Vercel Blob\n");

// Pull every product whose images string mentions the local prefix.
const candidates = await sql`
  SELECT slug, images
  FROM products
  WHERE images LIKE ${"%" + LOCAL_PREFIX + "%"}
  ORDER BY slug
`;
console.log(`  ✓ ${candidates.length} products with local image refs to migrate`);

if (candidates.length === 0) {
  console.log("\nNothing to do. Either nothing was on local paths, or migration already ran.");
  process.exit(0);
}

let updated = 0;
const skipped = [];

const errs = await pool(candidates, CONCURRENCY, async (row) => {
  const lines = row.images.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const newLines = [];
  let dirty = false;

  for (const line of lines) {
    if (line.startsWith(LOCAL_PREFIX)) {
      const url = await uploadOne(line);
      newLines.push(url);
      dirty = true;
    } else {
      newLines.push(line); // already a URL or placeholder, keep as is
    }
  }

  if (!dirty) {
    skipped.push(row.slug);
    return;
  }

  const newImages = newLines.join("\n");
  await sql`
    UPDATE products
    SET images = ${newImages}, updated_at = NOW()
    WHERE slug = ${row.slug}
  `;
  updated++;
});

console.log(`\n✓ Done. Updated ${updated} products. Skipped ${skipped.length}. Errors: ${errs.length}.`);
if (errs.length > 0) {
  console.log("\nFirst few errors:");
  for (const e of errs.slice(0, 5)) {
    console.log(`  ${e.item.slug}: ${e.error}`);
  }
}

console.log(`\nUploaded ${cache.size} unique image files to Blob.`);
console.log("\nNext: rm -rf public/images/products/serdiya, then commit and redeploy.\n");
