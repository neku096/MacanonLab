import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const slideLinksPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "slide-links.json");
const REQUIRED_FIELDS = [
  "id",
  "title",
  "description",
  "url",
  "thumbnail",
  "category",
  "tags",
  "sortOrder",
  "published",
  "openInNewTab"
];
const OPTIONAL_FIELDS = new Set(["slug"]);

let errors = [];
let warnings = [];

function resetValidationState() {
  errors = [];
  warnings = [];
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

function labelFor(link, index) {
  if (hasText(link?.id)) return link.id;
  if (hasText(link?.slug)) return link.slug;
  if (hasText(link?.title)) return link.title;
  return `slideLinks[${index}]`;
}

function findDuplicates(items, key) {
  const seen = new Set();
  const duplicates = new Set();

  for (const item of items) {
    if (!isPlainObject(item) || !hasText(item[key])) continue;
    const value = item[key].trim();
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

function validateTags(link, label) {
  if (!Array.isArray(link.tags)) {
    addError(`${label}: tags は array にしてください`);
    return;
  }

  link.tags.forEach((tag, index) => {
    if (!hasText(tag)) {
      addError(`${label}: tags[${index}] は空でない string にしてください`);
    }
  });
}

function validateSlideLink(link, index, allowedKeys) {
  const label = labelFor(link, index);

  if (!isPlainObject(link)) {
    addError(`slideLinks[${index}]: object にしてください`);
    return;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in link)) {
      addError(`${label}: 必須項目 ${field} がありません`);
    }
  }

  const extraKeys = Object.keys(link).filter((key) => !allowedKeys.has(key));
  if (extraKeys.length > 0) {
    addWarning(`${label}: 未定義の項目があります (${extraKeys.join(", ")})`);
  }

  if (!hasText(link.id)) addError(`${label}: id が空です`);
  if ("slug" in link && !hasText(link.slug)) addError(`${label}: slug が空です`);
  if (!hasText(link.title)) addError(`${label}: title が空です`);
  if (!hasText(link.url)) addError(`${label}: url が空です`);
  if (!hasText(link.thumbnail)) addError(`${label}: thumbnail が空です`);

  for (const field of ["description", "category"]) {
    if (field in link && typeof link[field] !== "string") {
      addError(`${label}: ${field} は string にしてください`);
    }
  }

  if (typeof link.published !== "boolean") {
    addError(`${label}: published は boolean にしてください`);
  }
  if (typeof link.openInNewTab !== "boolean") {
    addError(`${label}: openInNewTab は boolean にしてください`);
  }
  if (typeof link.sortOrder !== "number" || !Number.isFinite(link.sortOrder)) {
    addError(`${label}: sortOrder は数値にしてください`);
  }

  validateTags(link, label);

  if (link.published) {
    for (const field of ["title", "description", "url", "thumbnail", "category"]) {
      if (!hasText(link[field])) {
        addError(`${label}: published:true では ${field} が必須です`);
      }
    }
  }
}

export function validateSlideLinksData(slideLinks) {
  resetValidationState();

  if (!Array.isArray(slideLinks)) {
    addError("data/slide-links.json は array にしてください");
    return buildValidationResult(slideLinks, []);
  }

  const allowedKeys = new Set([...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]);
  const published = slideLinks.filter((link) => isPlainObject(link) && link.published);

  for (const duplicate of findDuplicates(slideLinks, "id")) {
    addError(`id が重複しています: ${duplicate}`);
  }
  for (const duplicate of findDuplicates(slideLinks, "slug")) {
    addError(`slug が重複しています: ${duplicate}`);
  }

  slideLinks.forEach((link, index) => validateSlideLink(link, index, allowedKeys));
  return buildValidationResult(slideLinks, published);
}

function buildValidationResult(slideLinks, published) {
  return {
    ok: errors.length === 0,
    errors: [...errors],
    warnings: [...warnings],
    counts: {
      slideLinks: Array.isArray(slideLinks) ? slideLinks.length : 0,
      published: Array.isArray(published) ? published.length : 0
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
    console.error("Slide link validation failed:");
    result.errors.forEach((error) => console.error(`  - ${error}`));
    return;
  }

  console.log("Slide link validation passed.");
  console.log(`  Cards    : ${result.counts.slideLinks}`);
  console.log(`  Published: ${result.counts.published}`);
}

async function main() {
  resetValidationState();
  const slideLinks = await readJson(slideLinksPath, "data/slide-links.json");

  if (!slideLinks) {
    printValidationResult(buildValidationResult([], []));
    process.exitCode = 1;
    return;
  }

  const result = validateSlideLinksData(slideLinks);
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
