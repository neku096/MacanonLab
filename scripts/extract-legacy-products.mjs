import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const legacyHtmlDir = path.join(root, "legacy", "html");
const publicDir = path.join(root, "public");
const publicProductsDir = path.join(publicDir, "products");

// Migration helper: reads the preserved legacy HTML snapshots and regenerates
// data/products.json plus public product assets for the Next.js app.

const categoryLabels = {
  clothing: "衣装",
  gimmick: "ギミック",
  "world-gimmick": "ワールドギミック",
  accessory: "装飾品",
  avatar: "3Dモデル"
};

const subtagLabels = {
  "summon-gimmick": "召喚ギミック",
  "character-lumina": "LUMINA",
  "character-shinano": "しなの",
  "character-milltina": "ミルティナ",
  "character-kipfel": "キプフェル",
  "character-manuka": "マヌカ",
  "character-selestia": "セレスティア",
  "character-shinra": "森羅",
  "character-chocolat": "ショコラ",
  "character-milfy": "ミルフィ",
  "character-rurune": "ルルネ",
  "character-sio": "しお",
  "character-shiratsume": "しらつめ",
  "chair-gimmick": "椅子ギミック",
  halo: "ヘイロー",
  mask: "マスク"
};

const relatedOverrides = {
  cravingdance: ["mirilori-uniform", "dark-knight", "star-guardian", "galhalo"],
  "shark-summon": ["whale-summon", "capybara-summon", "monsterchair"],
  "whale-summon": ["shark-summon", "capybara-summon", "mini-whale"],
  "capybara-summon": ["shark-summon", "whale-summon", "monsterchair"],
  "mirilori-uniform": ["dark-knight", "star-guardian", "cravingdance"],
  "star-guardian": ["mirilori-uniform", "dark-knight", "cravingdance"],
  galhalo: ["catmask", "cravingdance", "mirilori-uniform"],
  "mini-whale": ["whale-summon", "shark-summon", "capybara-summon"],
  "dark-knight": ["mirilori-uniform", "star-guardian", "cravingdance"],
  "restraint-system": ["monsterchair", "shark-summon", "whale-summon"],
  catmask: ["galhalo", "cravingdance", "mirilori-uniform"],
  monsterchair: ["shark-summon", "capybara-summon", "restraint-system"]
};

function decodeHtml(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .trim();
}

function stripHtml(value = "") {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
  );
}

function attrMap(value = "") {
  const attrs = {};
  for (const match of value.matchAll(/([a-zA-Z0-9-:]+)="([^"]*)"/g)) {
    attrs[match[1]] = decodeHtml(match[2]);
  }
  return attrs;
}

function firstMatch(value, pattern, fallback = "") {
  const match = value.match(pattern);
  return match ? decodeHtml(match[1]) : fallback;
}

function allTagText(value, tagName) {
  const results = [];
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  for (const match of value.matchAll(pattern)) {
    results.push(stripHtml(match[1]));
  }
  return results.filter(Boolean);
}

function splitTokens(value = "") {
  return value.split(/\s+/).map((item) => item.trim()).filter(Boolean);
}

function toPublicProductPath(value) {
  return `/${value.replace(/^images\/products\//, "products/")}`;
}

