"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./AdminProductsClient.module.css";

const API_BASE = "/api/admin/products";
const AVATAR_SEARCH_ALIASES = {
  愛莉: "Airi",
  イチゴ: "Ichigo",
  エク: "Eku",
  キプフェル: "Kipfel",
  クマリ: "Kumari",
  しお: "Shio",
  しなの: "Shinano",
  しらつめ: "Shiratsume",
  ショコラ: "Chocolat",
  セレスティア: "Selestia",
  プラム: "Plum",
  まよ: "Mayo",
  マヌカ: "Manuka",
  ミルティナ: "Miltina",
  ミルフィ: "Milfy",
  ルミナ: "LUMINA",
  ルルネ: "Rurune",
  森羅: "Shinra",
  真冬: "Mafuyu"
};
const NEW_PRODUCT_CONTENT_HTML = `<article class="product-detail-block">
  <h2>導入方法</h2>
  <p>ここに導入方法を記載してください。</p>
</article>

<article class="product-detail-block">
  <h2>梱包内容</h2>
  <ul>
    <li>ここに梱包内容を記載してください。</li>
  </ul>
</article>

<article class="product-detail-block">
  <h2>FAQ</h2>
  <h3>Q. よくある質問</h3>
  <p>A. 回答を記載してください。</p>
</article>`;

function productImageDirForSlug(slug) {
  return `/products/${slug || "new-product"}/`;
}

function productImageDir(product) {
  return productImageDirForSlug(product?.slug || "new-product");
}

function coverImageCandidate(product) {
  return `${productImageDir(product)}cover.webp`;
}

function thumbCandidate(src = "") {
  if (!src.includes(".")) return "";
  return src.replace(/(\.[^./]+)$/, "-thumb$1");
}

function galleryImageCandidate(product, index) {
  const baseSlug = product?.slug || "new-product";
  const number = String(index + 1).padStart(2, "0");
  const src = `${productImageDir(product)}${baseSlug}-${number}.webp`;
  return {
    src,
    thumb: thumbCandidate(src),
    alt: product?.title || baseSlug,
    width: 1000,
    height: 1000
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function nextGalleryIndex(product, galleryItems) {
  const slug = product?.slug || "new-product";
  const pattern = new RegExp(`${escapeRegExp(slug)}-(\\d+)\\.[a-z0-9]+$`, "i");
  const maxNumber = galleryItems.reduce((max, image) => {
    const values = [image?.src, image?.thumb].filter(Boolean);
    const nextMax = values.reduce((innerMax, value) => {
      const match = value.match(pattern);
      return match ? Math.max(innerMax, Number(match[1]) || 0) : innerMax;
    }, max);
    return nextMax;
  }, 0);
  return Math.max(maxNumber + 1, galleryItems.length + 1);
}

function replaceProductDirPath(path, oldSlug, nextSlug) {
  if (!path) return path;
  const oldDir = productImageDirForSlug(oldSlug);
  const nextDir = productImageDirForSlug(nextSlug);
  if (path.startsWith(oldDir)) {
    const filePart = path.slice(oldDir.length).replaceAll(oldSlug, nextSlug).replaceAll("example-product", nextSlug);
    return `${nextDir}${filePart}`;
  }
  return path.replaceAll(oldSlug, nextSlug).replaceAll("example-product", nextSlug);
}

function replaceGalleryPaths(galleryItems, oldSlug, nextSlug) {
  if (!Array.isArray(galleryItems)) return [];
  return galleryItems.map((image) => ({
    ...image,
    src: replaceProductDirPath(image?.src || "", oldSlug, nextSlug),
    thumb: replaceProductDirPath(image?.thumb || "", oldSlug, nextSlug)
  }));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function splitList(value) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function addUniqueValue(list, value) {
  const current = Array.isArray(list) ? list : [];
  return current.includes(value) ? current : [...current, value];
}

function buildOptionList(products, valueKey, labelKey) {
  const options = new Map();
  products.forEach((product) => {
    const values = Array.isArray(product?.[valueKey]) ? product[valueKey] : [];
    const labels = Array.isArray(product?.[labelKey]) ? product[labelKey] : [];
    values.forEach((value, index) => {
      if (!value || options.has(value)) return;
      options.set(value, {
        value,
        label: labels[index] || value
      });
    });
  });
  return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, "ja"));
}

function filterOptions(options, query, selectedValues = []) {
  const selected = new Set(selectedValues || []);
  const normalized = query.trim().toLowerCase();
  return options
    .filter((option) => {
      if (selected.has(option.value)) return false;
      if (!normalized) return true;
      return `${option.label} ${option.value} ${option.meta || ""}`.toLowerCase().includes(normalized);
    })
    .slice(0, 12);
}

function parseGalleryText(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    if (!Array.isArray(parsed)) {
      return { items: [], error: "gallery JSON は array にしてください" };
    }
    return { items: parsed, error: "" };
  } catch (error) {
    return { items: [], error: error.message };
  }
}

function isPublicPath(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

function collectImageEntries(products) {
  const entries = [];
  for (const product of products) {
    if (!product) continue;
    entries.push({ label: `${product.slug}: coverImage`, path: product.coverImage || "" });
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((image, index) => {
        entries.push({ label: `${product.slug}: gallery[${index}].src`, path: image?.src || "" });
        entries.push({ label: `${product.slug}: gallery[${index}].thumb`, path: image?.thumb || "" });
      });
    }
  }
  return entries;
}

