import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminWriteEnabled } from "@/lib/adminProductsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const publicRoot = path.resolve(process.cwd(), "public");
const allowedExtensions = new Set([".webp", ".png", ".jpg", ".jpeg"]);
const allowedRoots = ["products", "slide-links"];

export async function GET(request) {
  if (!isAdminWriteEnabled()) {
    return NextResponse.json({ error: "Admin file API is local-only." }, { status: 403 });
  }

  const targetPath = new URL(request.url).searchParams.get("targetPath") || "";
  const pathResult = resolvePublicImagePath(targetPath);
  if (!pathResult.ok) {
    return NextResponse.json({ error: pathResult.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, path: targetPath });
}

export async function POST(request) {
  if (!isAdminWriteEnabled()) {
    return NextResponse.json({ error: "Admin file API is local-only." }, { status: 403 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const targetPath = String(formData.get("targetPath") || "");
  const overwrite = String(formData.get("overwrite") || "") === "true";

  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "画像ファイルを選択してください。" }, { status: 400 });
  }

  const pathResult = resolvePublicImagePath(targetPath);
  if (!pathResult.ok) {
    return NextResponse.json({ error: pathResult.error }, { status: 400 });
  }

  const sourceName = typeof file.name === "string" ? file.name : "";
  if (!isAllowedImageExtension(sourceName) || !isAllowedImageExtension(targetPath)) {
    return NextResponse.json({ error: "WebP / PNG / JPG / JPEG のみ対応しています。" }, { status: 400 });
  }

  const exists = await fileExists(pathResult.filePath);
  if (exists && !overwrite) {
    return NextResponse.json({ error: "保存先に既存ファイルがあります。", conflict: true, targetPath }, { status: 409 });
  }

  await fs.mkdir(path.dirname(pathResult.filePath), { recursive: true });
  await fs.writeFile(pathResult.filePath, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ path: targetPath, overwritten: exists });
}

function resolvePublicImagePath(publicPath) {
  if (!publicPath || typeof publicPath !== "string" || !publicPath.startsWith("/") || publicPath.startsWith("//")) {
    return { ok: false, error: "public配下の絶対パスで指定してください。" };
  }

  let relativePath;
  try {
    relativePath = decodeURIComponent(publicPath).replace(/^\/+/, "");
  } catch {
    return { ok: false, error: "targetPath contains invalid percent encoding." };
  }
  const [rootSegment] = relativePath.split(/[\\/]/);
  if (!allowedRoots.includes(rootSegment)) {
    return { ok: false, error: "/products または /slide-links 配下のみ保存できます。" };
  }

  const filePath = path.resolve(publicRoot, relativePath);
  if (filePath === publicRoot || !filePath.startsWith(`${publicRoot}${path.sep}`)) {
    return { ok: false, error: "public配下のパスのみ指定できます。" };
  }

  return { ok: true, filePath };
}

function isAllowedImageExtension(filePath) {
  return allowedExtensions.has(path.extname(filePath).toLowerCase());
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}
