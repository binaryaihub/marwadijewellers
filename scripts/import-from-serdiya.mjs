#!/usr/bin/env node
// ⚠️ DEPRECATED — kept for reference only.
//
// This script was the original one-shot importer that fetched products from
// https://serdiya.shop and wrote them to content/products.json + downloaded
// images to public/images/products/serdiya/. It produced the seed data that
// scripts/seed-products-from-json.mjs then loaded into Postgres, and the
// images were later migrated to Vercel Blob via scripts/migrate-images-to-blob.mjs.
//
// As of the catalog migration to Postgres + Blob:
//  - Products live in the `products` table (Neon)
//  - Images live in Vercel Blob (the `marwadijewellers` public store, BOM1)
//  - Add new products via /admin/products/new (drag-and-drop image upload)
//
// If you ever need to re-import from serdiya.shop, this script needs a rewrite
// to (a) write directly to the products table via @neondatabase/serverless,
// (b) upload images via @vercel/blob put() instead of writing to public/.
// See scripts/migrate-images-to-blob.mjs for the Blob upload pattern and
// scripts/seed-products-from-json.mjs for the Postgres insert pattern.
//
// Original usage (no longer functional end-to-end since content/products.json
// is no longer read at runtime):
//   node scripts/import-from-serdiya.mjs [--limit N] [--no-images]

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const SOURCE = "https://serdiya.shop";
const PER_PAGE = 100;
const IMAGE_CONCURRENCY = 6;
const UA = "Mozilla/5.0 (compatible; mj-importer/1.0)";

const args = process.argv.slice(2);
const LIMIT = (() => {
  const i = args.indexOf("--limit");
  return i >= 0 ? Number(args[i + 1]) : Infinity;
})();
const SKIP_IMAGES = args.includes("--no-images");

// Subcategory mapping: source category slug → our app's subcategory slug.
const SUBCATEGORY_MAP = {
  "earring": "earrings",
  "ring": "ring",
  "chain": "chain",
  "mangalsutra": "mangalsutra",
  "necklace": "necklace",
  "ranihaar-ramnavmi": "ranihaar",
  "chokar-jodhahaar": "chokar",
  "sohan-kanthi": "necklace",
  "marwadi-full": "marwadi-set",
  "jela": "necklace",
  "matar-mala": "necklace",
  "aad-rajsthani": "aad",
  "adkolar": "necklace",
  "combo-set": "combo-set",
  "pendant-with-chain": "pendant",
  "jhumki": "jhumki",
  "nath": "nath",
  "bajuband": "bajuband",
  "armlet": "armlet",
  "ponchi": "ponchi",
  "hathful-hathpanja": "hathphool",
  "rakhdiset": "rakhdi",
  "tevta": "tevta",
  "mangtika": "mangtika",
  "shisful": "shisful",
  "hairband": "hairband",
};

// Categories that map to "men". Everything else → "women".
const MEN_CATEGORY_SLUGS = new Set(["chain"]);

// Default occasion tags, by subcategory.
const OCCASION_BY_SUB = {
  "earrings": ["festive", "daily"],
  "jhumki": ["festive", "wedding"],
  "ring": ["daily", "office"],
  "chain": ["daily", "festive"],
  "mangalsutra": ["wedding", "festive"],
  "necklace": ["wedding", "festive"],
  "ranihaar": ["wedding", "festive"],
  "chokar": ["wedding", "festive"],
  "marwadi-set": ["wedding", "festive"],
  "aad": ["wedding", "festive"],
  "combo-set": ["wedding", "festive"],
  "pendant": ["daily", "festive"],
  "nath": ["wedding", "festive"],
  "bajuband": ["wedding", "festive"],
  "armlet": ["wedding", "festive"],
  "ponchi": ["wedding", "festive"],
  "hathphool": ["wedding", "haldi", "mehendi"],
  "rakhdi": ["wedding", "festive"],
  "tevta": ["wedding", "festive"],
  "mangtika": ["wedding", "festive"],
  "shisful": ["wedding", "festive"],
  "hairband": ["festive", "daily"],
};

