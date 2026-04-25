# Marwadi Jewellers (MJ)

Modern e-commerce storefront for an imitation jewellery brand. Next.js 15 + Tailwind v4 + Drizzle (SQLite) + UPI checkout.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # then edit with your values
pnpm db:push                 # creates dev.db with the orders schema
pnpm dev                     # http://localhost:3000
```

## What's inside

- **Storefront** — `/` landing, `/shop`, `/shop/men`, `/shop/women`, `/shop/[slug]`
- **Cart** — slide-in drawer + `/cart` page (Zustand + localStorage)
- **Checkout** — `/checkout` (address) → `/checkout/pay/[orderId]` (UPI QR + UTR)
- **Order tracking** — `/orders/[id]`
- **Admin** — `/admin/login`, `/admin/orders` (verify UTR, mark shipped)
- **Static** — `/about`, `/contact`, `/policies/shipping|returns|privacy`

## Environment variables

See `.env.example`. Important ones to set before going live:

- `NEXT_PUBLIC_UPI_ID` — your real UPI ID (e.g. `marwadi@okicici`)
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `ADMIN_PASSWORD` and `ADMIN_COOKIE_SECRET` (32+ random chars)

## Adding products

Edit `content/products.json`. Each entry needs: `slug`, `name`, `category` (`women`|`men`), `subcategory`, `price`, `mrp`, `images`, `description`, `material`, `stock`, etc.

Images can be:
- A path under `/public/images/products/...`
- An absolute URL (Unsplash hosts whitelisted in `next.config.ts`)
- A `placeholder://kind/seed` ref — renders an inline SVG placeholder (used in MVP)

## Production deploy (Vercel)

1. Push to GitHub, import in Vercel.
2. Add env vars in the Vercel dashboard.
3. For order persistence in production, swap SQLite for Neon Postgres:
   - Provision a Postgres on Neon (free).
   - Replace `better-sqlite3` + `drizzle-orm/better-sqlite3` with `@neondatabase/serverless` + `drizzle-orm/neon-http`.
   - Update `lib/db/schema.ts` to use `pgTable` and `lib/db/index.ts` accordingly.
   - Run `drizzle-kit push` against the Neon URL.

## Scripts

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm db:push` — sync schema to the database
- `pnpm db:studio` — open Drizzle Studio for the orders table
