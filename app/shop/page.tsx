import type { Metadata } from "next";
import { Container, SectionHeader } from "@/components/ui/Container";
import { ShopFilters } from "@/components/product/ShopFilters";
import { getAllProducts } from "@/lib/products";
import { getT } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";
import { AdminFloatingActions } from "@/components/admin/AdminFloatingActions";
import { breadcrumbJsonLd, collectionPageJsonLd, jsonLdScript } from "@/lib/seo/jsonld";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop all imitation jewellery",
  description:
    "Browse the full Marwadi Jewellers catalog — necklaces, mangalsutras, jhumkas, bangles, rings, kadas and more. Hand-curated, free shipping across India.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop all — Marwadi Jewellers",
    description:
      "Browse the full Marwadi Jewellers catalog of hand-curated imitation jewellery.",
    url: "/shop",
    type: "website",
  },
};

export default async function ShopPage() {
  const { t } = await getT();
  const adminView = await isAdmin();
  let products: Awaited<ReturnType<typeof getAllProducts>> = [];
  try {
    products = await getAllProducts({ includeArchived: adminView });
  } catch (err) {
    console.error("Failed to load catalog:", err);
  }
  return (
    <Container className="py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          collectionPageJsonLd({
            url: "/shop",
            name: "Shop all — Marwadi Jewellers",
            description:
              "Hand-curated imitation jewellery — necklaces, mangalsutras, jhumkas, bangles, rings, kadas and more.",
            products,
          }),
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Shop", url: "/shop" },
          ]),
        )}
      />
      <SectionHeader
        as="h1"
        eyebrow={t("shop.all.eyebrow")}
        title={t("shop.all.title")}
        description={t("shop.all.desc")}
      />
      <ShopFilters products={products} isAdminView={adminView} />
      {adminView && <AdminFloatingActions />}
    </Container>
  );
}
