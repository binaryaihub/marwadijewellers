import { NextResponse } from "next/server";
import { utrSchema } from "@/lib/validators";
import { submitUtr } from "@/lib/orders";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = utrSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await submitUtr(id, parsed.data.utr, parsed.data.notes || undefined);
    if (!result) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to submit UTR";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
