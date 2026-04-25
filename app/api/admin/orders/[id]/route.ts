import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { setStatus, type OrderStatus } from "@/lib/orders";

const ALLOWED: OrderStatus[] = ["awaiting_payment", "pending_verification", "paid", "shipped", "delivered", "cancelled"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.status || !ALLOWED.includes(body.status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const result = await setStatus(id, body.status as OrderStatus);
  if (!result) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
