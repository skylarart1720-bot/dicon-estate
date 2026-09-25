import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const pathname = new URL(request.url).searchParams.get("pathname");
  if (!pathname || pathname.includes("..") || pathname.startsWith("/")) return NextResponse.json({ error: "Invalid media path." }, { status: 400 });

  try {
    const blob = await get(pathname, { access: "private" });
    if (!blob) return NextResponse.json({ error: "Media was not found." }, { status: 404 });
    return new Response(blob.stream, { headers: { "Content-Type": blob.blob.contentType ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return NextResponse.json({ error: "Media could not be loaded." }, { status: 500 });
  }
}