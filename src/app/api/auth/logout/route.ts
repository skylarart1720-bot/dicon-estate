import { NextResponse } from "next/server";
import { adminCookieName } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set({ name: adminCookieName, value: "", httpOnly: true, maxAge: 0, path: "/" });
  return response;
}
