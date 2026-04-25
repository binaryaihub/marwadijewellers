import { Container, SectionHeader } from "@/components/ui/Container";
import { ShopFilters } from "@/components/product/ShopFilters";
import { getByCategory } from "@/lib/products";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Men" };

export default async function MenShopPage() {
  const { t } = await getT();
  const products = getByCategory("men");
  return (
    <Container className="py-12 md:py-16">
      <SectionHeader
        eyebrow={t("shop.men.eyebrow")}
        title={t("shop.men.title")}
        description={t("shop.men.desc")}
      />
      <ShopFilters products={products} />
    </Container>
  );
}
