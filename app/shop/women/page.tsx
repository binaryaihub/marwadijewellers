import type { Metadata } from "next";
import { Container, SectionHeader } from "@/components/ui/Container";
import { ShopFilters } from "@/components/product/ShopFilters";
import { getByCategory } from "@/lib/products";
import { getT } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";
import { AdminFloatingActions } from "@/components/admin/AdminFloatingActions";
import { breadcrumbJsonLd, collectionPageJsonLd, jsonLdScript } from "@/lib/seo/jsonld";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Women's jewellery — kundan, polki, mangalsutra & more",
  description:
    "Shop women's imitation jewellery online — bridal kundan, polki necklaces, mangalsutra, jhumkas, ranihaar, ponchi, tevta and more. Free shipping across India.",
  alternates: { canonical: "/shop/women" },
  openGraph: {
    title: "Women's collection — Marwadi Jewellers",
    description: "Bridal kundan, polki, mangalsutra, jhumkas and more — heritage and modern, side by side.",
    url: "/shop/women",
    type: "website",
  },
};

export default async function WomenShopPage() {
  const { t } = await getT();
  const adminView = await isAdmin();
  let products: Awaited<ReturnType<typeof getByCategory>> = [];
  try {
    products = await getByCategory("women", { includeArchived: adminView });
  } catch (err) {
    console.error("Failed to load women catalog:", err);
  }
  return (
    <Container className="py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          collectionPageJsonLd({
            url: "/shop/women",
            name: "Women's imitation jewellery — Marwadi Jewellers",
            description:
              "Bridal kundan, polki, mangalsutra, jhumkas, ranihaar, ponchi and more — for every occasion.",
            products,
          }),
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Women", url: "/shop/women" },
          ]),
        )}
      />
      <SectionHeader
        as="h1"
        eyebrow={t("shop.women.eyebrow")}
        title={t("shop.women.title")}
        description={t("shop.women.desc")}
      />
      <ShopFilters products={products} isAdminView={adminView} />
      {adminView && <AdminFloatingActions />}
    </Container>
  );
}
