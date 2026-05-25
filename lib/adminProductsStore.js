import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const productsPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "products.json");
const legacyI18nPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "legacy-i18n.json");
const productTemplatePath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "product-template.json");
const publicPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public");

export function isAdminWriteEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.MACANON_ENABLE_ADMIN === "1";
}

export async function readAdminProductsPayload() {
  const [products, legacyI18n, productTemplate] = await Promise.all([
    readJson(productsPath),
    readJson(legacyI18nPath),
    readJson(productTemplatePath)
  ]);

  return {
    products,
    productTemplate,
    productPageEnglish: legacyI18n.productPageEnglish || {}
  };
}

export async function validateAdminProductsPayload(payload) {
  const legacyI18n = await readJson(legacyI18nPath);
  return validateProducts(payload.products, {
    ...legacyI18n,
    productPageEnglish: payload.productPageEnglish || {}
  });
}

export async function checkAdminPublicImages(paths) {
  const checks = {};
  const uniquePaths = [...new Set(Array.isArray(paths) ? paths : [])];

  await Promise.all(
    uniquePaths.map(async (publicFilePath) => {
      checks[publicFilePath] = await checkPublicFile(publicFilePath);
    })
  );

  return checks;
}

export async function writeAdminProductsPayload(payload) {
  const legacyI18n = await readJson(legacyI18nPath);
  const nextLegacyI18n = {
    ...legacyI18n,
    productPageEnglish: payload.productPageEnglish || {}
  };
  const validation = await validateProducts(payload.products, nextLegacyI18n);

  if (!validation.ok) {
    return { validation, saved: false };
  }

  await Promise.all([
    writeJson(productsPath, payload.products),
    writeJson(legacyI18nPath, nextLegacyI18n)
  ]);

  return { validation, saved: true };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function checkPublicFile(publicFilePath) {
  if (!publicFilePath) {
    return { ok: false, state: "missing", message: "パスが未入力です" };
  }
  if (typeof publicFilePath !== "string" || !publicFilePath.startsWith("/") || publicFilePath.startsWith("//")) {
    return { ok: false, state: "invalid", message: "public配下の絶対パスで指定してください" };
  }

  const relativePath = decodeURIComponent(publicFilePath).replace(/^\/+/, "");
  const filePath = path.resolve(publicPath, relativePath);
  const publicRoot = path.resolve(publicPath);

  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${path.sep}`)) {
    return { ok: false, state: "invalid", message: "public配下のパスのみ指定できます" };
  }

  try {
    const stat = await fs.stat(filePath);
    return stat.isFile()
      ? { ok: true, state: "ok", message: "画像あり" }
      : { ok: false, state: "missing", message: "画像ファイルではありません" };
  } catch {
    return { ok: false, state: "missing", message: "画像が見つかりません" };
  }
}

async function validateProducts(products, legacyI18n) {
  const validatorPath = pathToFileURL(
    path.join(/*turbopackIgnore: true*/ process.cwd(), "scripts", "validate-products.mjs")
  ).href;
  const { validateProductsData } = await import(/* webpackIgnore: true */ validatorPath);
  return validateProductsData(products, legacyI18n);
}