function toFilePath(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

async function copyIfExists(source, destination) {
  try {
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(source, destination);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function copyDirIfExists(source, destination) {
  try {
    await fs.cp(source, destination, { recursive: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function parseBoothCards(boothHtml) {
  const cards = new Map();
  const cardPattern =
    /<a\s+class="booth-list-thumb"(?<anchorAttrs>[\s\S]*?)href="(?<href>product-[^"]+\.html)"[^>]*>\s*<img(?<imgAttrs>[^>]*)>/g;

  for (const match of boothHtml.matchAll(cardPattern)) {
    const anchorAttrs = attrMap(match.groups.anchorAttrs);
    const imgAttrs = attrMap(match.groups.imgAttrs);
    const slug = match.groups.href.replace(/^product-/, "").replace(/\.html$/, "");
    cards.set(slug, {
      slug,
      tags: splitTokens(anchorAttrs["data-booth-tags"]),
      subtags: splitTokens(anchorAttrs["data-booth-subtags"]),
      likes: Number(anchorAttrs["data-likes"] || 0),
      coverSource: imgAttrs.src,
      coverAlt: imgAttrs.alt,
      coverWidth: Number(imgAttrs.width || 600),
      coverHeight: Number(imgAttrs.height || 600)
    });
  }

  return cards;
}

function extractSpecs(summaryHtml) {
  const specs = {};
  const specPattern = /<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g;
  for (const match of summaryHtml.matchAll(specPattern)) {
    specs[stripHtml(match[1])] = stripHtml(match[2]);
  }
  return specs;
}

function cleanContentHtml(value) {
  return value
    .replace(/\r\n?/g, "\n")
    .replaceAll('href="booth.html?tag=', 'href="/products?tag=')
    .replaceAll('href="booth.html"', 'href="/products"')
    .replaceAll('href="terms.html"', 'href="/terms"')
    .trim();
}

async function parseProduct(fileName, boothCard, sortOrder) {
  const slug = fileName.replace(/^product-/, "").replace(/\.html$/, "");
  const html = await fs.readFile(path.join(legacyHtmlDir, fileName), "utf8");
  const summaryHtml = firstMatch(html, /<aside class="product-summary"[\s\S]*?>([\s\S]*?)<\/aside>/);
  const galleryJson = firstMatch(
    html,
    /<script type="application\/json" id="product-gallery-data">\s*([\s\S]*?)\s*<\/script>/,
    "[]"
  );
  const gallery = JSON.parse(galleryJson).map((image) => ({
    ...image,
    src: toPublicProductPath(image.src),
    thumb: toPublicProductPath(image.thumb)
  }));

  const title = stripHtml(firstMatch(html, /<h1 id="product-title">([\s\S]*?)<\/h1>/));
  const description = firstMatch(html, /<meta name="description" content="([^"]*)"/);
  const specs = extractSpecs(summaryHtml);
  const summaryTags = allTagText(
    firstMatch(html, /<div class="product-summary-tags"[^>]*>([\s\S]*?)<\/div>/),
    "span"
  );
  const contentHtml = cleanContentHtml(
    firstMatch(html, /<div class="product-detail-grid">([\s\S]*?)<\/div>\s*<\/section>/)
  );
  const boothUrl = firstMatch(html, /href="(https:\/\/macanon\.booth\.pm\/items\/[^"]+)"/);
  const tags = boothCard?.tags?.length ? boothCard.tags : [];
  const subtags = boothCard?.subtags?.length ? boothCard.subtags : [];
  const category = tags[0] || "gimmick";
  const productDir = path.join(publicProductsDir, slug);

  await fs.mkdir(productDir, { recursive: true });
  await copyDirIfExists(path.join(root, "images", "products", slug), productDir);

  if (boothCard?.coverSource) {
    await copyIfExists(toFilePath(boothCard.coverSource), path.join(productDir, "cover.webp"));
  }

  return {
    id: slug,
    slug,
    published: true,
    sortOrder,
    title,
    description,
    category,
    categoryLabel: categoryLabels[category] || category,
    tags,
    subtags,
    tagLabels: tags.map((tag) => categoryLabels[tag] || tag),
    subtagLabels: subtags.map((tag) => subtagLabels[tag] || tag),
    avatars: subtags
      .filter((tag) => tag.startsWith("character-"))
      .map((tag) => subtagLabels[tag] || tag),
    likes: boothCard?.likes || 0,
    price: specs["価格"] || "",
    support: specs["対応"] || "",
    content: specs["内容"] || "",
    usage: specs["用途"] || "",
    summaryTags,
    note: stripHtml(firstMatch(html, /<p class="product-note">([\s\S]*?)<\/p>/)),
    coverImage: `/products/${slug}/cover.webp`,
    coverAlt: boothCard?.coverAlt || title,
    coverWidth: boothCard?.coverWidth || 600,
    coverHeight: boothCard?.coverHeight || 600,
    gallery,
    salesUrls: {
      booth: boothUrl,
      dlsite: "",
      external: []
    },
    relatedIds: relatedOverrides[slug] || [],
    legacyPath: `/product-${slug}.html`,
    contentHtml
  };
}

async function copySharedAssets() {
  await copyDirIfExists(path.join(root, "Macanon_Samune"), path.join(publicDir, "Macanon_Samune"));
  await copyDirIfExists(path.join(root, "images", "link-icons"), path.join(publicDir, "images", "link-icons"));
  await copyDirIfExists(path.join(root, "images", "terms"), path.join(publicDir, "images", "terms"));

  for (const fileName of [
    "favicon.ico",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "apple-touch-icon.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "site.webmanifest",
    "robots.txt"
  ]) {
    await copyIfExists(path.join(root, fileName), path.join(publicDir, fileName));
  }
}

async function writeSitemap(products) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://macanon-lab.macanon-vrc.workers.dev";
  const staticRoutes = [
    { path: "/", priority: "1.0" },
    { path: "/products", priority: "0.9" },
    { path: "/blog", priority: "0.6" },
    { path: "/links", priority: "0.6" },
    { path: "/terms", priority: "0.5" }
  ];
  const productRoutes = products
    .filter((product) => product.published)
    .map((product) => ({ path: `/products/${product.slug}`, priority: "0.75" }));
  const urls = [...staticRoutes, ...productRoutes]
    .map(
      (route) => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("\n");

  await fs.writeFile(
    path.join(publicDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    "utf8"
  );
}

async function main() {
  const boothHtml = await fs.readFile(path.join(legacyHtmlDir, "booth.html"), "utf8");
  const boothCards = parseBoothCards(boothHtml);
  const productFiles = [...boothCards.keys()].map((slug) => `product-${slug}.html`);
  const products = [];

  for (const [index, fileName] of productFiles.entries()) {
    products.push(await parseProduct(fileName, boothCards.get(fileName.replace(/^product-/, "").replace(/\.html$/, "")), index));
  }

  await copySharedAssets();
  await writeSitemap(products);
  await fs.mkdir(path.join(root, "data"), { recursive: true });
  await fs.writeFile(path.join(root, "data", "products.json"), `${JSON.stringify(products, null, 2)}\n`, "utf8");
  console.log(`Generated ${products.length} products.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
