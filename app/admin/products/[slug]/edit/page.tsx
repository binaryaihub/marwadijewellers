import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { getBySlug } from "@/lib/products";
import { Container } from "@/components/ui/Container";
import { ProductForm } from "@/components/admin/ProductForm";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `Edit ${slug}` };
}

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { slug } = await params;
  const product = await getBySlug(slug, { includeAll: true });
  if (!product) return notFound();

  return (
    <Container className="py-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-mj-mute hover:text-mj-ink mb-3"
      >
        <ChevronLeft className="size-4" /> Catalog
      </Link>
      <h1 className="font-display text-3xl mb-1">Edit product</h1>
      <p className="text-sm text-mj-mute mb-6 font-mono">{product.slug}</p>
      <ProductForm mode="edit" product={product} />
    </Container>
  );
}
