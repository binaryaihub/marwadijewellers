import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

const COOKIE_NAME = "mj_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret(): string {
  const s = process.env.ADMIN_COOKIE_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_COOKIE_SECRET must be at least 16 chars");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function isAdminPasswordCorrect(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(input);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function setAdminCookie() {
  const token = `${Date.now()}.${randomBytes(8).toString("hex")}`;
  const cookieValue = `${token}.${sign(token)}`;
  const jar = await cookies();
  jar.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const v = jar.get(COOKIE_NAME)?.value;
  if (!v) return false;
  const lastDot = v.lastIndexOf(".");
  if (lastDot < 0) return false;
  const token = v.slice(0, lastDot);
  const sig = v.slice(lastDot + 1);
  return sign(token) === sig;
}
