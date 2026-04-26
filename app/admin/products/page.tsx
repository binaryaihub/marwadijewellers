import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { adminListProducts, type ProductCategory, type ProductStatus } from "@/lib/products";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { AdminProductTable } from "@/components/admin/AdminProductTable";
import { AdminProductFilters } from "@/components/admin/AdminProductFilters";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catalog" };

interface SearchParams {
  q?: string;
  category?: string;
  status?: string;
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const sp = await searchParams;

  const filters = {
    search: sp.q,
    category: sp.category === "women" || sp.category === "men" ? (sp.category as ProductCategory) : undefined,
    status:
      sp.status === "active" || sp.status === "disabled" || sp.status === "archived"
        ? (sp.status as ProductStatus)
        : ("all" as const),
  };

  const products = await adminListProducts(filters);

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Catalog</h1>
          <p className="text-sm text-mj-mute">
            {products.length.toLocaleString("en-IN")} product{products.length === 1 ? "" : "s"} ·
            edit details, change status, or add new.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="size-4" /> Add product
          </Button>
        </Link>
      </div>

      <AdminProductFilters />
      <AdminProductTable products={products} />

      <p className="mt-6 text-xs text-mj-mute text-center">
        Bulk price updates, mass archive, and CSV import will land in a follow-up — for now,
        edits are per-product via the form. APIs in <code>/app/api/admin/products</code> already
        support batch operations programmatically.
      </p>
    </Container>
  );
}
