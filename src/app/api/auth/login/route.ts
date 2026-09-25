import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { adminCookieName, createAdminSession, hasAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!hasAdminPassword()) return NextResponse.json({ error: "ADMIN_PASSWORD is not configured." }, { status: 503 });
  const body = await request.json() as { password?: string };
  const expected = createHash("sha256").update(process.env.ADMIN_PASSWORD ?? "").digest("hex");
  const supplied = createHash("sha256").update(body.password ?? "").digest("hex");
  if (supplied !== expected) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set({ name: adminCookieName, value: createAdminSession(), httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 * 60 * 60, path: "/" });
  return response;
}