const NICE_NAME = {
  "earring": "Earrings",
  "ring": "Ring",
  "chain": "Chain",
  "mangalsutra": "Mangalsutra",
  "necklace": "Necklace",
  "ranihaar-ramnavmi": "Ranihaar",
  "chokar-jodhahaar": "Chokar / Jodha Haar",
  "sohan-kanthi": "Sohan Kanthi",
  "marwadi-full": "Marwadi Full Set",
  "jela": "Jela",
  "matar-mala": "Matar Mala",
  "aad-rajsthani": "Aad — Rajasthani",
  "adkolar": "Aad Kolar",
  "combo-set": "Combo Set",
  "pendant-with-chain": "Pendant with Chain",
  "jhumki": "Jhumki",
  "nath": "Nath",
  "bajuband": "Bajuband",
  "armlet": "Armlet",
  "ponchi": "Ponchi",
  "hathful-hathpanja": "Hathphool / Hath Panja",
  "rakhdiset": "Rakhdi Set",
  "tevta": "Tevta",
  "mangtika": "Mangtika",
  "shisful": "Shisful",
  "hairband": "Hairband",
};

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function deriveName(rawName, sourceCatName) {
  const n = (rawName || "").trim();
  if (!n || n.length < 3 || /^\d+$/.test(n)) {
    return `${sourceCatName} — ${titleCase((n || "piece").slice(0, 24))}`.trim();
  }
  return titleCase(n);
}

function normalizePrice(minor, minorUnit = 2) {
  const n = Number(minor);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n / Math.pow(10, minorUnit));
}

function imageFilename(slug, idx, srcUrl) {
  const ext = (srcUrl.match(/\.(jpe?g|png|webp|gif)(?:\?|$)/i)?.[1] || "jpg").toLowerCase();
  return `${slug}${idx === 0 ? "" : `-${idx + 1}`}.${ext === "jpeg" ? "jpg" : ext}`;
}

function pickBestSrc(image) {
  // Prefer the largest jpg under ~1500px wide so we don't pull 2560-wide originals.
  const srcset = image.srcset || "";
  const candidates = [];
  for (const entry of srcset.split(",")) {
    const m = entry.trim().match(/^(\S+)\s+(\d+)w$/);
    if (m) candidates.push({ url: m[1], width: Number(m[2]) });
  }
  if (candidates.length > 0) {
    candidates.sort((a, b) => a.width - b.width);
    const target = candidates.find((c) => c.width >= 800 && c.width <= 1600) || candidates[candidates.length - 1];
    return target.url;
  }
  return image.src;
}

async function fetchPage(page) {
  const url = `${SOURCE}/wp-json/wc/store/v1/products?per_page=${PER_PAGE}&page=${page}&orderby=date&order=desc`;
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`Failed to fetch page ${page}: ${res.status}`);
  return res.json();
}

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  while (all.length < LIMIT) {
    process.stdout.write(`\r  fetching page ${page}…    `);
    const batch = await fetchPage(page);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < PER_PAGE) break;
    page += 1;
    if (all.length >= LIMIT) break;
  }
  process.stdout.write("\n");
  return all.slice(0, LIMIT);
}

async function downloadImage(url, dest) {
  try {
    await fs.access(dest);
    return { ok: true, skipped: true };
  } catch {
    /* not present, continue */
  }
  const res = await fetch(url, { headers: { "user-agent": UA, referer: SOURCE } });
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  return { ok: true, bytes: buf.length };
}

async function pool(items, limit, worker) {
  const out = [];
  let cursor = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        try {
          out[i] = await worker(items[i], i);
        } catch (e) {
          out[i] = { error: e instanceof Error ? e.message : String(e) };
        }
        done++;
        process.stdout.write(`\r  downloading images… ${done}/${items.length}    `);
      }
    }),
  );
  process.stdout.write("\n");
  return out;
}