async function probeImageEntries(entries) {
  const uniquePaths = [...new Set(entries.map((entry) => entry.path).filter(Boolean))];
  const checks = {};
  const apiPaths = [];

  for (const path of uniquePaths) {
    if (!isPublicPath(path)) {
      checks[path] = { ok: false, state: "invalid", message: "public配下の絶対パスで指定してください" };
    } else {
      apiPaths.push(path);
    }
  }

  if (apiPaths.length) {
    try {
      const response = await fetch(`${API_BASE}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: apiPaths })
      });
      const payload = await response.json();
      Object.assign(checks, payload.checks || {});
    } catch (error) {
      apiPaths.forEach((path) => {
        checks[path] = { ok: false, state: "error", message: error.message };
      });
    }
  }

  for (const entry of entries) {
    if (!entry.path) checks[entry.path] = { ok: false, state: "missing", message: "パスが未入力です" };
  }

  return checks;
}

function legacyKey(product) {
  if (!product) return "";
  return (product.legacyPath || `/product-${product.slug}.html`).replace(/^\//, "");
}

function createEnglish(product) {
  const title = product?.title || "New Product";
  return {
    title,
    pageTitle: `${title} | macanon`,
    description: product?.description || "",
    summaryTags: product?.summaryTags || [],
    specs: [
      ["Compatibility", product?.support || ""],
      ["Contents", product?.content || ""],
      ["Use", product?.usage || ""],
      ["Price", product?.price || ""]
    ],
    note: "",
    detailHtml: product?.contentHtml || ""
  };
}

function uniqueSlug(base, products, currentSlug = "") {
  const normalized = slugify(base) || "new-product";
  const used = new Set(products.map((product) => product.slug).filter((slug) => slug !== currentSlug));
  let nextSlug = normalized;
  let index = 2;

  while (used.has(nextSlug)) {
    nextSlug = `${normalized}-${index}`;
    index += 1;
  }

  return nextSlug;
}

function withCopySuffix(value, fallback = "New Product") {
  const base = value?.trim() || fallback;
  return `${base} (Copy)`;
}

export default function AdminProductsClient() {
  const [products, setProducts] = useState([]);
  const [productTemplate, setProductTemplate] = useState(null);
  const [productPageEnglish, setProductPageEnglish] = useState({});
  const [selectedSlug, setSelectedSlug] = useState("");
  const [galleryText, setGalleryText] = useState("[]");
  const [externalLinksText, setExternalLinksText] = useState("[]");
  const [specsText, setSpecsText] = useState("[]");
  const [jsonError, setJsonError] = useState("");
  const [validation, setValidation] = useState(null);
  const [imageChecks, setImageChecks] = useState({});
  const [imageCheckSummary, setImageCheckSummary] = useState(null);
  const [message, setMessage] = useState("");
  const [relatedSearch, setRelatedSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [subtagSearch, setSubtagSearch] = useState("");
  const [avatarSearch, setAvatarSearch] = useState("");
  const [duplicateNoticeSlug, setDuplicateNoticeSlug] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.slug === selectedSlug) || products[0] || null,
    [products, selectedSlug]
  );
  const selectedKey = legacyKey(selectedProduct);
  const english = selectedProduct ? productPageEnglish[selectedKey] || createEnglish(selectedProduct) : null;
  const galleryState = useMemo(() => parseGalleryText(galleryText), [galleryText]);
  const galleryItems = galleryState.items;
  const tagOptions = useMemo(() => buildOptionList(products, "tags", "tagLabels"), [products]);
  const subtagOptions = useMemo(() => buildOptionList(products, "subtags", "subtagLabels"), [products]);
  const avatarOptions = useMemo(
    () =>
      buildOptionList(
        products.map((product) => ({ avatars: product.avatars || [], avatarLabels: product.avatars || [] })),
        "avatars",
        "avatarLabels"
      ).map((option) => ({
        ...option,
        meta: AVATAR_SEARCH_ALIASES[option.value] || ""
      })),
    [products]
  );
  const relatedOptions = useMemo(() => {
    if (!selectedProduct) return [];
    const selected = new Set(selectedProduct.relatedIds || []);
    const query = relatedSearch.trim().toLowerCase();
    return products
      .filter((product) => product.slug !== selectedProduct.slug && product.id !== selectedProduct.id)
      .map((product) => ({
        value: product.id || product.slug,
        label: product.title || product.slug,
        meta: product.slug
      }))
      .filter((option) => {
        if (selected.has(option.value)) return false;
        if (!query) return true;
        return `${option.label} ${option.value} ${option.meta}`.toLowerCase().includes(query);
      })
      .slice(0, 10);
  }, [products, relatedSearch, selectedProduct]);
  const englishTitleCandidate = selectedProduct?.title || selectedProduct?.slug || "";
  const selectedImageEntries = useMemo(() => {
    if (!selectedProduct) return [];
    return collectImageEntries([
      {
        ...selectedProduct,
        gallery: galleryItems
      }
    ]);
  }, [galleryItems, selectedProduct]);
  const selectedImageSignature = selectedImageEntries.map((entry) => `${entry.label}:${entry.path}`).join("|");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    setGalleryText(JSON.stringify(selectedProduct.gallery || [], null, 2));
    setExternalLinksText(JSON.stringify(selectedProduct.salesUrls?.external || [], null, 2));
    setSpecsText(JSON.stringify(english?.specs || [], null, 2));
    setJsonError("");
    setRelatedSearch("");
    setTagSearch("");
    setSubtagSearch("");
    setAvatarSearch("");
  }, [selectedProduct?.slug]);

  useEffect(() => {
    if (!selectedImageEntries.length) return;
    let isCancelled = false;
    const paths = selectedImageEntries.map((entry) => entry.path);

    setImageChecks((current) => {
      const next = { ...current };
      paths.forEach((path) => {
        if (path && !next[path]) next[path] = { ok: false, state: "checking", message: "確認中..." };
      });
      return next;
    });

    probeImageEntries(selectedImageEntries).then((checks) => {
      if (isCancelled) return;
      setImageChecks((current) => ({ ...current, ...checks }));
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedImageSignature]);

  async function loadProducts() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(API_BASE, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "商品データを読み込めませんでした");
      setProducts(payload.products || []);
      setProductTemplate(payload.productTemplate || null);
      setProductPageEnglish(payload.productPageEnglish || {});
      setSelectedSlug(payload.products?.[0]?.slug || "");
      setDuplicateNoticeSlug("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function updateSelected(patch) {
    if (!selectedProduct) return;
    setProducts((current) =>
      current.map((product) => (product.slug === selectedProduct.slug ? { ...product, ...patch } : product))
    );
  }

  function updateEnglish(patch) {
    if (!selectedProduct) return;
    setProductPageEnglish((current) => ({
      ...current,
      [selectedKey]: {
        ...createEnglish(selectedProduct),
        ...current[selectedKey],
        ...patch
      }
    }));
  }

  function updateSlug(nextValue, patch = {}) {
    if (!selectedProduct) return;
    const nextSlug = slugify(nextValue);
    if (!nextSlug) return;

    const oldSlug = selectedProduct.slug;
    if (nextSlug === oldSlug) {
      if (Object.keys(patch).length) updateSelected(patch);
      return;
    }
    const oldKey = legacyKey(selectedProduct);
    const nextKey = `product-${nextSlug}.html`;
    const nextGallery = galleryState.error
      ? selectedProduct.gallery || []
      : replaceGalleryPaths(galleryItems, oldSlug, nextSlug);

    setProducts((current) =>
      current.map((product) =>
        product.slug === oldSlug
          ? {
              ...product,
              ...patch,
              id: nextSlug,
              slug: nextSlug,
              legacyPath: `/${nextKey}`,
              coverImage: product.coverImage
                ? replaceProductDirPath(product.coverImage, oldSlug, nextSlug)
                : productImageDirForSlug(nextSlug) + "cover.webp",
              gallery: nextGallery
            }
          : product
      )
    );
    if (!galleryState.error) {
      setGalleryText(JSON.stringify(nextGallery, null, 2));
    }
    setDuplicateNoticeSlug((current) => (current === oldSlug ? nextSlug : current));
    setProductPageEnglish((current) => {
      const next = { ...current };
      next[nextKey] = current[oldKey] || createEnglish(selectedProduct);
      if (oldKey !== nextKey) delete next[oldKey];
      return next;
    });
    setSelectedSlug(nextSlug);
    setImageCheckSummary(null);
  }

  function handleTitleChange(nextTitle) {
    if (!selectedProduct) return;
    const nextPatch = { title: nextTitle };
    const currentTitleSlug = uniqueSlug(selectedProduct.title || "", products, selectedProduct.slug);
    const shouldAutoSlug =
      !selectedProduct.published &&
      (/^new-product(-\d+)?$/.test(selectedProduct.slug || "") || selectedProduct.slug === currentTitleSlug);

    if (shouldAutoSlug) {
      const nextSlug = uniqueSlug(nextTitle, products, selectedProduct.slug);
      updateSlug(nextSlug, nextPatch);
      return;
    }

    updateSelected(nextPatch);
  }

  function addProduct() {
    const baseSlug = uniqueSlug("new-product", products);
    const template = clone(productTemplate || {});
    const nextProduct = {
      ...template,
      id: baseSlug,
      slug: baseSlug,
      published: false,
      sortOrder: Math.max(-1, ...products.map((product) => Number(product.sortOrder) || 0)) + 1,
      title: "New Product",
      legacyPath: `/product-${baseSlug}.html`,
      contentHtml: NEW_PRODUCT_CONTENT_HTML,
      coverImage: template.coverImage?.replaceAll("example-product", baseSlug) || `/products/${baseSlug}/cover.webp`,
      gallery: (template.gallery || []).map((image) => ({
        ...image,
        src: image.src?.replaceAll("example-product", baseSlug),
        thumb: image.thumb?.replaceAll("example-product", baseSlug)
      }))
    };

    setProducts((current) => [...current, nextProduct]);
    setProductPageEnglish((current) => ({
      ...current,
      [legacyKey(nextProduct)]: createEnglish(nextProduct)
    }));
    setSelectedSlug(baseSlug);
    setDuplicateNoticeSlug("");
    setValidation(null);
    setImageCheckSummary(null);
    setMessage("新規商品を追加しました。保存前に内容と画像パスを確認してください。");
  }

  function duplicateSelectedProduct() {
    if (!selectedProduct || !english) return;
    if (galleryState.error) {
      setJsonError(`gallery JSON を修正してください: ${galleryState.error}`);
      return;
    }

    const oldSlug = selectedProduct.slug || "new-product";
    const nextSlug = uniqueSlug(`${oldSlug}-copy`, products);
    const nextTitle = withCopySuffix(selectedProduct.title, selectedProduct.slug || "New Product");
    const nextKey = `product-${nextSlug}.html`;
    const nextGallery = replaceGalleryPaths(clone(galleryItems), oldSlug, nextSlug);
    const nextCoverImage = selectedProduct.coverImage
      ? replaceProductDirPath(selectedProduct.coverImage, oldSlug, nextSlug)
      : productImageDirForSlug(nextSlug) + "cover.webp";
    const nextEnglishTitle = withCopySuffix(
      english.title,
      selectedProduct.title || selectedProduct.slug || "New Product"
    );
    const nextProduct = {
      ...clone(selectedProduct),
      id: nextSlug,
      slug: nextSlug,
      published: false,
      sortOrder: Math.max(-1, ...products.map((product) => Number(product.sortOrder) || 0)) + 1,
      title: nextTitle,
      legacyPath: `/${nextKey}`,
      coverImage: nextCoverImage,
      gallery: nextGallery
    };
    const nextEnglish = {
      ...clone(english),
      title: nextEnglishTitle,
      pageTitle: `${nextEnglishTitle} | macanon`
    };

    setProducts((current) => [...current, nextProduct]);
    setProductPageEnglish((current) => ({
      ...current,
      [nextKey]: nextEnglish
    }));
    setSelectedSlug(nextSlug);
    setDuplicateNoticeSlug(nextSlug);
    setValidation(null);
    setImageCheckSummary(null);
    setJsonError("");
    setMessage("商品を複製しました。slug / title / 画像を変更してから検証してください。");
  }

  function deleteSelectedProduct() {
    if (!selectedProduct) return;

    const targetLabel = `${selectedProduct.title || selectedProduct.slug} (${selectedProduct.slug})`;
    const confirmed = window.confirm(
      `${targetLabel} を削除します。\n関連商品の relatedIds からも参照を削除します。\n保存前に validate:products が必要です。`
    );
    if (!confirmed) return;

    const targetKey = selectedKey;
    const targetIds = new Set([selectedProduct.id, selectedProduct.slug].filter(Boolean));
    const sortedProducts = products.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const currentIndex = sortedProducts.findIndex((product) => product.slug === selectedProduct.slug);
    const nextProduct = sortedProducts[currentIndex + 1] || sortedProducts[currentIndex - 1] || null;

    setProducts((current) =>
      current
        .filter((product) => product.slug !== selectedProduct.slug)
        .map((product) => ({
          ...product,
          relatedIds: Array.isArray(product.relatedIds)
            ? product.relatedIds.filter((relatedId) => !targetIds.has(relatedId))
            : []
        }))
    );
    setProductPageEnglish((current) => {
      const next = { ...current };
      delete next[targetKey];
      return next;
    });
    setSelectedSlug(nextProduct?.slug || "");
    setValidation(null);
    setImageCheckSummary(null);
    setDuplicateNoticeSlug((current) => (current === selectedProduct.slug ? "" : current));
    setJsonError("");
    setMessage(`${targetLabel} を削除しました。relatedIds の参照も削除済みです。検証して保存してください。`);
  }

  function generateSlugFromTitle() {
    if (!selectedProduct) return;
    updateSlug(uniqueSlug(selectedProduct.title || english?.title || selectedProduct.slug, products, selectedProduct.slug));
  }

  function commitJsonTextareas() {
    if (!selectedProduct || !english) return { products, productPageEnglish };

    let nextGallery;
    let nextExternalLinks;
    let nextSpecs;

    try {
      nextGallery = JSON.parse(galleryText || "[]");
      nextExternalLinks = JSON.parse(externalLinksText || "[]");
      nextSpecs = JSON.parse(specsText || "[]");
    } catch (error) {
      throw new Error(`JSON入力を確認してください: ${error.message}`);
    }

    const nextProducts = products.map((product) =>
      product.slug === selectedProduct.slug
        ? {
            ...product,
            gallery: nextGallery,
            salesUrls: {
              booth: product.salesUrls?.booth || "",
              dlsite: product.salesUrls?.dlsite || "",
              external: nextExternalLinks
            }
          }
        : product
    );
    const nextEnglish = {
      ...productPageEnglish,
      [selectedKey]: {
        ...english,
        specs: nextSpecs
      }
    };

    setProducts(nextProducts);
    setProductPageEnglish(nextEnglish);
    setJsonError("");
    return { products: nextProducts, productPageEnglish: nextEnglish };
  }

  function updateGallery(nextItems) {
    setGalleryText(JSON.stringify(nextItems, null, 2));
    setJsonError("");
    setImageCheckSummary(null);
  }

  function updateGalleryItem(index, patch) {
    if (galleryState.error) {
      setJsonError(`gallery JSON を修正してください: ${galleryState.error}`);
      return;
    }
    updateGallery(galleryItems.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function updateGallerySrc(index, nextSrc) {
    const currentItem = galleryItems[index] || {};
    const shouldUpdateThumb = !currentItem.thumb || currentItem.thumb === thumbCandidate(currentItem.src || "");
    updateGalleryItem(index, {
      src: nextSrc,
      ...(shouldUpdateThumb ? { thumb: thumbCandidate(nextSrc) } : {})
    });
  }

  function addGalleryImage() {
    if (galleryState.error) {
      setJsonError(`gallery JSON を修正してください: ${galleryState.error}`);
      return;
    }
    updateGallery([...galleryItems, galleryImageCandidate(selectedProduct, nextGalleryIndex(selectedProduct, galleryItems) - 1)]);
  }

  function regenerateGalleryCandidates() {
    if (galleryState.error) {
      setJsonError(`gallery JSON を修正してください: ${galleryState.error}`);
      return;
    }
    const count = Math.max(galleryItems.length, 1);
    updateGallery(
      Array.from({ length: count }, (_, index) => ({
        ...galleryImageCandidate(selectedProduct, index),
        alt: galleryItems[index]?.alt || selectedProduct.coverAlt || selectedProduct.title || selectedProduct.slug,
        width: galleryItems[index]?.width ?? selectedProduct.coverWidth ?? 1000,
        height: galleryItems[index]?.height ?? selectedProduct.coverHeight ?? 1000
      }))
    );
  }

  function removeGalleryImage(index) {
    if (galleryState.error) {
      setJsonError(`gallery JSON を修正してください: ${galleryState.error}`);
      return;
    }
    updateGallery(galleryItems.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveGalleryImage(index, direction) {
    if (galleryState.error) {
      setJsonError(`gallery JSON を修正してください: ${galleryState.error}`);
      return;
    }
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= galleryItems.length) return;
    const nextItems = [...galleryItems];
    const [item] = nextItems.splice(index, 1);
    nextItems.splice(targetIndex, 0, item);
    updateGallery(nextItems);
  }

  function applyCoverCandidate() {
    updateSelected({ coverImage: coverImageCandidate(selectedProduct) });
  }

  function addRelatedId(relatedId) {
    updateSelected({ relatedIds: addUniqueValue(selectedProduct.relatedIds, relatedId) });
  }

  function removeRelatedId(relatedId) {
    updateSelected({ relatedIds: (selectedProduct.relatedIds || []).filter((value) => value !== relatedId) });
  }

  function addLabeledValue(valueKey, labelKey, option) {
    if (!option?.value) return;
    const values = addUniqueValue(selectedProduct[valueKey], option.value);
    const labels = values.map((value) => {
      const currentIndex = (selectedProduct[valueKey] || []).indexOf(value);
      if (currentIndex >= 0) return selectedProduct[labelKey]?.[currentIndex] || value;
      return option.label || value;
    });
    updateSelected({ [valueKey]: values, [labelKey]: labels });
  }

  function addAvatar(value) {
    updateSelected({ avatars: addUniqueValue(selectedProduct.avatars, value) });
  }

  function applyEnglishTitleCandidate() {
    if (!englishTitleCandidate) return;
    updateEnglish({
      title: englishTitleCandidate,
      pageTitle: `${englishTitleCandidate} | macanon`
    });
  }

  async function runImageCheck(nextProducts) {
    const entries = collectImageEntries(nextProducts);
    const checks = await probeImageEntries(entries);
    const warnings = entries
      .map((entry) => ({ ...entry, check: checks[entry.path] || { ok: false, message: "未確認です" } }))
      .filter((entry) => !entry.check.ok);

    setImageChecks((current) => ({ ...current, ...checks }));
    setImageCheckSummary({
      checked: entries.length,
      warnings
    });
    return { entries, checks, warnings };
  }

  async function validateDraft() {
    setMessage("");
    try {
      const draft = commitJsonTextareas();
      await runImageCheck(draft.products);
      const response = await fetch(`${API_BASE}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      const payload = await response.json();
      setValidation(payload.validation || null);
      if (!response.ok) throw new Error("検証エラーがあります");
      setMessage("validate:products 相当の検証に成功しました。");
      return payload.validation;
    } catch (error) {
      setJsonError(error.message);
      return null;
    }
  }

  async function saveDraft() {
    setSaving(true);
    setMessage("");
    try {
      const draft = commitJsonTextareas();
      const imageCheck = await runImageCheck(draft.products);
      const preflight = await fetch(`${API_BASE}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      const preflightPayload = await preflight.json();
      setValidation(preflightPayload.validation || null);
      if (!preflight.ok) throw new Error("検証エラーがあるため保存しませんでした");

      const response = await fetch(API_BASE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      const payload = await response.json();
      setValidation(payload.validation || preflightPayload.validation);
      if (!response.ok) throw new Error(payload.error || "保存に失敗しました");
      setMessage(
        imageCheck.warnings.length
          ? `products.json と legacy-i18n.json を保存しました。画像警告が ${imageCheck.warnings.length} 件あります。`
          : "products.json と legacy-i18n.json を保存しました。"
      );
    } catch (error) {
      setJsonError(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p>商品データを読み込んでいます...</p>
      </main>
    );
  }

  if (!selectedProduct) {
    return (
      <main className={styles.page}>
        <h1>商品管理</h1>
        <button className={styles.primaryButton} type="button" onClick={addProduct}>
          商品を追加
        </button>
      </main>
    );
  }

  return (
    <main className={styles.page} data-admin-products>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Local Admin</p>
          <h1>商品管理</h1>
          <p>products.json と英語商品データをローカルで編集します。</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={validateDraft}>
            validate:products
          </button>
          <button className={styles.primaryButton} type="button" onClick={saveDraft} disabled={isSaving}>
            {isSaving ? "保存中..." : "検証して保存"}
          </button>
        </div>
      </header>

      {(message || jsonError || validation) && (
        <section className={styles.statusPanel} aria-live="polite">
          {message ? <p className={styles.successText}>{message}</p> : null}
          {jsonError ? <p className={styles.errorText}>{jsonError}</p> : null}
          {imageCheckSummary ? <ImageCheckSummary summary={imageCheckSummary} /> : null}
          {validation ? <ValidationResult validation={validation} /> : null}
        </section>
      )}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <strong>{products.length} products</strong>
            <button className={styles.smallButton} type="button" onClick={addProduct}>
              追加
            </button>
          </div>
          <div className={styles.productList}>
            {products
              .slice()
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((product) => (
                <button
                  className={`${styles.productItem}${product.slug === selectedProduct.slug ? ` ${styles.isSelected}` : ""}`}
                  type="button"
                  key={product.slug}
                  onClick={() => setSelectedSlug(product.slug)}
                >
                  <span>{product.title || product.slug}</span>
                  <small>{product.published ? "published" : "draft"} / {product.slug}</small>
                </button>
              ))}
          </div>
        </aside>

        <section className={styles.editor}>
          <div className={styles.editorHeader}>
            <div>
              <span>選択中</span>
              <strong>{selectedProduct.title || selectedProduct.slug}</strong>
              <small>{selectedProduct.slug}</small>
            </div>
            <div className={styles.editorHeaderActions}>
              <button className={styles.secondaryButton} type="button" onClick={duplicateSelectedProduct}>
                複製
              </button>
              <button className={styles.dangerButton} type="button" onClick={deleteSelectedProduct}>
                商品を削除
              </button>
            </div>
          </div>

          {!selectedProduct.published ? (
            <div className={styles.draftNotice}>
              <strong>Draft URL</strong>
              <code>/products/{selectedProduct.slug}</code>
              <span>published:false の間は公開側では 404 が正常です。商品一覧と sitemap にも表示されません。</span>
            </div>
          ) : null}

          {duplicateNoticeSlug === selectedProduct.slug ? (
            <div className={styles.duplicateNotice} role="alert">
              <strong>複製後の確認</strong>
              <span>複製後は slug / title / 画像を変更してください。</span>
            </div>
          ) : null}

          <div className={styles.gridTwo}>
            <Field label="タイトル">
              <input value={selectedProduct.title || ""} onChange={(event) => handleTitleChange(event.target.value)} />
              {!selectedProduct.published ? (
                <small className={styles.fieldHint}>新規/draft商品はタイトルからslugと画像path候補を自動更新します。</small>
              ) : null}
            </Field>
            <Field label="slug / id">
              <div className={styles.inlineControl}>
                <input value={selectedProduct.slug || ""} onChange={(event) => updateSlug(event.target.value)} />
                <button type="button" onClick={generateSlugFromTitle}>生成</button>
              </div>
              <small className={styles.fieldHint}>現在の画像候補: {productImageDir(selectedProduct)}cover.webp</small>
            </Field>
            <Field label="公開状態">
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(selectedProduct.published)}
                  onChange={(event) => updateSelected({ published: event.target.checked })}
                />
                published
              </label>
            </Field>
            <Field label="掲載順">
              <input
                type="number"
                value={selectedProduct.sortOrder ?? 0}
                onChange={(event) => updateSelected({ sortOrder: Number(event.target.value) })}
              />
            </Field>
            <Field label="カテゴリ">
              <input value={selectedProduct.category || ""} onChange={(event) => updateSelected({ category: event.target.value })} />
            </Field>
            <Field label="カテゴリ表示名">
              <input value={selectedProduct.categoryLabel || ""} onChange={(event) => updateSelected({ categoryLabel: event.target.value })} />
            </Field>
            <Field label="価格">
              <input value={selectedProduct.price || ""} onChange={(event) => updateSelected({ price: event.target.value })} />
            </Field>
            <Field label="BOOTH URL">
              <input
                value={selectedProduct.salesUrls?.booth || ""}
                onChange={(event) => updateSelected({ salesUrls: { ...selectedProduct.salesUrls, booth: event.target.value } })}
              />
            </Field>
          </div>

          <Field label="description / SEO説明">
            <textarea value={selectedProduct.description || ""} onChange={(event) => updateSelected({ description: event.target.value })} />
          </Field>

          <div className={styles.gridTwo}>
            <Field label="対応">
              <input value={selectedProduct.support || ""} onChange={(event) => updateSelected({ support: event.target.value })} />
            </Field>
            <Field label="内容">
              <input value={selectedProduct.content || ""} onChange={(event) => updateSelected({ content: event.target.value })} />
            </Field>
            <Field label="用途">
              <input value={selectedProduct.usage || ""} onChange={(event) => updateSelected({ usage: event.target.value })} />
            </Field>
            <Field label="DLsite URL">
              <input
                value={selectedProduct.salesUrls?.dlsite || ""}
                onChange={(event) => updateSelected({ salesUrls: { ...selectedProduct.salesUrls, dlsite: event.target.value } })}
              />
            </Field>
          </div>

          <div className={styles.gridTwo}>
            <Field label="通常タグ (,区切り)">
              <input value={joinList(selectedProduct.tags)} onChange={(event) => updateSelected({ tags: splitList(event.target.value) })} />
            </Field>
            <Field label="通常タグ表示名 (,区切り)">
              <input value={joinList(selectedProduct.tagLabels)} onChange={(event) => updateSelected({ tagLabels: splitList(event.target.value) })} />
            </Field>
            <Field label="サブタグ (,区切り)">
              <input value={joinList(selectedProduct.subtags)} onChange={(event) => updateSelected({ subtags: splitList(event.target.value) })} />
            </Field>
            <Field label="サブタグ表示名 (,区切り)">
              <input value={joinList(selectedProduct.subtagLabels)} onChange={(event) => updateSelected({ subtagLabels: splitList(event.target.value) })} />
            </Field>
            <Field label="関連商品ID (,区切り)">
              <input value={joinList(selectedProduct.relatedIds)} onChange={(event) => updateSelected({ relatedIds: splitList(event.target.value) })} />
            </Field>
            <Field label="summaryTags (,区切り)">
              <input value={joinList(selectedProduct.summaryTags)} onChange={(event) => updateSelected({ summaryTags: splitList(event.target.value) })} />
            </Field>
            <Field label="対応アバター (,区切り)">
              <input value={joinList(selectedProduct.avatars)} onChange={(event) => updateSelected({ avatars: splitList(event.target.value) })} />
            </Field>
            <Field label="人気順用 likes">
              <input
                type="number"
                value={selectedProduct.likes ?? 0}
                onChange={(event) => updateSelected({ likes: Number(event.target.value) })}
              />
            </Field>
          </div>

          <section className={styles.assistPanel}>
            <div className={styles.assistHeader}>
              <div>
                <span>Input Assist</span>
                <strong>候補から追加</strong>
                <small>既存商品から relatedIds、タグ、対応アバター候補を検索して追加できます。</small>
              </div>
            </div>
            <div className={styles.assistGrid}>
              <SuggestionGroup
                title="relatedIds候補"
                searchLabel="商品名・slugで検索"
                searchValue={relatedSearch}
                onSearchChange={setRelatedSearch}
                options={relatedOptions}
                selectedValues={selectedProduct.relatedIds || []}
                onPick={(option) => addRelatedId(option.value)}
                onRemove={removeRelatedId}
              />
              <SuggestionGroup
                title="通常タグ候補"
                searchLabel="タグで検索"
                searchValue={tagSearch}
                onSearchChange={setTagSearch}
                options={filterOptions(tagOptions, tagSearch, selectedProduct.tags)}
                selectedValues={selectedProduct.tags || []}
                onPick={(option) => addLabeledValue("tags", "tagLabels", option)}
              />
              <SuggestionGroup
                title="サブタグ候補"
                searchLabel="サブタグで検索"
                searchValue={subtagSearch}
                onSearchChange={setSubtagSearch}
                options={filterOptions(subtagOptions, subtagSearch, selectedProduct.subtags)}
                selectedValues={selectedProduct.subtags || []}
                onPick={(option) => addLabeledValue("subtags", "subtagLabels", option)}
              />
              <SuggestionGroup
                title="対応アバター候補"
                searchLabel="アバター名で検索"
                searchValue={avatarSearch}
                onSearchChange={setAvatarSearch}
                options={filterOptions(avatarOptions, avatarSearch, selectedProduct.avatars)}
                selectedValues={selectedProduct.avatars || []}
                onPick={(option) => addAvatar(option.value)}
              />
            </div>
          </section>

          <div className={styles.gridTwo}>
            <Field label="coverImage">
              <input value={selectedProduct.coverImage || ""} onChange={(event) => updateSelected({ coverImage: event.target.value })} />
            </Field>
            <Field label="coverAlt">
              <input value={selectedProduct.coverAlt || ""} onChange={(event) => updateSelected({ coverAlt: event.target.value })} />
            </Field>
            <Field label="coverWidth">
              <input type="number" value={selectedProduct.coverWidth ?? 600} onChange={(event) => updateSelected({ coverWidth: Number(event.target.value) })} />
            </Field>
            <Field label="coverHeight">
              <input type="number" value={selectedProduct.coverHeight ?? 600} onChange={(event) => updateSelected({ coverHeight: Number(event.target.value) })} />
            </Field>
          </div>

          <section className={styles.imagePanel}>
            <div className={styles.imageGuide}>
              <div>
                <span>画像配置先</span>
                <strong>public{productImageDir(selectedProduct)}</strong>
                <small>JSONでは `{productImageDir(selectedProduct)}...` の形式で指定します。</small>
              </div>
              <button className={styles.smallButton} type="button" onClick={applyCoverCandidate}>
                cover.webp候補
              </button>
            </div>

            <div className={styles.coverPreviewGrid}>
              <ImagePreview
                label="cover.webp"
                path={selectedProduct.coverImage || ""}
                check={imageChecks[selectedProduct.coverImage || ""]}
              />
              <div className={styles.imageWarnings}>
                <strong>画像チェック</strong>
                <ImageWarningList entries={selectedImageEntries} checks={imageChecks} />
              </div>
            </div>

            <div className={styles.galleryHeader}>
              <div>
                <span>Gallery</span>
                <strong>サムネイル一覧</strong>
                <small>並び替え、追加、削除、thumb候補入力ができます。</small>
              </div>
              <div className={styles.inlineActions}>
                <button className={styles.smallButton} type="button" onClick={regenerateGalleryCandidates}>
                  連番候補を再生成
                </button>
                <button className={styles.smallButton} type="button" onClick={addGalleryImage}>
                  gallery追加
                </button>
              </div>
            </div>

            {galleryState.error ? (
              <p className={styles.warningText}>gallery JSON を修正してください: {galleryState.error}</p>
            ) : null}

            <div className={styles.galleryEditorList}>
              {galleryItems.map((image, index) => (
                <div className={styles.galleryEditorItem} key={`${image.src || "gallery"}-${index}`}>
                  <ImagePreview label={`gallery ${index + 1}`} path={image.src || ""} check={imageChecks[image.src || ""]} />
                  <div className={styles.galleryEditorFields}>
                    <label>
                      <span>src</span>
                      <input value={image.src || ""} onChange={(event) => updateGallerySrc(index, event.target.value)} />
                    </label>
                    <label>
                      <span>thumb</span>
                      <input value={image.thumb || ""} onChange={(event) => updateGalleryItem(index, { thumb: event.target.value })} />
                    </label>
                    <label>
                      <span>alt</span>
                      <input value={image.alt || ""} onChange={(event) => updateGalleryItem(index, { alt: event.target.value })} />
                    </label>
                    <div className={styles.galleryMetaFields}>
                      <label>
                        <span>width</span>
                        <input
                          type="number"
                          value={image.width ?? 1000}
                          onChange={(event) => updateGalleryItem(index, { width: Number(event.target.value) })}
                        />
                      </label>
                      <label>
                        <span>height</span>
                        <input
                          type="number"
                          value={image.height ?? 1000}
                          onChange={(event) => updateGalleryItem(index, { height: Number(event.target.value) })}
                        />
                      </label>
                    </div>
                  </div>
                  <div className={styles.galleryItemActions}>
                    <button type="button" onClick={() => moveGalleryImage(index, -1)} disabled={index === 0}>
                      ↑
                    </button>
                    <button type="button" onClick={() => moveGalleryImage(index, 1)} disabled={index === galleryItems.length - 1}>
                      ↓
                    </button>
                    <button type="button" onClick={() => updateGalleryItem(index, { thumb: thumbCandidate(image.src || "") })}>
                      thumb候補
                    </button>
                    <button type="button" onClick={() => removeGalleryImage(index)}>
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Field label="gallery JSON">
            <textarea className={styles.codeArea} value={galleryText} onChange={(event) => setGalleryText(event.target.value)} />
          </Field>

          <Field label="外部販売URL JSON">
            <textarea className={styles.codeArea} value={externalLinksText} onChange={(event) => setExternalLinksText(event.target.value)} />
          </Field>

          <Field label="購入前注意文">
            <textarea value={selectedProduct.note || ""} onChange={(event) => updateSelected({ note: event.target.value })} />
          </Field>

          <Field label="本文HTML">
            <textarea className={styles.codeArea} value={selectedProduct.contentHtml || ""} onChange={(event) => updateSelected({ contentHtml: event.target.value })} />
          </Field>

          <section className={styles.subsection}>
            <h2>英語データ</h2>
            <div className={styles.gridTwo}>
              <Field label="English title">
                <input value={english?.title || ""} onChange={(event) => updateEnglish({ title: event.target.value })} />
                {!english?.title && englishTitleCandidate ? (
                  <span className={styles.inlineSuggestion}>
                    候補: {englishTitleCandidate}
                    <button type="button" onClick={applyEnglishTitleCandidate}>候補を入れる</button>
                  </span>
                ) : null}
              </Field>
              <Field label="English pageTitle">
                <input value={english?.pageTitle || ""} onChange={(event) => updateEnglish({ pageTitle: event.target.value })} />
              </Field>
            </div>
            <Field label="English description">
              <textarea value={english?.description || ""} onChange={(event) => updateEnglish({ description: event.target.value })} />
            </Field>
            <Field label="English summaryTags (,区切り)">
              <input value={joinList(english?.summaryTags)} onChange={(event) => updateEnglish({ summaryTags: splitList(event.target.value) })} />
            </Field>
            <Field label="English specs JSON">
              <textarea className={styles.codeArea} value={specsText} onChange={(event) => setSpecsText(event.target.value)} />
            </Field>
            <Field label="English note">
              <textarea value={english?.note || ""} onChange={(event) => updateEnglish({ note: event.target.value })} />
            </Field>
            <Field label="English detailHtml">
              <textarea className={styles.codeArea} value={english?.detailHtml || ""} onChange={(event) => updateEnglish({ detailHtml: event.target.value })} />
            </Field>
          </section>
        </section>
      </div>
    </main>
  );
}

function Field({ children, label }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function SuggestionGroup({
  onPick,
  onRemove,
  onSearchChange,
  options,
  searchLabel,
  searchValue,
  selectedValues,
  title
}) {
  return (
    <section className={styles.suggestionGroup}>
      <header>
        <strong>{title}</strong>
        <small>{selectedValues.length ? `選択中 ${selectedValues.length}件` : "未選択"}</small>
      </header>
      <label className={styles.suggestionSearch}>
        <span>{searchLabel}</span>
        <input value={searchValue} onChange={(event) => onSearchChange(event.target.value)} />
      </label>
      {selectedValues.length ? (
        <div className={styles.selectedChips}>
          {selectedValues.map((value) => (
            <button
              type="button"
              key={value}
              onClick={onRemove ? () => onRemove(value) : undefined}
              disabled={!onRemove}
              title={onRemove ? `${value} を外す` : value}
            >
              {value}
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.suggestionChips}>
        {options.length ? (
          options.map((option) => (
            <button type="button" key={option.value} onClick={() => onPick(option)}>
              <span>{option.label}</span>
              {option.meta ? <small>{option.meta}</small> : null}
            </button>
          ))
        ) : (
          <p>候補がありません。</p>
        )}
      </div>
    </section>
  );
}

function ValidationResult({ validation }) {
  const imageErrors = (validation.errors || []).filter(isImageValidationMessage);
  const otherErrors = (validation.errors || []).filter((error) => !isImageValidationMessage(error));

  return (
    <div className={styles.validation}>
      <strong>{validation.ok ? "Validation passed" : "Validation failed"}</strong>
      {validation.counts ? (
        <p>
          Products: {validation.counts.products} / Published: {validation.counts.published} / Images: {validation.counts.images} / Links: {validation.counts.links}
        </p>
      ) : null}
      {imageErrors.length ? (
        <div className={styles.validationGroup}>
          <strong>画像エラー</strong>
          <ul className={styles.errorList}>
            {imageErrors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      ) : null}
      {otherErrors.length ? (
        <ul className={styles.errorList}>
          {otherErrors.map((error) => <li key={error}>{error}</li>)}
        </ul>
      ) : null}
      {validation.warnings?.length ? (
        <ul className={styles.warningList}>
          {validation.warnings.map((warning) => <li key={warning}>{warning}</li>)}
        </ul>
      ) : null}
    </div>
  );
}

function isImageValidationMessage(message) {
  return /coverImage|gallery\[\d+\]\.(src|thumb)|画像ファイル/.test(message);
}

function ImagePreview({ check, label, path }) {
  const status = check || (path ? { state: "checking", message: "確認中..." } : { state: "missing", message: "パス未入力" });
  const isOk = status.ok;

  return (
    <figure className={`${styles.imagePreview}${isOk ? "" : ` ${styles.hasImageWarning}`}`}>
      <div className={styles.imagePreviewFrame}>
        {isOk && path ? <img src={path} alt={label} loading="lazy" /> : <span>{label}</span>}
      </div>
      <figcaption>
        <strong>{label}</strong>
        <small>{path || "パス未入力"}</small>
        <em>{status.message}</em>
      </figcaption>
    </figure>
  );
}

function ImageWarningList({ checks, entries }) {
  const warnings = entries
    .map((entry) => ({ ...entry, check: checks[entry.path] || null }))
    .filter((entry) => !entry.check?.ok);

  if (!warnings.length) {
    return <p className={styles.successText}>選択中商品の画像は確認できています。</p>;
  }

  return (
    <ul className={styles.warningList}>
      {warnings.map((entry) => (
        <li key={`${entry.label}:${entry.path || "empty"}`}>
          {entry.label}: {entry.check?.message || "未確認です"} {entry.path ? `(${entry.path})` : ""}
        </li>
      ))}
    </ul>
  );
}

function ImageCheckSummary({ summary }) {
  if (!summary.warnings.length) {
    return <p className={styles.successText}>画像チェック: {summary.checked}件 OK</p>;
  }

  return (
    <div className={styles.imageCheckSummary}>
      <strong>画像チェック: {summary.warnings.length}件の警告</strong>
      <ul className={styles.warningList}>
        {summary.warnings.slice(0, 12).map((warning) => (
          <li key={`${warning.label}:${warning.path || "empty"}`}>
            {warning.label}: {warning.check.message} {warning.path ? `(${warning.path})` : ""}
          </li>
        ))}
      </ul>
      {summary.warnings.length > 12 ? <p>ほか {summary.warnings.length - 12} 件あります。</p> : null}
    </div>
  );
}
