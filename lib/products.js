import products from "@/data/products.json";
import { AVATAR_SUBTAGS, CATEGORY_LABELS, SUBTAG_LABELS, getTagLabel as resolveTagLabel } from "@/lib/site";

export function getAllProducts() {
  return [...products].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPublishedProducts() {
  return getAllProducts().filter((product) => product.published);
}

export function getProductBySlug(slug) {
  return getAllProducts().find((product) => product.slug === slug);
}

export function getTagLabel(tag) {
  return resolveTagLabel(tag);
}

export function getProductAvatars(product) {
  return product.subtags
    .filter((subtag) => AVATAR_SUBTAGS.includes(subtag))
    .map((subtag) => SUBTAG_LABELS[subtag]);
}

export function getFilterOptions() {
  const published = getPublishedProducts();
  const tags = new Set();
  const subtags = new Set();
  const avatars = new Set();

  for (const product of published) {
    product.tags.forEach((tag) => tags.add(tag));
    product.subtags.forEach((subtag) => {
      subtags.add(subtag);
      if (subtag.startsWith("character-")) {
        avatars.add(subtag);
      }
    });
  }

  return {
    tags: Object.keys(CATEGORY_LABELS).filter((tag) => tags.has(tag)),
    subtags: Object.keys(SUBTAG_LABELS).filter((tag) => subtags.has(tag)),
    avatars: Object.keys(SUBTAG_LABELS).filter((tag) => avatars.has(tag))
  };
}

function relatedScore(product, candidate) {
  let score = 0;
  for (const tag of candidate.tags) {
    if (product.tags.includes(tag)) score += 8;
  }
  for (const subtag of candidate.subtags) {
    if (product.subtags.includes(subtag)) score += subtag.startsWith("character-") ? 6 : 4;
  }
  return score;
}

export function getRelatedProducts(product, limit = 5) {
  const published = getPublishedProducts().filter((candidate) => candidate.id !== product.id);

  if (Array.isArray(product.relatedIds) && product.relatedIds.length > 0) {
    const relatedById = product.relatedIds
      .map((id) => published.find((candidate) => candidate.id === id))
      .filter(Boolean);

    if (relatedById.length >= limit) {
      return relatedById.slice(0, limit);
    }

    const fallback = published
      .filter((candidate) => !relatedById.some((related) => related.id === candidate.id))
      .map((candidate) => ({ candidate, score: relatedScore(product, candidate) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.candidate.sortOrder - b.candidate.sortOrder)
      .map(({ candidate }) => candidate);

    return [...relatedById, ...fallback].slice(0, limit);
  }

  return published
    .map((candidate) => ({ candidate, score: relatedScore(product, candidate) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.sortOrder - b.candidate.sortOrder)
    .map(({ candidate }) => candidate)
    .slice(0, limit);
}
