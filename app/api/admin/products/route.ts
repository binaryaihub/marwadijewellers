import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { productWriteSchema } from "@/lib/validators";
import { createProduct, slugExists } from "@/lib/products";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = productWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (await slugExists(parsed.data.slug)) {
    return NextResponse.json(
      { error: "A product with this slug already exists", issues: { fieldErrors: { slug: ["Slug already in use"] } } },
      { status: 409 },
    );
  }

  try {
    const created = await createProduct(parsed.data);
    return NextResponse.json({ slug: created.slug });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create product" },
      { status: 500 },
    );
  }
}
