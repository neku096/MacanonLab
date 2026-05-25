import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const productsPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "products.json");
const i18nPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "legacy-i18n.json");
const publicDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "public");

const REQUIRED_FIELDS = [
  "id",
  "slug",
  "published",
  "sortOrder",
  "title",
  "description",
  "category",
  "categoryLabel",
  "tags",
  "subtags",
  "tagLabels",
  "subtagLabels",
  "avatars",
  "likes",
  "price",
  "support",
  "content",
  "usage",
  "summaryTags",
  "note",
  "coverImage",
  "coverAlt",
  "coverWidth",
  "coverHeight",
  "gallery",
  "salesUrls",
  "relatedIds",
  "legacyPath",
  "contentHtml"
];

const PUBLISHED_REQUIRED_TEXT_FIELDS = [
  "title",
  "description",
  "category",
  "categoryLabel",
  "price",
  "support",
  "content",
  "usage",
  "note",
  "coverImage",
  "coverAlt",
  "legacyPath",
  "contentHtml"
];

const INTERNAL_ROUTES = new Set(["/", "/products", "/blog", "/links", "/terms"]);
const PRODUCT_ROUTE = /^\/products\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const LEGACY_PRODUCT_ROUTE = /^\/product-([a-z0-9]+(?:-[a-z0-9]+)*)\.html$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

let errors = [];
let warnings = [];
let checkedImages = 0;
let checkedLinks = 0;

function resetValidationState() {
  errors = [];
  warnings = [];
  checkedImages = 0;
  checkedLinks = 0;
}

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

async function readJson(filePath, label) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    addError(`${label} を読み込めません: ${error.message}`);
    return null;
  }
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function publicPathToFile(value) {
  if (!hasText(value) || !value.startsWith("/")) return null;
  const cleanPath = value.split("?")[0].replace(/^\/+/, "");
  if (cleanPath.includes("..")) return null;
  return path.join(/*turbopackIgnore: true*/ publicDir, ...cleanPath.split("/"));
}

async function assertPublicFile(value, label) {
  const filePath = publicPathToFile(value);
  if (!filePath) {
    addError(`${label}: public配下の絶対パスで指定してください (${value || "empty"})`);
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      addError(`${label}: ファイルではありません (${value})`);
      return;
    }
    checkedImages += 1;
  } catch {
    addError(`${label}: 画像ファイルが見つかりません (${value})`);
  }
}

function findDuplicates(items, key) {
  const seen = new Map();
  const duplicates = [];

  for (const item of items) {
    const value = item[key];
    if (!seen.has(value)) {
      seen.set(value, item);
      continue;
    }
    duplicates.push(value);
  }

  return [...new Set(duplicates)];
}

function extractLinks(html = "") {
  const links = [];
  for (const match of html.matchAll(/\bhref\s*=\s*"([^"]+)"/g)) {
    links.push(match[1]);
  }
  return links;
}

