import { NextResponse } from "next/server";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return NextResponse.redirect(new URL("/orders", req.url));
  return NextResponse.redirect(new URL(`/orders/${encodeURIComponent(id)}`, req.url));
}
