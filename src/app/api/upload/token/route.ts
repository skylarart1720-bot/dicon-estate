import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${adminCookieName}=`));
        if (!isValidAdminSession(cookie?.slice(adminCookieName.length + 1))) throw new Error("Administrator authentication required.");
        if (!/^(carousel|housing|land|painting)\/direct\/[a-f0-9-]{36}\/[a-zA-Z0-9._-]+$/.test(pathname) || pathname.includes("..")) throw new Error("Invalid upload path.");
        return {
          allowedContentTypes: pathname.startsWith("carousel/") ? ["image/*"] : ["image/*", "video/*"],
          addRandomSuffix: true,
          allowOverwrite: false,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload authorization failed." }, { status: 400 });
  }
}
