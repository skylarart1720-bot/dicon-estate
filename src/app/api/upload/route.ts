import { del, list, put } from "@vercel/blob";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const collections = ["carousel", "housing", "land", "painting"] as const;
type Collection = (typeof collections)[number];
type MediaAsset = { id: string; url: string; pathname: string; name: string; type: string; size: number; uploadedAt: string };
type StackStatus = "available" | "sold" | "rented" | "ongoing" | "done";
type MediaStack = { id: string; collection: Collection; title: string; location: string; description: string; status: StackStatus; uploadedAt: string; assets: MediaAsset[] };

const mediaRoot = path.join(process.cwd(), "public", "uploads");
const mediaIndex = path.join(process.cwd(), "data", "media-library.json");
const blobLibraryPath = "system/media-library.json";
const hasBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function isCollection(value: string | null): value is Collection {
  return value !== null && collections.includes(value as Collection);
}

function validStatus(collection: Collection, status: string): StackStatus {
  if (collection === "land" && status === "sold") return "sold";
  if (collection === "housing" && status === "rented") return "rented";
  if (collection === "painting" && status === "done") return "done";
  if (collection === "painting" && status === "ongoing") return "ongoing";
  return "available";
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file.name);
}

function requireAdmin(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${adminCookieName}=`));
  if (!isValidAdminSession(cookie?.slice(adminCookieName.length + 1))) return NextResponse.json({ error: "Administrator authentication required." }, { status: 401 });
  return null;
}

async function readLibrary(): Promise<MediaStack[]> {
  try {
    if (hasBlobStorage) {
      const result = await list({ prefix: blobLibraryPath });
      if (!result.blobs[0]) return [];
      const response = await fetch(result.blobs[0].url, { cache: "no-store" });
      if (!response.ok) return [];
      return await response.json() as MediaStack[];
    }
    const parsed = JSON.parse(await readFile(mediaIndex, "utf8")) as MediaStack[] | Array<MediaAsset & { collection: Collection }>;
    if (!parsed.length) return [];
    if ("assets" in parsed[0]) return parsed as MediaStack[];
    return (parsed as Array<MediaAsset & { collection: Collection }>).map((file) => ({ id: file.id, collection: file.collection, title: file.name, location: "", description: "", status: "available" as StackStatus, uploadedAt: file.uploadedAt, assets: [{ id: file.id, url: file.url, pathname: file.pathname, name: file.name, type: file.type ?? "", size: file.size, uploadedAt: file.uploadedAt }] }));
  } catch {
    return [];
  }
}

async function writeLibrary(stacks: MediaStack[]) {
  if (hasBlobStorage) {
    await put(blobLibraryPath, JSON.stringify(stacks), { access: "public", addRandomSuffix: false, contentType: "application/json" });
    return;
  }
  await mkdir(path.dirname(mediaIndex), { recursive: true });
  await writeFile(mediaIndex, JSON.stringify(stacks, null, 2), "utf8");
}

function responseStack(stack: MediaStack) {
  return { ...stack, assets: stack.assets.map((asset) => ({ ...asset })) };
}

export async function GET(request: Request) {
  const collection = new URL(request.url).searchParams.get("collection");
  if (!isCollection(collection)) return NextResponse.json({ service: "Dicon Estate media manager", status: "ready", storage: hasBlobStorage ? "vercel-blob" : "local", collections, methods: ["GET", "POST", "PATCH", "DELETE"] });
  const stacks = (await readLibrary()).filter((stack) => stack.collection === collection).map(responseStack);
  return NextResponse.json({ collection, stacks, files: stacks.flatMap((stack) => stack.assets) });
}

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;
  if (!hasBlobStorage && process.env.VERCEL) return NextResponse.json({ error: "Vercel Blob is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel Project Settings, then redeploy." }, { status: 503 });
  try {
    const formData = await request.formData();
    const collectionValue = formData.get("collection");
    if (typeof collectionValue !== "string" || !isCollection(collectionValue)) return NextResponse.json({ error: "Choose a valid collection." }, { status: 400 });
    const files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
    if (!files.length) return NextResponse.json({ error: "No files were provided." }, { status: 400 });
    if (collectionValue === "carousel" && files.some((file) => !isImageFile(file))) return NextResponse.json({ error: "Carousel accepts images only." }, { status: 400 });
    const stackId = crypto.randomUUID();
    const uploadedAt = new Date().toISOString();
    const title = String(formData.get("title") ?? (collectionValue === "carousel" ? "Featured image" : "Untitled listing"));
    const location = String(formData.get("location") ?? "");
    const description = String(formData.get("description") ?? "");
    const status = validStatus(collectionValue, String(formData.get("status") ?? "available"));
    const assets: MediaAsset[] = [];

    await mkdir(mediaRoot, { recursive: true });
    for (const file of files) {
      const assetId = crypto.randomUUID();
      const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      if (hasBlobStorage) {
        const uploaded = await put(`${collectionValue}/${stackId}/${assetId}-${name}`, file, { access: "public", addRandomSuffix: true });
        assets.push({ id: assetId, url: uploaded.url, pathname: uploaded.pathname, name, type: file.type, size: file.size, uploadedAt });
      } else {
        const pathname = `${collectionValue}/${stackId}/${assetId}-${name}`;
        await mkdir(path.join(mediaRoot, collectionValue, stackId), { recursive: true });
        await writeFile(path.join(mediaRoot, pathname), Buffer.from(await file.arrayBuffer()));
        assets.push({ id: assetId, url: `/uploads/${pathname}`, pathname, name, type: file.type, size: file.size, uploadedAt });
      }
    }

    const stack: MediaStack = { id: stackId, collection: collectionValue, title, location, description, status, uploadedAt, assets };
    const stacks = await readLibrary();
    await writeLibrary(collectionValue === "carousel" ? [...stacks, ...assets.map((asset) => ({ ...stack, id: asset.id, title: asset.name, assets: [asset] }))] : [...stacks, stack]);
    return NextResponse.json({ stack: responseStack(stack), storage: hasBlobStorage ? "vercel-blob" : "local" });
  } catch {
    return NextResponse.json({ error: "Upload failed. Check storage configuration and try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;
  if (!hasBlobStorage && process.env.VERCEL) return NextResponse.json({ error: "Vercel Blob is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel Project Settings, then redeploy." }, { status: 503 });
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const stackId = String(formData.get("stackId") ?? "");
      const stacks = await readLibrary();
      const index = stacks.findIndex((stack) => stack.id === stackId);
      if (index < 0) return NextResponse.json({ error: "The media stack was not found." }, { status: 404 });
      const current = stacks[index];
      const target = String(formData.get("collection") ?? current.collection);
      if (!isCollection(target)) return NextResponse.json({ error: "Choose a valid destination." }, { status: 400 });
      const removedIds = JSON.parse(String(formData.get("removeAssetIds") ?? "[]")) as string[];
      const keptAssets = current.assets.filter((asset) => !removedIds.includes(asset.id));
      if (!keptAssets.length && !formData.getAll("files").some((value) => value instanceof File && value.size > 0)) return NextResponse.json({ error: "Keep at least one media item in the stack." }, { status: 400 });
      if (hasBlobStorage) await Promise.all(current.assets.filter((asset) => removedIds.includes(asset.id)).map((asset) => del(asset.url)));
      else await Promise.all(current.assets.filter((asset) => removedIds.includes(asset.id)).map((asset) => unlink(path.join(mediaRoot, asset.pathname)).catch(() => undefined)));
      const newFiles = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
      if (target === "carousel" && newFiles.some((file) => !isImageFile(file))) return NextResponse.json({ error: "Carousel accepts images only." }, { status: 400 });
      for (const file of newFiles) {
        const assetId = crypto.randomUUID();
        const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const uploadedAt = new Date().toISOString();
        if (hasBlobStorage) {
          const uploaded = await put(`${target}/${current.id}/${assetId}-${name}`, file, { access: "public", addRandomSuffix: true });
          keptAssets.push({ id: assetId, url: uploaded.url, pathname: uploaded.pathname, name, type: file.type, size: file.size, uploadedAt });
        } else {
          const pathname = `${target}/${current.id}/${assetId}-${name}`;
          await mkdir(path.join(mediaRoot, target, current.id), { recursive: true });
          await writeFile(path.join(mediaRoot, pathname), Buffer.from(await file.arrayBuffer()));
          keptAssets.push({ id: assetId, url: `/uploads/${pathname}`, pathname, name, type: file.type, size: file.size, uploadedAt });
        }
      }
      const updated: MediaStack = { ...current, collection: target, title: String(formData.get("title") ?? current.title), location: String(formData.get("location") ?? current.location), description: String(formData.get("description") ?? current.description), status: validStatus(target, String(formData.get("status") ?? current.status)), assets: keptAssets };
      stacks[index] = updated;
      await writeLibrary(stacks);
      return NextResponse.json({ stack: responseStack(updated) });
    }
    const body = await request.json() as { stackId?: string; collection?: string; title?: string; location?: string; description?: string; status?: string };
    if (!body.stackId) return NextResponse.json({ error: "A stack id is required." }, { status: 400 });
    const stacks = await readLibrary();
    const index = stacks.findIndex((stack) => stack.id === body.stackId);
    if (index < 0) return NextResponse.json({ error: "The media stack was not found." }, { status: 404 });
    const current = stacks[index];
    const target = body.collection ?? current.collection;
    if (!isCollection(target)) return NextResponse.json({ error: "Choose a valid destination." }, { status: 400 });

    if (target !== current.collection && !hasBlobStorage) {
      for (const asset of current.assets) {
        const nextPath = `${target}/${current.id}/${asset.pathname.split("/").pop()}`;
        await mkdir(path.join(mediaRoot, target, current.id), { recursive: true });
        await rename(path.join(mediaRoot, asset.pathname), path.join(mediaRoot, nextPath));
        asset.pathname = nextPath;
        asset.url = `/uploads/${nextPath}`;
      }
    }
    const updated: MediaStack = { ...current, collection: target, title: body.title ?? current.title, location: body.location ?? current.location, description: body.description ?? current.description, status: validStatus(target, body.status ?? current.status) };
    stacks[index] = updated;
    await writeLibrary(stacks);
    return NextResponse.json({ stack: responseStack(updated) });
  } catch {
    return NextResponse.json({ error: "The media stack could not be updated." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;
  if (!hasBlobStorage && process.env.VERCEL) return NextResponse.json({ error: "Vercel Blob is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel Project Settings, then redeploy." }, { status: 503 });
  try {
    const body = await request.json() as { stackId?: string };
    if (!body.stackId) return NextResponse.json({ error: "A stack id is required." }, { status: 400 });
    const stacks = await readLibrary();
    const current = stacks.find((stack) => stack.id === body.stackId);
    if (!current) return NextResponse.json({ error: "The media stack was not found." }, { status: 404 });
    if (hasBlobStorage) await Promise.all(current.assets.map((asset) => del(asset.url)));
    else await Promise.all(current.assets.map((asset) => unlink(path.join(mediaRoot, asset.pathname)).catch(() => undefined)));
    await writeLibrary(stacks.filter((stack) => stack.id !== body.stackId));
    return NextResponse.json({ deleted: body.stackId });
  } catch {
    return NextResponse.json({ error: "The media stack could not be deleted." }, { status: 500 });
  }
}
