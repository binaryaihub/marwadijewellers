import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { ProductForm } from "@/components/admin/ProductForm";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <Container className="py-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-mj-mute hover:text-mj-ink mb-3"
      >
        <ChevronLeft className="size-4" /> Catalog
      </Link>
      <h1 className="font-display text-3xl mb-6">Add product</h1>
      <ProductForm mode="create" />
    </Container>
  );
}
