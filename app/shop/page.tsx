import { Container, SectionHeader } from "@/components/ui/Container";
import { ShopFilters } from "@/components/product/ShopFilters";
import { getAllProducts } from "@/lib/products";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Shop all" };

export default async function ShopPage() {
  const { t } = await getT();
  const products = getAllProducts();
  return (
    <Container className="py-12 md:py-16">
      <SectionHeader eyebrow={t("shop.all.eyebrow")} title={t("shop.all.title")} description={t("shop.all.desc")} />
      <ShopFilters products={products} />
    </Container>
  );
}
