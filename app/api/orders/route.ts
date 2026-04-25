import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validators";
import { createOrder } from "@/lib/orders";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await createOrder(parsed.data);
    return NextResponse.json({
      orderId: result.order.id,
      paymentMethod: result.order.paymentMethod,
      advanceAmount: result.order.advanceAmount,
      balanceAmount: result.order.balanceAmount,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
