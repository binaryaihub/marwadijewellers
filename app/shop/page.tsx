import { Container, SectionHeader } from "@/components/ui/Container";
import { ShopFilters } from "@/components/product/ShopFilters";
import { getAllProducts } from "@/lib/products";
import { getT } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";
import { AdminFloatingActions } from "@/components/admin/AdminFloatingActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop all" };

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
      <SectionHeader eyebrow={t("shop.all.eyebrow")} title={t("shop.all.title")} description={t("shop.all.desc")} />
      <ShopFilters products={products} isAdminView={adminView} />
      {adminView && <AdminFloatingActions />}
    </Container>
  );
}
