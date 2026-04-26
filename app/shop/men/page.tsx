import { Container, SectionHeader } from "@/components/ui/Container";
import { ShopFilters } from "@/components/product/ShopFilters";
import { getByCategory } from "@/lib/products";
import { getT } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";
import { AdminFloatingActions } from "@/components/admin/AdminFloatingActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Men" };

export default async function MenShopPage() {
  const { t } = await getT();
  const adminView = await isAdmin();
  let products: Awaited<ReturnType<typeof getByCategory>> = [];
  try {
    products = await getByCategory("men", { includeArchived: adminView });
  } catch (err) {
    console.error("Failed to load men catalog:", err);
  }
  return (
    <Container className="py-12 md:py-16">
      <SectionHeader
        eyebrow={t("shop.men.eyebrow")}
        title={t("shop.men.title")}
        description={t("shop.men.desc")}
      />
      <ShopFilters products={products} isAdminView={adminView} />
      {adminView && <AdminFloatingActions />}
    </Container>
  );
}