function validateInternalLink(href, product, productBySlug, validTags, validSubtags) {
  if (!hasText(href)) {
    addError(`${product.slug}: 空の href があります`);
    return;
  }

  if (/^(https?:|mailto:|tel:|#)/.test(href)) return;

  if (!href.startsWith("/")) {
    addError(`${product.slug}: 相対リンクはNext.js側では避けてください (${href})`);
    return;
  }

  checkedLinks += 1;
  const parsed = new URL(href, "https://example.local");
  const pathname = parsed.pathname;

  if (INTERNAL_ROUTES.has(pathname)) {
    validateProductQuery(parsed, product, validTags, validSubtags);
    return;
  }

  const productRoute = pathname.match(PRODUCT_ROUTE);
  if (productRoute) {
    const target = productBySlug.get(productRoute[1]);
    if (!target || !target.published) {
      addError(`${product.slug}: 存在しない商品LPへのリンクです (${href})`);
    }
    return;
  }

  const legacyRoute = pathname.match(LEGACY_PRODUCT_ROUTE);
  if (legacyRoute) {
    const target = productBySlug.get(legacyRoute[1]);
    if (!target) {
      addError(`${product.slug}: 存在しない旧商品URLへのリンクです (${href})`);
    }
    return;
  }

  addError(`${product.slug}: 未知の内部リンクです (${href})`);
}

function validateProductQuery(parsed, product, validTags, validSubtags) {
  const pathname = parsed.pathname;
  if (pathname !== "/products") return;

  const tag = parsed.searchParams.get("tag");
  const subtag = parsed.searchParams.get("subtag");
  const avatar = parsed.searchParams.get("avatar");

  if (tag && !validTags.has(tag)) {
    addError(`${product.slug}: 存在しない tag クエリです (${parsed.pathname}${parsed.search})`);
  }
  if (subtag && !validSubtags.has(subtag)) {
    addError(`${product.slug}: 存在しない subtag クエリです (${parsed.pathname}${parsed.search})`);
  }
  if (avatar && !validSubtags.has(avatar)) {
    addError(`${product.slug}: 存在しない avatar クエリです (${parsed.pathname}${parsed.search})`);
  }
}

function validateSalesUrls(product) {
  if (!isPlainObject(product.salesUrls)) {
    addError(`${product.slug}: salesUrls は object にしてください`);
    return;
  }

  if (typeof product.salesUrls.booth !== "string") {
    addError(`${product.slug}: salesUrls.booth は string にしてください`);
  }
  if (typeof product.salesUrls.dlsite !== "string") {
    addError(`${product.slug}: salesUrls.dlsite は string にしてください`);
  }
  if (!Array.isArray(product.salesUrls.external)) {
    addError(`${product.slug}: salesUrls.external は array にしてください`);
    return;
  }

  product.salesUrls.external.forEach((link, index) => {
    if (!isPlainObject(link)) {
      addError(`${product.slug}: salesUrls.external[${index}] は object にしてください`);
      return;
    }
    if (!hasText(link.url)) {
      addError(`${product.slug}: salesUrls.external[${index}].url が空です`);
    }
  });
}

function validateEnglish(product, productPageEnglish) {
  const key = product.legacyPath?.replace(/^\//, "") || `product-${product.slug}.html`;
  const english = productPageEnglish[key];

  if (!english) {
    addError(`${product.slug}: 英語ページキーがありません (${key})`);
    return;
  }

  for (const field of ["title", "pageTitle", "description", "detailHtml"]) {
    if (!hasText(english[field])) {
      addError(`${product.slug}: 英語データ ${key}.${field} が空です`);
    }
  }
  if (!Array.isArray(english.summaryTags) || english.summaryTags.length === 0) {
    addError(`${product.slug}: 英語データ ${key}.summaryTags が空です`);
  }
  if (!Array.isArray(english.specs) || english.specs.length === 0) {
    addError(`${product.slug}: 英語データ ${key}.specs が空です`);
  }
}

function validateProductShape(product, index, allKeys) {
  const label = hasText(product?.slug) ? product.slug : `index ${index}`;

  if (!isPlainObject(product)) {
    addError(`products[${index}]: object にしてください`);
    return;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in product)) {
      addError(`${label}: 必須項目 ${field} がありません`);
    }
  }

  const keys = Object.keys(product);
  const extraKeys = keys.filter((key) => !allKeys.has(key));
  if (extraKeys.length > 0) {
    addError(`${label}: 未定義の項目があります (${extraKeys.join(", ")})`);
  }

  if (!hasText(product.id)) addError(`${label}: id が空です`);
  if (!hasText(product.slug)) addError(`${label}: slug が空です`);
  if (hasText(product.slug) && !SLUG_PATTERN.test(product.slug)) {
    addError(`${label}: slug は小文字英数字とハイフンのみで指定してください (${product.slug})`);
  }
  if (product.id !== product.slug) {
    addError(`${label}: id と slug は同じ値にしてください`);
  }
  if (typeof product.published !== "boolean") addError(`${label}: published は boolean にしてください`);
  if (!Number.isInteger(product.sortOrder)) addError(`${label}: sortOrder は integer にしてください`);
  if (!Number.isInteger(product.likes)) addError(`${label}: likes は integer にしてください`);
  if (!Number.isInteger(product.coverWidth)) addError(`${label}: coverWidth は integer にしてください`);
  if (!Number.isInteger(product.coverHeight)) addError(`${label}: coverHeight は integer にしてください`);

  for (const field of ["tags", "subtags", "tagLabels", "subtagLabels", "avatars", "summaryTags", "gallery", "relatedIds"]) {
    if (!Array.isArray(product[field])) {
      addError(`${label}: ${field} は array にしてください`);
    }
  }

  if (Array.isArray(product.tags) && !product.tags.includes(product.category)) {
    addError(`${label}: tags に category (${product.category}) を含めてください`);
  }
  if (Array.isArray(product.tags) && Array.isArray(product.tagLabels) && product.tags.length !== product.tagLabels.length) {
    addError(`${label}: tags と tagLabels の件数が一致していません`);
  }
  if (Array.isArray(product.subtags) && Array.isArray(product.subtagLabels) && product.subtags.length !== product.subtagLabels.length) {
    addError(`${label}: subtags と subtagLabels の件数が一致していません`);
  }

  validateSalesUrls(product);

  if (product.published) {
    for (const field of PUBLISHED_REQUIRED_TEXT_FIELDS) {
      if (!hasText(product[field])) {
        addError(`${label}: 公開商品に必要な ${field} が空です`);
      }
    }
    if (!Array.isArray(product.tags) || product.tags.length === 0) addError(`${label}: 公開商品に tags がありません`);
    if (!Array.isArray(product.summaryTags) || product.summaryTags.length === 0) addError(`${label}: 公開商品に summaryTags がありません`);
    if (!Array.isArray(product.gallery) || product.gallery.length === 0) addError(`${label}: 公開商品に gallery がありません`);
    if (!isPlainObject(product.salesUrls) || (!hasText(product.salesUrls.booth) && !hasText(product.salesUrls.dlsite) && !product.salesUrls.external?.length)) {
      addError(`${label}: 公開商品には少なくとも1つ販売URLを設定してください`);
    }
  }
}

async function validateImages(product) {
  if (hasText(product.coverImage)) {
    await assertPublicFile(product.coverImage, `${product.slug}: coverImage`);
  }

  if (!Array.isArray(product.gallery)) return;

  for (const [index, image] of product.gallery.entries()) {
    if (!isPlainObject(image)) {
      addError(`${product.slug}: gallery[${index}] は object にしてください`);
      continue;
    }
    if (!hasText(image.src)) addError(`${product.slug}: gallery[${index}].src が空です`);
    if (!hasText(image.thumb)) addError(`${product.slug}: gallery[${index}].thumb が空です`);
    if (!hasText(image.alt)) addWarning(`${product.slug}: gallery[${index}].alt が空です`);
    if (!Number.isInteger(image.width)) addError(`${product.slug}: gallery[${index}].width は integer にしてください`);
    if (!Number.isInteger(image.height)) addError(`${product.slug}: gallery[${index}].height は integer にしてください`);
    if (hasText(image.src)) await assertPublicFile(image.src, `${product.slug}: gallery[${index}].src`);
    if (hasText(image.thumb)) await assertPublicFile(image.thumb, `${product.slug}: gallery[${index}].thumb`);
  }
}

export async function validateProductsData(products, legacyI18n) {
  resetValidationState();
  if (!Array.isArray(products)) {
    addError("data/products.json は array にしてください");
    return buildValidationResult(products, []);
  }

  const productPageEnglish = legacyI18n.productPageEnglish || {};
  const productById = new Map(products.filter(isPlainObject).map((product) => [product.id, product]));
  const productBySlug = new Map(products.filter(isPlainObject).map((product) => [product.slug, product]));
  const published = products.filter((product) => isPlainObject(product) && product.published);
  const allKeys = new Set(REQUIRED_FIELDS);
  const validTags = new Set(products.flatMap((product) => (Array.isArray(product.tags) ? product.tags : [])));
  const validSubtags = new Set(products.flatMap((product) => (Array.isArray(product.subtags) ? product.subtags : [])));

  for (const duplicate of findDuplicates(products, "slug")) {
    addError(`slug が重複しています: ${duplicate}`);
  }
  for (const duplicate of findDuplicates(products, "title")) {
    addError(`title が重複しています: ${duplicate}`);
  }

  products.forEach((product, index) => validateProductShape(product, index, allKeys));

  for (const product of products) {
    if (!isPlainObject(product) || !hasText(product.slug)) continue;

    if (Array.isArray(product.relatedIds)) {
      for (const relatedId of product.relatedIds) {
        if (!productById.has(relatedId)) {
          addError(`${product.slug}: relatedIds に存在しないIDがあります (${relatedId})`);
        }
        if (relatedId === product.id) {
          addError(`${product.slug}: relatedIds に自分自身は指定できません`);
        }
      }
    }

    if (product.published) {
      validateEnglish(product, productPageEnglish);
      await validateImages(product);
    }

    for (const href of extractLinks(product.contentHtml)) {
      validateInternalLink(href, product, productBySlug, validTags, validSubtags);
    }
  }

  const englishKeys = new Set(Object.keys(productPageEnglish));
  for (const product of published) {
    const key = product.legacyPath?.replace(/^\//, "") || `product-${product.slug}.html`;
    englishKeys.delete(key);
  }
  for (const extraKey of [...englishKeys].filter((key) => key.startsWith("product-") && key.endsWith(".html"))) {
    addWarning(`未使用の英語商品キーがあります: ${extraKey}`);
  }

  return buildValidationResult(products, published);
}

function buildValidationResult(products, published) {
  return {
    ok: errors.length === 0,
    errors: [...errors],
    warnings: [...warnings],
    counts: {
      products: Array.isArray(products) ? products.length : 0,
      published: Array.isArray(published) ? published.length : 0,
      images: checkedImages,
      links: checkedLinks
    }
  };
}

function printValidationResult(result) {
  if (result.warnings.length > 0) {
    console.log("Warnings:");
    result.warnings.forEach((warning) => console.log(`  - ${warning}`));
    console.log("");
  }

  if (!result.ok) {
    console.error("Product validation failed:");
    result.errors.forEach((error) => console.error(`  - ${error}`));
    return;
  }

  console.log("Product validation passed.");
  console.log(`  Products : ${result.counts.products}`);
  console.log(`  Published: ${result.counts.published}`);
  console.log(`  Images   : ${result.counts.images}`);
  console.log(`  Links    : ${result.counts.links}`);
}

async function main() {
  resetValidationState();
  const products = await readJson(productsPath, "data/products.json");
  const legacyI18n = await readJson(i18nPath, "data/legacy-i18n.json");
  if (!products || !legacyI18n) {
    printValidationResult(buildValidationResult([], []));
    process.exitCode = 1;
    return;
  }

  const result = await validateProductsData(products, legacyI18n);
  printValidationResult(result);
  if (!result.ok) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