async function main() {
  console.log(`\n→ Importing from ${SOURCE}`);
  console.log(`  per_page=${PER_PAGE}  limit=${LIMIT === Infinity ? "all" : LIMIT}  images=${SKIP_IMAGES ? "no" : "yes"}\n`);

  const products = await fetchAllProducts();
  console.log(`  ✓ fetched ${products.length} products`);

  const IMG_DIR = path.join(ROOT, "public/images/products/serdiya");

  const mapped = [];
  const downloads = []; // { url, dest, slug }
  const seenSlugs = new Set();

  for (const p of products) {
    if (!p.is_purchasable && !p.is_in_stock) continue;
    if (!p.images || p.images.length === 0) continue;

    const sourceCat = p.categories?.[0];
    const sourceCatSlug = sourceCat?.slug ?? "necklace";
    const sourceCatName = NICE_NAME[sourceCatSlug] ?? sourceCat?.name ?? titleCase(sourceCatSlug);

    let slug = p.slug;
    let dedupe = 1;
    while (seenSlugs.has(slug)) {
      slug = `${p.slug}-${++dedupe}`;
    }
    seenSlugs.add(slug);

    const name = deriveName(p.name, sourceCatName);
    const subcategory = SUBCATEGORY_MAP[sourceCatSlug] ?? sourceCatSlug;
    const category = MEN_CATEGORY_SLUGS.has(sourceCatSlug) ? "men" : "women";
    const minorUnit = p.prices?.currency_minor_unit ?? 2;
    const price = normalizePrice(p.prices?.price, minorUnit);
    const mrp = normalizePrice(p.prices?.regular_price ?? p.prices?.price, minorUnit);

    const description =
      stripHtml(p.description) ||
      stripHtml(p.short_description) ||
      `Authentic ${sourceCatName} crafted in traditional Marwadi style. Hand-finished imitation jewellery, plated for shine and tuned for everyday and festive wear.`;

    const images = [];
    for (let i = 0; i < Math.min(p.images.length, 4); i++) {
      const img = p.images[i];
      const src = pickBestSrc(img);
      const filename = imageFilename(slug, i, src);
      const dest = path.join(IMG_DIR, filename);
      images.push(`/images/products/serdiya/${filename}`);
      downloads.push({ url: src, dest, slug });
    }

    mapped.push({
      slug,
      name,
      category,
      subcategory,
      price: price || 999,
      mrp: Math.max(mrp, price),
      material: "Brass / alloy with gold polish — imitation",
      occasion: OCCASION_BY_SUB[subcategory] || ["festive"],
      images,
      description,
      stock: p.is_in_stock ? (p.low_stock_remaining ?? 10) : 0,
      // Default policy: every imported SKU is returnable + exchangeable for 7
      // days. Override per-product later if specific items become non-returnable.
      returnPolicy: { type: "returnable", days: 7 },
      sourceId: p.id,
      sourceCategory: sourceCatName,
    });
  }

  // Mark some products featured + new based on source order (most-recent first).
  for (let i = 0; i < mapped.length; i++) {
    if (i < 12) mapped[i].featured = true;
    if (i < 24) mapped[i].new = true;
  }

  console.log(`  ✓ mapped ${mapped.length} products`);

  if (!SKIP_IMAGES) {
    console.log(`  → downloading ${downloads.length} images to ${path.relative(ROOT, IMG_DIR)}/`);
    await fs.mkdir(IMG_DIR, { recursive: true });
    const results = await pool(downloads, IMAGE_CONCURRENCY, async (job) => downloadImage(job.url, job.dest));
    const errors = results.filter((r) => r && r.ok === false);
    const skipped = results.filter((r) => r && r.skipped).length;
    console.log(`  ✓ images: ${results.length - errors.length - skipped} new, ${skipped} cached, ${errors.length} failed`);
    if (errors.length > 0) {
      const sample = errors.slice(0, 3).map((e) => e.error).join(", ");
      console.log(`     first errors: ${sample}`);
    }
  } else {
    console.log("  ⚠ skipping image downloads (--no-images)");
  }

  const outPath = path.join(ROOT, "content/products.json");
  await fs.writeFile(outPath, JSON.stringify(mapped, null, 2) + "\n");
  console.log(`  ✓ wrote ${path.relative(ROOT, outPath)} (${mapped.length} products)`);

  // Summary by category/subcategory.
  const counts = {};
  for (const m of mapped) {
    const k = `${m.category} · ${m.subcategory}`;
    counts[k] = (counts[k] || 0) + 1;
  }
  console.log("\n  Distribution:");
  Object.keys(counts)
    .sort()
    .forEach((k) => console.log(`    ${k.padEnd(28)} ${counts[k]}`));

  console.log("\n✓ Done. Reload http://localhost:3000/shop to see the new catalog.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
