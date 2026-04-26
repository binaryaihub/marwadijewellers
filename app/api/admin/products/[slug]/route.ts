import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { productPatchSchema } from "@/lib/validators";
import { updateProduct, getBySlug } from "@/lib/products";

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = productPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!(await getBySlug(slug, { includeAll: true }))) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const updated = await updateProduct(slug, parsed.data);
    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ slug: updated.slug });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update product" },
      { status: 500 },
    );
  }
}
