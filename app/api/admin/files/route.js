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

  const exists = await fileExists(pathResult.filePath);
  return NextResponse.json({ ok: true, path: targetPath, exists });
}

export async function POST(request) {
  if (!isAdminWriteEnabled()) {
    return NextResponse.json({ error: "Admin file API is local-only." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    if (payload?.action === "copyProductImages") {
      return copyProductImages(payload);
    }

    return NextResponse.json({ error: "Unsupported file action." }, { status: 400 });
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

async function copyProductImages(payload) {
  const sourceSlug = String(payload?.sourceSlug || "");
  const targetSlug = String(payload?.targetSlug || "");
  const overwrite = Boolean(payload?.overwrite);
  const sourceResult = resolveProductDirectory(sourceSlug);
  const targetResult = resolveProductDirectory(targetSlug);

  if (!sourceResult.ok) {
    return NextResponse.json({ error: `コピー元slugが不正です: ${sourceSlug}` }, { status: 400 });
  }
  if (!targetResult.ok) {
    return NextResponse.json({ error: `コピー先slugが不正です: ${targetSlug}` }, { status: 400 });
  }
  if (sourceSlug === targetSlug) {
    return NextResponse.json({ error: "コピー元とコピー先が同じです。" }, { status: 400 });
  }

  const sourceExists = await directoryExists(sourceResult.directoryPath);
  if (!sourceExists) {
    return NextResponse.json({ error: `public/products/${sourceSlug}/ が見つかりません。` }, { status: 404 });
  }

  const targetExists = await directoryExists(targetResult.directoryPath);
  if (targetExists && !overwrite) {
    return NextResponse.json(
      {
        error: `public/products/${targetSlug}/ は既に存在します。`,
        conflict: true,
        targetPath: `/products/${targetSlug}/`
      },
      { status: 409 }
    );
  }

  const copied = await copyImageDirectory(sourceResult.directoryPath, targetResult.directoryPath, overwrite);
  return NextResponse.json({
    ok: true,
    sourcePath: `/products/${sourceSlug}/`,
    targetPath: `/products/${targetSlug}/`,
    copied,
    overwritten: targetExists
  });
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

function resolveProductDirectory(slug) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return { ok: false, error: "invalid slug" };
  }
  const directoryPath = path.resolve(publicRoot, "products", slug);
  const productsRoot = path.resolve(publicRoot, "products");
  if (!directoryPath.startsWith(`${productsRoot}${path.sep}`)) {
    return { ok: false, error: "invalid product directory" };
  }
  return { ok: true, directoryPath };
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

async function directoryExists(directoryPath) {
  try {
    const stat = await fs.stat(directoryPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function copyImageDirectory(sourceDirectory, targetDirectory, overwrite) {
  const entries = await fs.readdir(sourceDirectory, { withFileTypes: true });
  await fs.mkdir(targetDirectory, { recursive: true });

  let copied = 0;
  for (const entry of entries) {
    const sourcePath = path.join(sourceDirectory, entry.name);
    const targetPath = path.join(targetDirectory, entry.name);

    if (entry.isDirectory()) {
      copied += await copyImageDirectory(sourcePath, targetPath, overwrite);
      continue;
    }

    if (!entry.isFile() || !isAllowedImageExtension(entry.name)) continue;

    if (!overwrite && (await fileExists(targetPath))) continue;
    await fs.copyFile(sourcePath, targetPath);
    copied += 1;
  }

  return copied;
}
