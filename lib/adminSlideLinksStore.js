import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const slideLinksPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "slide-links.json");

export async function readAdminSlideLinksPayload() {
  return {
    slideLinks: await readJson(slideLinksPath)
  };
}

export async function validateAdminSlideLinksPayload(payload) {
  const { validateSlideLinksData } = await importValidator();
  return validateSlideLinksData(payload.slideLinks);
}

export async function writeAdminSlideLinksPayload(payload) {
  const validation = await validateAdminSlideLinksPayload(payload);

  if (!validation.ok) {
    return { validation, saved: false };
  }

  await writeJson(slideLinksPath, payload.slideLinks);
  return { validation, saved: true };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function importValidator() {
  const validatorPath = pathToFileURL(
    path.join(/*turbopackIgnore: true*/ process.cwd(), "scripts", "validate-slide-links.mjs")
  ).href;
  return import(/* webpackIgnore: true */ validatorPath);
}
