import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { productStatusBodySchema } from "@/lib/validators";
import { setProductStatus } from "@/lib/products";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
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

  const parsed = productStatusBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await setProductStatus(slug, parsed.data.status);
  if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ slug: updated.slug, status: updated.status });
}
