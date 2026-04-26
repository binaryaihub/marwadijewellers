import type { Product } from "@/lib/products";

const SITE_URL = "https://marwadijewellers.com";
const BRAND = "Marwadi Jewellers";

function abs(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ── Organization ──────────────────────────────────────────────────────
//  Used site-wide so Google can build a Knowledge Panel for the brand.

export function organizationJsonLd() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@marwadijewellers.com";
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+91";
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineStore"],
    name: BRAND,
    legalName: BRAND,
    url: SITE_URL,
    logo: abs("/icon.svg"),
    image: abs("/opengraph-image"),
    description:
      "Heritage-inspired imitation jewellery for women and men — kundan, polki, mangalsutra, jhumkas, chains and more. Hand-curated, ships across India.",
    email,
    sameAs: [
      // Update these once the social profiles go live; keeping placeholders
      // here helps Google associate the brand once they're filled in.
      "https://www.instagram.com/marwadijewellers",
      "https://www.facebook.com/marwadijewellers",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: phone,
        email,
        availableLanguage: ["en", "hi"],
        areaServed: "IN",
      },
    ],
  };
}

// ── WebSite + Sitelinks SearchBox ─────────────────────────────────────
//  Lets Google show a search box inside our brand-name SERP.

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND,
    url: SITE_URL,
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ── Product + Offer ───────────────────────────────────────────────────
//  Per-product page. Offer is the highest-value rich-result type for an
//  e-commerce store — when Google trusts this, the SERP entry can show
//  price + in-stock status, dramatically improving CTR.

export function productJsonLd(product: Product) {
  const url = abs(`/shop/${product.slug}`);
  const images = product.images.length > 0 ? product.images.map(abs) : [abs("/opengraph-image")];
  const availability =
    product.status !== "active"
      ? "https://schema.org/Discontinued"
      : product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";

  // priceValidUntil is required by Google for Offer; default to 1 year out.
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description.slice(0, 4000),
    sku: product.slug,
    mpn: product.slug,
    brand: { "@type": "Brand", name: BRAND },
    category: `${product.category} / ${product.subcategory}`,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: String(product.price),
      ...(product.mrp > product.price ? { eligibleQuantity: { "@type": "QuantitativeValue", value: 1 } } : {}),
      itemCondition: "https://schema.org/NewCondition",
      availability,
      priceValidUntil,
      seller: { "@type": "Organization", name: BRAND },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "INR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: product.returnPolicy?.days ?? 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };
}

// ── BreadcrumbList ────────────────────────────────────────────────────

export interface Crumb {
  name: string;
  url: string; // can be relative; we'll absolutize
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.url),
    })),
  };
}

// ── CollectionPage with embedded ItemList ─────────────────────────────
//  Use on /shop, /shop/women, /shop/men. Helps Google understand each
//  page is a list of products, not a single article.

export function collectionPageJsonLd(opts: {
  url: string; // relative or absolute
  name: string;
  description: string;
  products: Product[];
}) {
  const { url, name, description, products } = opts;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: abs(url),
    inLanguage: "en-IN",
    isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 24).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: abs(`/shop/${p.slug}`),
        name: p.name,
      })),
    },
  };
}

// ── Render helper ─────────────────────────────────────────────────────
//  Returns a script-tag string suitable for dangerouslySetInnerHTML.

export function jsonLdScript(data: unknown): { __html: string } {
  // JSON.stringify with no indentation — smaller payload, identical to what
  // Google's structured-data tools expect.
  return { __html: JSON.stringify(data) };
}
