import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { archiveOrder, unarchiveOrder } from "@/lib/orders";

interface Body {
  archived?: boolean;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = body.archived === false ? await unarchiveOrder(id) : await archiveOrder(id);
  if (!result) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ archived: !!result.order.archivedAt });
}
