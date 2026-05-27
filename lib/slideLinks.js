import slideLinks from "@/data/slide-links.json";
import { getProductBySlug } from "@/lib/products";

function getProductUrl(product) {
  return product?.salesUrls?.booth || `/products/${product?.slug || ""}`;
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
    category: link.category || product?.categoryLabel || product?.category || "",
    tags: Array.isArray(link.tags) && link.tags.length ? link.tags : product?.tags || []
  };
}

export function getPublishedSlideLinks() {
  return slideLinks
    .filter((link) => link.published)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
    .map(normalizeSlideLink);
}
