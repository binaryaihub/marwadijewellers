import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartBlock } from "@/components/product/AddToCartBlock";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getAllProducts, getBySlug, getRelated, getReturnPolicy } from "@/lib/products";
import { formatINR, discountPercent } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import type { DictKey } from "@/lib/i18n/dict";
import { RotateCcw, ShieldX } from "lucide-react";

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getBySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getBySlug(slug);
  if (!product) return notFound();
  const { t } = await getT();

  const off = discountPercent(product.price, product.mrp);
  const related = getRelated(product.slug);

  return (
    <Container className="py-8 md:py-14">
      <nav className="mb-6 text-sm text-mj-mute">
        <Link href="/" className="hover:text-mj-maroon-700">{t("product.breadcrumb.home")}</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop/${product.category}`} className="hover:text-mj-maroon-700">
          {product.category === "women" ? t("nav.women") : t("nav.men")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-mj-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:gap-14 md:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} label={product.subcategory} />

        <div>
          <div className="flex items-center gap-2 mb-3">
            {product.new && <Badge tone="gold">{t("product.new")}</Badge>}
            <Badge tone="neutral">{t(`sub.${product.subcategory}` as DictKey)}</Badge>
            {product.stock <= 5 && product.stock > 0 && (
              <Badge tone="maroon">{t("product.onlyLeft", { n: product.stock })}</Badge>
            )}
          </div>

          <h1 className="font-serif-soft text-3xl md:text-4xl text-mj-ink leading-tight">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl md:text-3xl font-semibold text-mj-maroon-800">{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-base text-mj-mute line-through">{formatINR(product.mrp)}</span>
                <Badge tone="green">{t("product.save", { n: off })}</Badge>
              </>
            )}
          </div>

          <p className="mt-2 text-xs text-mj-mute">{t("product.taxIncl")}</p>

          <ReturnBadge product={product} />

          <p className="mt-6 text-mj-ink/85 leading-relaxed">{product.description}</p>

          <div className="mt-8">
            <AddToCartBlock product={product} />
          </div>

          <div className="mj-divider mt-10 mb-6" />

          <Spec label={t("product.spec.material")}>{product.material}</Spec>
          {product.dimensions && <Spec label={t("product.spec.dimensions")}>{product.dimensions}</Spec>}
          {product.care && <Spec label={t("product.spec.care")}>{product.care}</Spec>}
          <Spec label={t("product.spec.occasion")}>
            <span className="capitalize">{product.occasion.join(", ")}</span>
          </Spec>
          <Spec label={t("product.spec.returns")}>
            <ReturnSpec product={product} />
          </Spec>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl md:text-3xl text-mj-ink mb-6">{t("product.related")}</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </Container>
  );
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 py-2 text-sm">
      <dt className="text-mj-mute uppercase tracking-wider text-xs">{label}</dt>
      <dd className="text-mj-ink">{children}</dd>
    </div>
  );
}

async function ReturnBadge({ product }: { product: Parameters<typeof getReturnPolicy>[0] }) {
  const { t } = await getT();
  const policy = getReturnPolicy(product);
  const labelKey: DictKey =
    policy.type === "non-returnable"
      ? "product.return.nonReturnable"
      : policy.type === "exchange-only"
        ? "product.return.exchangeOnly"
        : "product.return.returnable";
  const positive = policy.type !== "non-returnable";
  const Icon = positive ? RotateCcw : ShieldX;

  return (
    <Link
      href="/policies/returns"
      className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        positive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-mj-line bg-mj-cream text-mj-mute hover:bg-mj-line"
      }`}
      aria-label={t("product.return.cta")}
    >
      <Icon className="size-3.5" />
      {t(labelKey, { n: policy.days })}
    </Link>
  );
}

async function ReturnSpec({ product }: { product: Parameters<typeof getReturnPolicy>[0] }) {
  const { t } = await getT();
  const policy = getReturnPolicy(product);
  const labelKey: DictKey =
    policy.type === "non-returnable"
      ? "product.return.nonReturnable"
      : policy.type === "exchange-only"
        ? "product.return.exchangeOnly"
        : "product.return.returnable";
  return (
    <span>
      {t(labelKey, { n: policy.days })}
      {policy.note && <span className="block text-xs text-mj-mute mt-0.5">{policy.note}</span>}
    </span>
  );
}
