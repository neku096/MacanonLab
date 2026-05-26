import slideLinks from "@/data/slide-links.json";
import { getProductBySlug } from "@/lib/products";

export const SLIDE_LINK_CATEGORY_ORDER = ["featured", "new", "recommended", "free", "other"];

function getProductUrl(product) {
  return product?.salesUrls?.booth || `/products/${product?.slug || ""}`;
}

export function normalizeSlideLinkCategory(category) {
  return typeof category === "string" && category.trim() ? category.trim() : "other";
}

function normalizeSlideLink(link) {
  const product = link.sourceProductSlug ? getProductBySlug(link.sourceProductSlug) : null;
  const thumbnail = link.thumbnail || product?.coverImage || "";
  const title = link.title || product?.title || link.id;

  return {
    ...link,
    title,
    description: link.description || product?.description || "",
    url: link.url || getProductUrl(product),
    thumbnail,
    thumbnailAlt: product?.coverAlt || title,
    thumbnailWidth: product?.coverWidth || 600,
    thumbnailHeight: product?.coverHeight || 600,
    category: normalizeSlideLinkCategory(link.category),
    tags: Array.isArray(link.tags) && link.tags.length ? link.tags : product?.tags || []
  };
}

export function getSlideLinkCategoryRank(category) {
  const normalizedCategory = normalizeSlideLinkCategory(category);
  const fixedIndex = SLIDE_LINK_CATEGORY_ORDER.indexOf(normalizedCategory);
  return fixedIndex >= 0 ? fixedIndex : SLIDE_LINK_CATEGORY_ORDER.length;
}

export function groupSlideLinksByCategory(items) {
  const groups = new Map();

  for (const item of items) {
    const category = normalizeSlideLinkCategory(item.category);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push({ ...item, category });
  }

  return [...groups.entries()]
    .map(([category, categoryItems]) => ({
      category,
      items: [...categoryItems].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
    }))
    .sort((a, b) => {
      const rankDiff = getSlideLinkCategoryRank(a.category) - getSlideLinkCategoryRank(b.category);
      if (rankDiff !== 0) return rankDiff;
      const firstA = Number(a.items[0]?.sortOrder) || 0;
      const firstB = Number(b.items[0]?.sortOrder) || 0;
      if (firstA !== firstB) return firstA - firstB;
      return a.category.localeCompare(b.category, "ja");
    });
}

export function getPublishedSlideLinks() {
  return slideLinks
    .filter((link) => link.published)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
    .map(normalizeSlideLink);
}

export function getPublishedSlideLinkGroups() {
  return groupSlideLinksByCategory(getPublishedSlideLinks());
}
