import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const productsPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "products.json");
const legacyI18nPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "legacy-i18n.json");
const productTemplatePath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "product-template.json");

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

async function validateProducts(products, legacyI18n) {
  const validatorPath = pathToFileURL(
    path.join(/*turbopackIgnore: true*/ process.cwd(), "scripts", "validate-products.mjs")
  ).href;
  const { validateProductsData } = await import(/* webpackIgnore: true */ validatorPath);
  return validateProductsData(products, legacyI18n);
}
