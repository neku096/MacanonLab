"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AdminFilePathInput from "./AdminFilePathInput";
import styles from "./AdminProductsClient.module.css";

const API_BASE = "/api/admin/products";
const FILE_API = "/api/admin/files";
const SLIDE_LINKS_API = "/api/admin/slide-links";
const ALLOWED_IMAGE_EXTENSIONS = new Set(["webp", "png", "jpg", "jpeg"]);
const PRODUCT_WIZARD_STEPS = [
  { id: "basic", label: "基本情報" },
  { id: "images", label: "画像" },
  { id: "description", label: "商品説明" },
  { id: "english", label: "英語情報" },
  { id: "publish", label: "公開準備" }
];
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

function getFileExtension(fileName = "") {
  const match = String(fileName).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "";
}

function isSupportedImageName(fileName = "") {
  return ALLOWED_IMAGE_EXTENSIONS.has(getFileExtension(fileName));
}

function sanitizeFileName(fileName = "") {
  const safeName = String(fileName || "image.webp")
    .replace(/[\\/:*?"<>|#%{}^~[\]`]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return safeName || "image.webp";
}

function fileNameStem(fileName = "") {
  return sanitizeFileName(fileName).replace(/\.[^.]+$/, "");
}

function isThumbFileName(fileName = "") {
  return /-thumb\.webp$/i.test(fileName);
}

function isCoverFileName(fileName = "") {
  return sanitizeFileName(fileName).toLowerCase() === "cover.webp";
}

function buildBatchImageEntry(file, product) {
  const safeName = sanitizeFileName(file.name);
  const targetPath = `${productImageDir(product)}${safeName}`;
  const stem = fileNameStem(safeName);
  return {
    file,
    safeName,
    targetPath,
    stem: stem.replace(/-thumb$/i, ""),
    isCover: isCoverFileName(safeName),
    isThumb: isThumbFileName(safeName)
  };
}

function buildBatchImagePlan(files, product) {
  const entries = Array.from(files || []).map((file) => ({
    file,
    supported: isSupportedImageName(file.name)
  }));
  const unsupported = entries.filter((entry) => !entry.supported).map((entry) => entry.file.name);
  const supportedEntries = entries
    .filter((entry) => entry.supported)
    .map((entry) => buildBatchImageEntry(entry.file, product));
  const thumbByStem = new Map();
  supportedEntries
    .filter((entry) => entry.isThumb)
    .forEach((entry) => thumbByStem.set(entry.stem.toLowerCase(), entry));

  const imageEntries = supportedEntries.filter((entry) => !entry.isThumb);
  const coverEntry = imageEntries.find((entry) => entry.isCover) || imageEntries[0] || null;
  const galleryEntries = imageEntries.filter((entry) => entry !== coverEntry);
  const gallery = galleryEntries.map((entry) => {
    const thumbEntry = thumbByStem.get(entry.stem.toLowerCase());
    return {
      src: entry.targetPath,
      thumb: thumbEntry?.targetPath || thumbCandidate(entry.targetPath),
      alt: product?.coverAlt || product?.title || product?.slug || "",
      width: product?.coverWidth ?? 1000,
      height: product?.coverHeight ?? 1000
    };
  });

  return {
    coverPath: coverEntry?.targetPath || "",
    entries: supportedEntries,
    gallery,
    unsupported
  };
}

function getPrimarySalesUrl(product) {
  const externalUrl = Array.isArray(product?.salesUrls?.external)
    ? product.salesUrls.external.find((item) => hasText(item?.url) || hasText(item?.href))
    : null;
  return (
    product?.salesUrls?.booth ||
    product?.salesUrls?.dlsite ||
    externalUrl?.url ||
    externalUrl?.href ||
    (product?.slug ? `/products/${product.slug}` : "")
  );
}

function getTopCardCategory(product) {
  return (
    product?.categoryLabel ||
    product?.category ||
    product?.tagLabels?.[0] ||
    product?.tags?.[0] ||
    "other"
  );
}

function uniqueSlideLinkId(base, slideLinks, currentId = "") {
  const normalizedBase = slugify(base) || "slide-link";
  const used = new Set(slideLinks.map((link) => link.id).filter((id) => id && id !== currentId));
  let nextId = normalizedBase;
  let suffix = 2;

  while (used.has(nextId)) {
    nextId = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }

  return nextId;
}

function buildSlideLinkFromProduct(product, slideLinks, existingLink = null) {
  const sortOrder = existingLink?.sortOrder ?? Math.max(-1, ...slideLinks.map((link) => Number(link.sortOrder) || 0)) + 1;
  return {
    ...(existingLink || {}),
    id: existingLink?.id || uniqueSlideLinkId(product.slug || product.title, slideLinks),
    title: product.title || product.slug,
    description: product.description || "",
    url: getPrimarySalesUrl(product),
    thumbnail: product.coverImage || "",
    category: getTopCardCategory(product),
    tags: Array.isArray(product.tags) ? product.tags : [],
    sortOrder,
    published: true,
    openInNewTab: true,
    sourceProductSlug: product.slug
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

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseJsonArrayText(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    if (!Array.isArray(parsed)) return { items: [], error: "配列形式にしてください" };
    return { items: parsed, error: "" };
  } catch (error) {
    return { items: [], error: error.message };
  }
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
      return { items: [], error: "商品画像一覧JSON は配列形式にしてください" };
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
    entries.push({ label: `${product.slug}: カバー画像`, path: product.coverImage || "" });
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((image, index) => {
        entries.push({ label: `${product.slug}: 商品画像${index + 1}`, path: image?.src || "" });
        entries.push({ label: `${product.slug}: サムネイル${index + 1}`, path: image?.thumb || "" });
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

function buildPublishChecklist({ english, externalLinks, galleryError, galleryItems, product, validation }) {
  const salesUrlReady =
    hasText(product?.salesUrls?.booth) ||
    hasText(product?.salesUrls?.dlsite) ||
    externalLinks.some((item) => hasText(item?.url) || hasText(item?.href));
  const galleryReady = !galleryError && galleryItems.some((image) => hasText(image?.src));

  return [
    { label: "タイトル", ready: hasText(product?.title), hint: "商品名を入力" },
    { label: "商品ID / slug", ready: hasText(product?.slug), hint: "URLと画像フォルダ名に使います" },
    { label: "BOOTH URL または販売URL", ready: salesUrlReady, hint: "BOOTH URL優先。なければDLsite/外部販売URL" },
    { label: "説明文", ready: hasText(product?.description), hint: "商品一覧やTopカードの説明元になります" },
    { label: "cover画像", ready: hasText(product?.coverImage), hint: "Topカードのサムネイル元になります" },
    { label: "gallery画像", ready: galleryReady, hint: "最低1枚の画像パス" },
    { label: "本文HTML", ready: hasText(product?.contentHtml), hint: "商品詳細の本文" },
    { label: "英語タイトル", ready: hasText(english?.title), hint: "EN切替用" },
    { label: "英語説明", ready: hasText(english?.description), hint: "EN切替用" },
    { label: "relatedIds", ready: Array.isArray(product?.relatedIds) && product.relatedIds.length > 0, hint: "関連商品を1件以上" },
    { label: "published", ready: Boolean(product?.published), hint: "公開ON" },
    { label: "validate OK", ready: Boolean(validation?.ok), hint: "商品データを確認でOKにする" }
  ];
}

function contentHtmlHas(product, patterns) {
  const contentHtml = product?.contentHtml || "";
  return patterns.some((pattern) => contentHtml.includes(pattern));
}

function buildDescriptionSectionItems(product) {
  return [
    { label: "導入方法", ready: contentHtmlHas(product, ["導入方法"]) },
    { label: "梱包内容", ready: hasText(product?.content) || contentHtmlHas(product, ["梱包内容", "同梱内容"]) },
    { label: "FAQ", ready: contentHtmlHas(product, ["FAQ"]) }
  ];
}

function buildWizardStepStatuses({ english, galleryError, galleryItems, product, publishChecklist, validation }) {
  const galleryReady = !galleryError && galleryItems.some((image) => hasText(image?.src));
  const thumbReady = !galleryError && galleryItems.some((image) => hasText(image?.thumb));
  const checklistReady = publishChecklist.filter((item) => item.ready).length;

  return PRODUCT_WIZARD_STEPS.map((step) => {
    const itemsByStep = {
      basic: [
        { key: "title", label: "タイトル", ready: hasText(product?.title) },
        { key: "slug", label: "商品ID / slug", ready: hasText(product?.slug) },
        { key: "category", label: "カテゴリ", ready: hasText(product?.category) },
        { key: "tags", label: "タグ", ready: Array.isArray(product?.tags) && product.tags.length > 0 },
        { key: "avatars", label: "対応アバター", ready: Array.isArray(product?.avatars) && product.avatars.length > 0 },
        { key: "price", label: "価格", ready: hasText(product?.price) },
        { key: "booth", label: "BOOTH URL", ready: hasText(product?.salesUrls?.booth) }
      ],
      images: [
        { key: "coverImage", label: "coverImage", ready: hasText(product?.coverImage) },
        { key: "gallery", label: "gallery", ready: galleryReady },
        { key: "thumb", label: "thumb", ready: thumbReady },
        { key: "preview", label: "画像プレビュー", ready: hasText(product?.coverImage) || galleryReady, required: false }
      ],
      description: [
        { key: "description", label: "description", ready: hasText(product?.description) },
        { key: "contentHtml", label: "本文HTML", ready: hasText(product?.contentHtml) },
        { key: "install", label: "導入方法", ready: contentHtmlHas(product, ["導入方法"]) },
        { key: "contents", label: "梱包内容", ready: hasText(product?.content) || contentHtmlHas(product, ["梱包内容", "同梱内容"]) },
        { key: "faq", label: "FAQ", ready: contentHtmlHas(product, ["FAQ"]) }
      ],
      english: [
        { key: "englishTitle", label: "EN title", ready: hasText(english?.title) },
        { key: "englishDescription", label: "EN description", ready: hasText(english?.description) },
        { key: "englishTags", label: "EN tags", ready: Array.isArray(english?.summaryTags) && english.summaryTags.length > 0 },
        { key: "englishDetail", label: "EN本文", ready: hasText(english?.detailHtml), required: false }
      ],
      publish: [
        { key: "checklist", label: `公開準備チェックリスト ${checklistReady}/${publishChecklist.length}`, ready: checklistReady === publishChecklist.length },
        { key: "validate", label: "validate OK", ready: Boolean(validation?.ok) },
        { key: "published", label: "published", ready: Boolean(product?.published) }
      ]
    };
    const items = itemsByStep[step.id] || [];
    const missingItems = items.filter((item) => item.required !== false && !item.ready);
    return {
      ...step,
      items,
      missingItems,
      readyCount: items.filter((item) => item.ready).length,
      requiredCount: items.filter((item) => item.required !== false).length
    };
  });
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
  const batchImageInputRef = useRef(null);
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
  const [savedProductSlug, setSavedProductSlug] = useState("");
  const [topCardStatus, setTopCardStatus] = useState(null);
  const [batchImageStatus, setBatchImageStatus] = useState(null);
  const [isBatchDragging, setBatchDragging] = useState(false);
  const [isBatchUploading, setBatchUploading] = useState(false);
  const [imagePreviewRevision, setImagePreviewRevision] = useState(0);
  const [editorMode, setEditorMode] = useState("wizard");
  const [wizardStepIndex, setWizardStepIndex] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isSyncingTopCard, setSyncingTopCard] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.slug === selectedSlug) || products[0] || null,
    [products, selectedSlug]
  );
  const selectedKey = legacyKey(selectedProduct);
  const english = selectedProduct ? productPageEnglish[selectedKey] || createEnglish(selectedProduct) : null;
  const galleryState = useMemo(() => parseGalleryText(galleryText), [galleryText]);
  const externalLinksState = useMemo(() => parseJsonArrayText(externalLinksText), [externalLinksText]);
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
  const publishChecklist = useMemo(
    () =>
      selectedProduct
        ? buildPublishChecklist({
            english,
            externalLinks: externalLinksState.items,
            galleryError: galleryState.error,
            galleryItems,
            product: selectedProduct,
            validation
          })
        : [],
    [english, externalLinksState.items, galleryItems, galleryState.error, selectedProduct, validation]
  );
  const descriptionSectionItems = useMemo(() => buildDescriptionSectionItems(selectedProduct), [selectedProduct]);
  const wizardStepStatuses = useMemo(
    () =>
      selectedProduct
        ? buildWizardStepStatuses({
            english,
            galleryError: galleryState.error,
            galleryItems,
            product: selectedProduct,
            publishChecklist,
            validation
          })
        : PRODUCT_WIZARD_STEPS.map((step) => ({ ...step, items: [], missingItems: [], readyCount: 0, requiredCount: 0 })),
    [english, galleryItems, galleryState.error, publishChecklist, selectedProduct, validation]
  );
  const isWizardMode = editorMode === "wizard";
  const activeWizardStep = wizardStepStatuses[wizardStepIndex] || wizardStepStatuses[0];
  const activeWizardStepId = activeWizardStep?.id || PRODUCT_WIZARD_STEPS[0].id;
  const publishWarningItems = wizardStepStatuses.flatMap((step) =>
    step.missingItems
      .filter((item) => item.key !== "published")
      .map((item) => `${step.label}: ${item.label}`)
  );
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

  function markDraftChanged() {
    setSavedProductSlug("");
    setTopCardStatus(null);
    setBatchImageStatus(null);
    setValidation(null);
    setImageCheckSummary(null);
  }

  function setWizardStep(nextIndex) {
    setWizardStepIndex(Math.max(0, Math.min(PRODUCT_WIZARD_STEPS.length - 1, nextIndex)));
  }

  function getWizardPanelClass(stepId) {
    return `${styles.wizardPanel}${isWizardMode && activeWizardStepId !== stepId ? ` ${styles.isWizardHidden}` : ""}`;
  }

  function updatePublished(nextPublished) {
    if (nextPublished && publishWarningItems.length) {
      const preview = publishWarningItems.slice(0, 8).join("\n");
      const extra = publishWarningItems.length > 8 ? `\n...ほか ${publishWarningItems.length - 8}件` : "";
      const confirmed = window.confirm(`公開前の不足項目があります。\n${preview}${extra}\n\npublished=true にしますか？`);
      if (!confirmed) return;
    }
    updateSelected({ published: nextPublished });
  }

  function updateSelected(patch) {
    if (!selectedProduct) return;
    markDraftChanged();
    setProducts((current) =>
      current.map((product) => (product.slug === selectedProduct.slug ? { ...product, ...patch } : product))
    );
  }

  function updateEnglish(patch) {
    if (!selectedProduct) return;
    markDraftChanged();
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
    markDraftChanged();

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
    setSavedProductSlug("");
    setTopCardStatus(null);
    setEditorMode("wizard");
    setWizardStep(0);
    setMessage("新規商品を追加しました。保存前に内容と画像パスを確認してください。");
  }

  async function duplicateSelectedProduct() {
    if (!selectedProduct || !english) return;
    if (galleryState.error) {
      setJsonError(`商品画像一覧JSON を修正してください: ${galleryState.error}`);
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
    let finalGallery = nextGallery;
    let finalCoverImage = nextCoverImage;
    let imageCopyMessage = "";

    setJsonError("");
    setMessage(`画像を public/products/${nextSlug}/ へコピーしています...`);
    try {
      const copyResult = await copyProductImagesForDuplicate(oldSlug, nextSlug);
      if (!copyResult?.ok || Number(copyResult.copied) < 1) {
        throw new Error("コピーできる画像が見つかりませんでした。");
      }
      imageCopyMessage = `画像 ${copyResult.copied} 件を public/products/${nextSlug}/ へコピーしました。`;
    } catch (error) {
      finalGallery = clone(galleryItems);
      finalCoverImage = selectedProduct.coverImage || "";
      imageCopyMessage = `画像コピーに失敗したため、元商品の画像パスを参照しています。${error.message ? ` ${error.message}` : ""}`;
    }

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
      coverImage: finalCoverImage,
      gallery: finalGallery
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
    setSavedProductSlug("");
    setTopCardStatus(null);
    setEditorMode("wizard");
    setWizardStep(0);
    setJsonError("");
    setGalleryText(JSON.stringify(finalGallery, null, 2));
    setImagePreviewRevision((current) => current + 1);
    setMessage(`商品を複製しました。${imageCopyMessage} slug / タイトル / 画像を確認してから検証してください。`);
  }

  function deleteSelectedProduct() {
    if (!selectedProduct) return;

    const targetLabel = `${selectedProduct.title || selectedProduct.slug} (${selectedProduct.slug})`;
    const confirmed = window.confirm(
      `${targetLabel} を削除します。\n関連商品の参照からも削除します。\n保存前に商品データ確認が必要です。`
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
    setMessage(`${targetLabel} を削除しました。関連商品の参照も削除済みです。検証して保存してください。`);
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
    setValidation(null);
    setImageCheckSummary(null);
    setSavedProductSlug("");
    setTopCardStatus(null);
  }

  function updateGalleryItem(index, patch) {
    if (galleryState.error) {
      setJsonError(`商品画像一覧JSON を修正してください: ${galleryState.error}`);
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
      setJsonError(`商品画像一覧JSON を修正してください: ${galleryState.error}`);
      return;
    }
    updateGallery([...galleryItems, galleryImageCandidate(selectedProduct, nextGalleryIndex(selectedProduct, galleryItems) - 1)]);
  }

  function regenerateGalleryCandidates() {
    if (galleryState.error) {
      setJsonError(`商品画像一覧JSON を修正してください: ${galleryState.error}`);
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
      setJsonError(`商品画像一覧JSON を修正してください: ${galleryState.error}`);
      return;
    }
    updateGallery(galleryItems.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveGalleryImage(index, direction) {
    if (galleryState.error) {
      setJsonError(`商品画像一覧JSON を修正してください: ${galleryState.error}`);
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

  function openBatchImagePicker() {
    batchImageInputRef.current?.click();
  }

  async function checkImageTarget(entry) {
    const checkResponse = await fetch(`${FILE_API}?targetPath=${encodeURIComponent(entry.targetPath)}`, { cache: "no-store" });
    const checkPayload = await checkResponse.json().catch(() => ({}));
    if (!checkResponse.ok) {
      throw new Error(checkPayload.error || `${entry.safeName} の保存先を確認できませんでした。`);
    }
    return { entry, exists: Boolean(checkPayload.exists) };
  }

  async function copyProductImagesForDuplicate(sourceSlug, targetSlug, overwrite = false) {
    const response = await fetch(FILE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "copyProductImages",
        sourceSlug,
        targetSlug,
        overwrite
      })
    });
    const payload = await response.json().catch(() => ({}));

    if (response.status === 409 && payload.conflict) {
      const shouldOverwrite = window.confirm(`public/products/${targetSlug}/ は既に存在します。画像を上書きしますか？`);
      if (shouldOverwrite) {
        return copyProductImagesForDuplicate(sourceSlug, targetSlug, true);
      }
      throw new Error("画像コピーをキャンセルしました。");
    }

    if (!response.ok) {
      throw new Error(payload.error || "画像コピーに失敗しました。");
    }

    return payload;
  }

  async function uploadBatchImage(entry, overwrite = false) {
    const formData = new FormData();
    formData.set("file", entry.file);
    formData.set("targetPath", entry.targetPath);
    formData.set("overwrite", overwrite ? "true" : "false");

    const response = await fetch(FILE_API, { method: "POST", body: formData });
    const payload = await response.json().catch(() => ({}));

    if (response.status === 409 && payload.conflict) {
      const shouldOverwrite = window.confirm(`public${entry.targetPath} は既に存在します。上書きしますか？`);
      if (shouldOverwrite) {
        return uploadBatchImage(entry, true);
      }
      return { path: entry.targetPath, skipped: true, overwritten: false };
    }

    if (!response.ok) {
      throw new Error(payload.error || `${entry.safeName} の保存に失敗しました。`);
    }

    return {
      path: payload.path || entry.targetPath,
      skipped: false,
      overwritten: Boolean(payload.overwritten)
    };
  }

  async function validateImageBatchDraft(nextProducts) {
    await runImageCheck(nextProducts);
    const response = await fetch(`${API_BASE}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: nextProducts, productPageEnglish })
    });
    const payload = await response.json();
    setValidation(payload.validation || null);
    return payload.validation || null;
  }

  async function processBatchImages(fileList) {
    if (!selectedProduct || isBatchUploading) return;
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const plan = buildBatchImagePlan(files, selectedProduct);
    if (!plan.entries.length) {
      setBatchImageStatus({
        ok: false,
        message: "対応画像がありません。WebP / PNG / JPG / JPEG を選んでください。",
        details: plan.unsupported
      });
      return;
    }

    setBatchUploading(true);
    setBatchImageStatus({ ok: true, message: "画像を保存しています...", details: [] });
    setJsonError("");
    setMessage("");

    try {
      const targetStates = await Promise.all(plan.entries.map((entry) => checkImageTarget(entry)));
      const existingTargets = targetStates.filter((state) => state.exists);
      let overwriteExisting = false;
      if (existingTargets.length) {
        const previewList = existingTargets
          .slice(0, 6)
          .map((state) => `public${state.entry.targetPath}`)
          .join("\n");
        const extraCount = existingTargets.length > 6 ? `\n...ほか ${existingTargets.length - 6}件` : "";
        overwriteExisting = window.confirm(`既存ファイル ${existingTargets.length} 件を上書きしますか？\n${previewList}${extraCount}`);
      }

      const uploadResults = [];
      for (const targetState of targetStates) {
        if (targetState.exists && !overwriteExisting) {
          uploadResults.push({
            entry: targetState.entry,
            result: { path: targetState.entry.targetPath, skipped: true, overwritten: false }
          });
          continue;
        }
        uploadResults.push({
          entry: targetState.entry,
          result: await uploadBatchImage(targetState.entry, targetState.exists && overwriteExisting)
        });
      }

      const skipped = uploadResults.filter((item) => item.result.skipped);
      const overwritten = uploadResults.filter((item) => item.result.overwritten);
      const uploadedPaths = uploadResults.map((item) => item.entry.targetPath);
      const nextGallery = plan.gallery.length ? plan.gallery : galleryItems;
      const nextProducts = products.map((product) =>
        product.slug === selectedProduct.slug
          ? {
              ...product,
              ...(plan.coverPath ? { coverImage: plan.coverPath } : {}),
              gallery: nextGallery
            }
          : product
      );

      setProducts(nextProducts);
      setGalleryText(JSON.stringify(nextGallery, null, 2));
      setSavedProductSlug("");
      setTopCardStatus(null);
      setImagePreviewRevision((current) => current + 1);
      setImageChecks((current) => {
        const next = { ...current };
        uploadedPaths.forEach((path) => {
          next[path] = { ok: true, state: "ok", message: "保存済み" };
        });
        return next;
      });

      const nextValidation = await validateImageBatchDraft(nextProducts);
      const details = [
        `保存先: public${productImageDir(selectedProduct)}`,
        plan.coverPath ? `coverImage: ${plan.coverPath}` : "coverImage: 変更なし",
        plan.gallery.length ? `gallery: ${plan.gallery.length}件を反映` : "gallery: 変更なし",
        overwritten.length ? `上書き: ${overwritten.length}件` : "",
        skipped.length ? `既存ファイルを使用: ${skipped.length}件` : "",
        plan.unsupported.length ? `未対応でスキップ: ${plan.unsupported.join(", ")}` : ""
      ].filter(Boolean);

      setBatchImageStatus({
        ok: Boolean(nextValidation?.ok),
        message: nextValidation?.ok
          ? "画像を反映し、検証OKです。"
          : "画像を反映しました。検証結果を確認してください。",
        details
      });
      setMessage("画像候補をcover/galleryへ反映しました。プレビューと検証結果を確認してください。");
    } catch (error) {
      setBatchImageStatus({ ok: false, message: error.message, details: [] });
      setJsonError(error.message);
    } finally {
      setBatchUploading(false);
    }
  }

  function handleBatchImageDrop(event) {
    event.preventDefault();
    setBatchDragging(false);
    processBatchImages(event.dataTransfer.files);
  }

  function handleBatchImageInputChange(event) {
    processBatchImages(event.target.files);
    event.target.value = "";
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
      setMessage("商品データの確認に成功しました。");
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
      setSavedProductSlug(selectedProduct.slug);
      setTopCardStatus(null);
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

  async function syncTopCardFromProduct() {
    if (!selectedProduct) return;
    const confirmed = window.confirm(
      `${selectedProduct.title || selectedProduct.slug} のTopカードを作成/更新します。\n` +
        "同じ参照商品がある場合は更新し、ない場合は末尾に追加します。\n" +
        "Topカードは公開状態で保存します。"
    );
    if (!confirmed) return;

    setSyncingTopCard(true);
    setTopCardStatus(null);
    setJsonError("");

    try {
      const response = await fetch(SLIDE_LINKS_API, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "スライドリンク集カードを読み込めませんでした。");

      const currentSlideLinks = Array.isArray(payload.slideLinks) ? payload.slideLinks : [];
      const existingIndex = currentSlideLinks.findIndex((link) => link.sourceProductSlug === selectedProduct.slug);
      const existingLink = existingIndex >= 0 ? currentSlideLinks[existingIndex] : null;
      const nextLink = buildSlideLinkFromProduct(selectedProduct, currentSlideLinks, existingLink);
      const nextSlideLinks =
        existingIndex >= 0
          ? currentSlideLinks.map((link, index) => (index === existingIndex ? nextLink : link))
          : [...currentSlideLinks, nextLink];

      const saveResponse = await fetch(SLIDE_LINKS_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideLinks: nextSlideLinks })
      });
      const savePayload = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(savePayload.error || "Topカードの保存に失敗しました。");

      setTopCardStatus({
        ok: true,
        message: existingLink ? "Topカードを更新しました。" : "Topカードを作成しました。"
      });
    } catch (error) {
      setTopCardStatus({ ok: false, message: error.message });
    } finally {
      setSyncingTopCard(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page} data-no-translate>
        <p>商品データを読み込んでいます...</p>
      </main>
    );
  }

  if (!selectedProduct) {
    return (
      <main className={styles.page} data-no-translate>
        <h1>商品管理</h1>
        <button className={styles.primaryButton} type="button" onClick={addProduct}>
          商品を追加
        </button>
      </main>
    );
  }

  return (
    <main className={styles.page} data-admin-products data-no-translate>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>ローカル管理</p>
          <h1>商品管理</h1>
          <p>products.json と英語商品データをローカルで編集します。</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={validateDraft}>
            商品データを確認
          </button>
          <Link className={styles.secondaryButton} href="/admin">
            Adminへ戻る
          </Link>
          <button className={styles.primaryButton} type="button" onClick={saveDraft} disabled={isSaving}>
            {isSaving ? "保存中..." : "確認して保存"}
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
            <strong>{products.length} 商品</strong>
            <button className={styles.smallButton} type="button" onClick={addProduct}>
              新規追加
            </button>
          </div>
          <section className={styles.quickCreatePanel}>
            <strong>既存商品から複製して作成</strong>
            <p>似ている商品を選んで複製すると、カテゴリ、タグ、本文、英語欄、画像構成を流用できます。</p>
            <button className={styles.secondaryButton} type="button" onClick={duplicateSelectedProduct}>
              選択中の商品を複製
            </button>
          </section>
          <div className={styles.productList}>
            {products
              .slice()
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((product) => (
                <button
                  className={`${styles.productItem}${product.slug === selectedProduct.slug ? ` ${styles.isSelected}` : ""}`}
                  type="button"
                  key={product.slug}
                  onClick={() => {
                    setSelectedSlug(product.slug);
                    setWizardStep(0);
                  }}
                >
                  <span>{product.title || product.slug}</span>
                  <small>{product.published ? "公開" : "下書き"} / {product.slug}</small>
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
              <strong>下書きURL</strong>
              <code>/products/{selectedProduct.slug}</code>
              <span>公開OFFの間は公開側では 404 が正常です。商品一覧と sitemap にも表示されません。</span>
            </div>
          ) : null}

          {duplicateNoticeSlug === selectedProduct.slug ? (
            <div className={styles.duplicateNotice} role="alert">
              <strong>複製後の確認</strong>
              <span>複製後は slug / タイトル / 画像を変更してください。</span>
            </div>
          ) : null}

          <WizardControls
            activeStepId={activeWizardStepId}
            isWizardMode={isWizardMode}
            onModeChange={setEditorMode}
            onNext={() => setWizardStep(wizardStepIndex + 1)}
            onPrev={() => setWizardStep(wizardStepIndex - 1)}
            onStepChange={(stepIndex) => setWizardStep(stepIndex)}
            stepIndex={wizardStepIndex}
            steps={wizardStepStatuses}
          />

          <div className={getWizardPanelClass("basic")}>
          <div className={styles.gridTwo}>
            <Field label="タイトル">
              <input value={selectedProduct.title || ""} onChange={(event) => handleTitleChange(event.target.value)} />
              {!selectedProduct.published ? (
                <small className={styles.fieldHint}>新規/下書き商品はタイトルからslugと画像パス候補を自動更新します。</small>
              ) : null}
            </Field>
            <Field label="商品ID">
              <div className={styles.inlineControl}>
                <input value={selectedProduct.slug || ""} onChange={(event) => updateSlug(event.target.value)} />
                <button type="button" onClick={generateSlugFromTitle}>生成</button>
              </div>
              <small className={styles.fieldHint}>URLや画像フォルダ名に使います。半角英数字とハイフンで管理してください。</small>
              <small className={styles.fieldHint}>現在の画像候補: {productImageDir(selectedProduct)}cover.webp</small>
            </Field>
            <Field label="表示順">
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
          </div>

          <div className={getWizardPanelClass("description")}>
          <Field label="説明 / SEO説明">
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
          </div>

          <div className={getWizardPanelClass("basic")}>
          <div className={styles.gridTwo}>
            <Field label="通常タグ（カンマ区切り）">
              <input value={joinList(selectedProduct.tags)} onChange={(event) => updateSelected({ tags: splitList(event.target.value) })} />
            </Field>
            <Field label="通常タグ表示名（カンマ区切り）">
              <input value={joinList(selectedProduct.tagLabels)} onChange={(event) => updateSelected({ tagLabels: splitList(event.target.value) })} />
            </Field>
            <Field label="サブタグ（カンマ区切り）">
              <input value={joinList(selectedProduct.subtags)} onChange={(event) => updateSelected({ subtags: splitList(event.target.value) })} />
            </Field>
            <Field label="サブタグ表示名（カンマ区切り）">
              <input value={joinList(selectedProduct.subtagLabels)} onChange={(event) => updateSelected({ subtagLabels: splitList(event.target.value) })} />
            </Field>
            <Field label="関連商品">
              <input value={joinList(selectedProduct.relatedIds)} onChange={(event) => updateSelected({ relatedIds: splitList(event.target.value) })} />
              <small className={styles.fieldHint}>商品詳細ページ下部に表示する関連商品のIDを指定します。複数ある場合はカンマで区切ります。</small>
            </Field>
            <Field label="要約タグ（カンマ区切り）">
              <input value={joinList(selectedProduct.summaryTags)} onChange={(event) => updateSelected({ summaryTags: splitList(event.target.value) })} />
            </Field>
            <Field label="対応アバター一覧">
              <input value={joinList(selectedProduct.avatars)} onChange={(event) => updateSelected({ avatars: splitList(event.target.value) })} />
              <small className={styles.fieldHint}>この商品が対応しているアバター名を入力します。複数ある場合はカンマで区切ります。</small>
            </Field>
            <Field label="人気順スコア">
              <input
                type="number"
                value={selectedProduct.likes ?? 0}
                onChange={(event) => updateSelected({ likes: Number(event.target.value) })}
              />
              <small className={styles.fieldHint}>商品一覧を人気順に並べる時の目安です。数値が大きいほど上位に表示されやすくなります。</small>
            </Field>
          </div>

          <section className={styles.assistPanel}>
            <div className={styles.assistHeader}>
              <div>
                <span>入力補助</span>
                <strong>候補から追加</strong>
                <small>既存商品から関連商品、タグ、対応アバターを検索して追加できます。</small>
              </div>
            </div>
            <div className={styles.assistGrid}>
              <SuggestionGroup
                title="関連商品候補"
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
          </div>

          <div className={getWizardPanelClass("images")}>
          <div className={styles.gridTwo}>
            <Field label="カバー画像">
              <AdminFilePathInput
                value={selectedProduct.coverImage || ""}
                onChange={(coverImage) => updateSelected({ coverImage })}
                targetDir={productImageDir(selectedProduct)}
                placeholder="/products/example/cover.webp"
              />
            </Field>
            <Field label="画像説明文">
              <input value={selectedProduct.coverAlt || ""} onChange={(event) => updateSelected({ coverAlt: event.target.value })} />
              <small className={styles.fieldHint}>画像が表示できない時やアクセシビリティ用に使う短い説明文です。</small>
            </Field>
            <Field label="カバー画像の幅">
              <input type="number" value={selectedProduct.coverWidth ?? 600} onChange={(event) => updateSelected({ coverWidth: Number(event.target.value) })} />
            </Field>
            <Field label="カバー画像の高さ">
              <input type="number" value={selectedProduct.coverHeight ?? 600} onChange={(event) => updateSelected({ coverHeight: Number(event.target.value) })} />
            </Field>
          </div>

          <section className={styles.imagePanel}>
            <div className={styles.imageGuide}>
              <div>
                <span>画像配置先</span>
                <strong>public{productImageDir(selectedProduct)}</strong>
                <small>入力欄では `{productImageDir(selectedProduct)}...` の形式で指定します。</small>
              </div>
              <button className={styles.smallButton} type="button" onClick={applyCoverCandidate}>
                cover.webp候補
              </button>
            </div>

            <div
              className={`${styles.batchImageDropzone}${isBatchDragging ? ` ${styles.isDragging}` : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                if (!isBatchUploading) setBatchDragging(true);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setBatchDragging(false);
              }}
              onDrop={handleBatchImageDrop}
            >
              <div>
                <span>複数画像D&amp;D</span>
                <strong>まとめてcover/galleryへ反映</strong>
                <small>
                  cover.webp はcoverImageに優先反映。先頭画像はcover候補、残りはgallery候補、*-thumb.webp は同名画像のthumbに割り当てます。
                </small>
              </div>
              <div className={styles.batchImageActions}>
                <button className={styles.secondaryButton} type="button" onClick={openBatchImagePicker} disabled={isBatchUploading}>
                  画像をまとめて選択
                </button>
                <input
                  ref={batchImageInputRef}
                  className={styles.hiddenFileInput}
                  type="file"
                  accept=".webp,.png,.jpg,.jpeg,image/webp,image/png,image/jpeg"
                  multiple
                  onChange={handleBatchImageInputChange}
                />
              </div>
            </div>

            {batchImageStatus ? (
              <div className={`${styles.batchImageStatus}${batchImageStatus.ok ? "" : ` ${styles.hasBatchError}`}`} aria-live="polite">
                <strong>{isBatchUploading ? "保存中..." : batchImageStatus.message}</strong>
                {batchImageStatus.details?.length ? (
                  <ul>
                    {batchImageStatus.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <div className={styles.coverPreviewGrid}>
              <ImagePreview
                label="cover.webp"
                path={selectedProduct.coverImage || ""}
                check={imageChecks[selectedProduct.coverImage || ""]}
                revision={imagePreviewRevision}
              />
              <div className={styles.imageWarnings}>
                <strong>画像チェック</strong>
                <ImageWarningList entries={selectedImageEntries} checks={imageChecks} />
              </div>
            </div>

            <div className={styles.galleryHeader}>
              <div>
                <span>商品画像一覧</span>
                <strong>商品画像</strong>
                <small>並び替え、追加、削除、サムネイル候補入力ができます。</small>
              </div>
              <div className={styles.inlineActions}>
                <button className={styles.smallButton} type="button" onClick={regenerateGalleryCandidates}>
                  連番候補を再生成
                </button>
                <button className={styles.smallButton} type="button" onClick={addGalleryImage}>
                  商品画像を追加
                </button>
              </div>
            </div>

            {galleryState.error ? (
              <p className={styles.warningText}>商品画像一覧JSON を修正してください: {galleryState.error}</p>
            ) : null}

            <div className={styles.galleryEditorList}>
              {galleryItems.map((image, index) => (
                <div className={styles.galleryEditorItem} key={`${image.src || "gallery"}-${index}`}>
                  <ImagePreview
                    label={`商品画像 ${index + 1}`}
                    path={image.src || ""}
                    check={imageChecks[image.src || ""]}
                    revision={imagePreviewRevision}
                  />
                  <div className={styles.galleryEditorFields}>
                    <label>
                      <span>画像パス</span>
                      <AdminFilePathInput
                        value={image.src || ""}
                        onChange={(src) => updateGallerySrc(index, src)}
                        targetDir={productImageDir(selectedProduct)}
                        placeholder={`${productImageDir(selectedProduct)}${selectedProduct.slug || "product"}-${String(index + 1).padStart(2, "0")}.webp`}
                      />
                    </label>
                    <label>
                      <span>サムネイル</span>
                      <AdminFilePathInput
                        value={image.thumb || ""}
                        onChange={(thumb) => updateGalleryItem(index, { thumb })}
                        targetDir={productImageDir(selectedProduct)}
                        placeholder={thumbCandidate(image.src || "") || `${productImageDir(selectedProduct)}${selectedProduct.slug || "product"}-${String(index + 1).padStart(2, "0")}-thumb.webp`}
                      />
                    </label>
                    <label>
                      <span>画像の説明</span>
                      <input value={image.alt || ""} onChange={(event) => updateGalleryItem(index, { alt: event.target.value })} />
                    </label>
                    <div className={styles.galleryMetaFields}>
                      <label>
                        <span>幅</span>
                        <input
                          type="number"
                          value={image.width ?? 1000}
                          onChange={(event) => updateGalleryItem(index, { width: Number(event.target.value) })}
                        />
                      </label>
                      <label>
                        <span>高さ</span>
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
                      サムネイル候補
                    </button>
                    <button type="button" onClick={() => removeGalleryImage(index)}>
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Field label="商品画像一覧JSON">
            <textarea
              className={styles.codeArea}
              value={galleryText}
              onChange={(event) => {
                setGalleryText(event.target.value);
                markDraftChanged();
              }}
            />
            <small className={styles.fieldHint}>商品画像一覧をJSONで直接調整する管理者向け欄です。通常は上の画像入力欄を使ってください。</small>
          </Field>
          </div>

          <div className={getWizardPanelClass("basic")}>
          <Field label="外部販売URL JSON">
            <textarea
              className={styles.codeArea}
              value={externalLinksText}
              onChange={(event) => {
                setExternalLinksText(event.target.value);
                markDraftChanged();
              }}
            />
          </Field>
          </div>

          <div className={getWizardPanelClass("description")}>
          <Field label="購入前注意文">
            <textarea value={selectedProduct.note || ""} onChange={(event) => updateSelected({ note: event.target.value })} />
          </Field>

          <Field label="本文HTML">
            <textarea className={styles.codeArea} value={selectedProduct.contentHtml || ""} onChange={(event) => updateSelected({ contentHtml: event.target.value })} />
          </Field>
          <SectionChecklist title="本文HTMLの見出し" items={descriptionSectionItems} />
          </div>

          <div className={getWizardPanelClass("english")}>
          <section className={styles.subsection}>
            <h2>英語データ</h2>
            <div className={styles.gridTwo}>
              <Field label="英語タイトル">
                <input value={english?.title || ""} onChange={(event) => updateEnglish({ title: event.target.value })} />
                {!english?.title && englishTitleCandidate ? (
                  <span className={styles.inlineSuggestion}>
                    候補: {englishTitleCandidate}
                    <button type="button" onClick={applyEnglishTitleCandidate}>候補を入れる</button>
                  </span>
                ) : null}
              </Field>
              <Field label="英語ページタイトル">
                <input value={english?.pageTitle || ""} onChange={(event) => updateEnglish({ pageTitle: event.target.value })} />
              </Field>
            </div>
            <Field label="英語説明">
              <textarea value={english?.description || ""} onChange={(event) => updateEnglish({ description: event.target.value })} />
            </Field>
            <Field label="英語要約タグ（カンマ区切り）">
              <input value={joinList(english?.summaryTags)} onChange={(event) => updateEnglish({ summaryTags: splitList(event.target.value) })} />
            </Field>
            <Field label="英語スペックJSON">
              <textarea
                className={styles.codeArea}
                value={specsText}
                onChange={(event) => {
                  setSpecsText(event.target.value);
                  markDraftChanged();
                }}
              />
            </Field>
            <Field label="英語購入前注意文">
              <textarea value={english?.note || ""} onChange={(event) => updateEnglish({ note: event.target.value })} />
            </Field>
            <Field label="英語本文HTML">
              <textarea className={styles.codeArea} value={english?.detailHtml || ""} onChange={(event) => updateEnglish({ detailHtml: event.target.value })} />
            </Field>
          </section>
          </div>

          <div className={getWizardPanelClass("publish")}>
            <PublishChecklist items={publishChecklist} />
            <section className={styles.publishActionPanel}>
              <Field label="公開状態">
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedProduct.published)}
                    onChange={(event) => updatePublished(event.target.checked)}
                  />
                  公開
                </label>
                {publishWarningItems.length ? (
                  <small className={styles.fieldHint}>不足項目が残っています。公開ON時に確認します。</small>
                ) : null}
              </Field>
              <div className={styles.publishActions}>
                <button className={styles.secondaryButton} type="button" onClick={validateDraft}>
                  商品データを確認
                </button>
                <button className={styles.primaryButton} type="button" onClick={saveDraft} disabled={isSaving}>
                  {isSaving ? "保存中..." : "確認して保存"}
                </button>
              </div>
            </section>

            {savedProductSlug === selectedProduct.slug ? (
              <section className={styles.postSavePanel} aria-live="polite">
                <div>
                  <span>保存後の次の作業</span>
                  <strong>{selectedProduct.title || selectedProduct.slug}</strong>
                  <small>公開ページ確認、商品一覧確認、Topカード作成/更新へ進めます。</small>
                </div>
                <div className={styles.postSaveActions}>
                  <Link className={styles.secondaryButton} href={`/products/${selectedProduct.slug}`} target="_blank">
                    公開ページを開く
                  </Link>
                  <Link className={styles.secondaryButton} href="/products" target="_blank">
                    商品一覧を開く
                  </Link>
                  <button className={styles.primaryButton} type="button" onClick={syncTopCardFromProduct} disabled={isSyncingTopCard}>
                    {isSyncingTopCard ? "Topカード保存中..." : "Topカードを作成/更新"}
                  </button>
                  <Link className={styles.secondaryButton} href="/admin/slide-links">
                    Topカード管理を開く
                  </Link>
                </div>
                {topCardStatus ? (
                  <p className={topCardStatus.ok ? styles.successText : styles.errorText}>{topCardStatus.message}</p>
                ) : null}
              </section>
            ) : null}
          </div>
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

function WizardControls({ activeStepId, isWizardMode, onModeChange, onNext, onPrev, onStepChange, stepIndex, steps }) {
  const activeStep = steps.find((step) => step.id === activeStepId) || steps[stepIndex] || steps[0];
  const canGoPrev = stepIndex > 0;
  const canGoNext = stepIndex < steps.length - 1;

  return (
    <section className={styles.wizardBox} aria-label="商品追加ウィザード">
      <div className={styles.wizardHeader}>
        <div>
          <span>商品追加ウィザード</span>
          <strong>
            STEP {stepIndex + 1}: {activeStep?.label || ""}
          </strong>
        </div>
        <div className={styles.modeSwitch} aria-label="編集モード">
          <button
            className={isWizardMode ? styles.isActive : ""}
            type="button"
            onClick={() => onModeChange("wizard")}
            aria-pressed={isWizardMode}
          >
            ウィザード
          </button>
          <button
            className={!isWizardMode ? styles.isActive : ""}
            type="button"
            onClick={() => onModeChange("all")}
            aria-pressed={!isWizardMode}
          >
            全項目表示
          </button>
        </div>
      </div>

      <div className={styles.wizardSteps}>
        {steps.map((step, index) => (
          <button
            className={`${styles.wizardStepButton}${step.id === activeStepId ? ` ${styles.isActive}` : ""}${
              step.missingItems.length ? "" : ` ${styles.isComplete}`
            }`}
            type="button"
            key={step.id}
            onClick={() => onStepChange(index)}
          >
            <span>STEP {index + 1}</span>
            <strong>{step.label}</strong>
            <small>
              {step.readyCount} / {step.items.length} 完了
            </small>
            {step.missingItems.length ? <em>未入力 {step.missingItems.length}</em> : <em>OK</em>}
          </button>
        ))}
      </div>

      {isWizardMode ? (
        <div className={styles.wizardMissingPanel} aria-live="polite">
          <strong>{activeStep?.missingItems.length ? "このSTEPの未入力" : "このSTEPは入力済み"}</strong>
          {activeStep?.missingItems.length ? (
            <ul>
              {activeStep.missingItems.map((item) => (
                <li key={item.key}>{item.label}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {isWizardMode ? (
        <div className={styles.wizardNavigation}>
          <button className={styles.secondaryButton} type="button" onClick={onPrev} disabled={!canGoPrev}>
            戻る
          </button>
          <button className={styles.primaryButton} type="button" onClick={onNext} disabled={!canGoNext}>
            次へ
          </button>
        </div>
      ) : null}
    </section>
  );
}

function SectionChecklist({ items, title }) {
  return (
    <section className={styles.sectionChecklist} aria-label={title}>
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li className={item.ready ? styles.isReady : ""} key={item.label}>
            <span aria-hidden="true">{item.ready ? "OK" : "未"}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PublishChecklist({ items }) {
  const readyCount = items.filter((item) => item.ready).length;

  return (
    <section className={styles.publishChecklist} aria-label="公開準備チェックリスト">
      <header>
        <div>
          <span>公開準備チェックリスト</span>
          <strong>
            {readyCount} / {items.length} 完了
          </strong>
        </div>
        <small>商品を公開してTopカードへつなぐ前に確認する項目です。</small>
      </header>
      <ul>
        {items.map((item) => (
          <li className={item.ready ? styles.isReady : ""} key={item.label}>
            <span aria-hidden="true">{item.ready ? "OK" : "未"}</span>
            <div>
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </div>
          </li>
        ))}
      </ul>
    </section>
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
        <small>{selectedValues.length ? `選択中: ${selectedValues.length}件` : "未選択"}</small>
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
      <strong>{validation.ok ? "検証OK" : "検証エラー"}</strong>
      {validation.counts ? (
        <p>
          商品: {validation.counts.products} / 公開: {validation.counts.published} / 画像: {validation.counts.images} / リンク: {validation.counts.links}
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

function ImagePreview({ check, label, path, revision = 0 }) {
  const status = check || (path ? { state: "checking", message: "確認中..." } : { state: "missing", message: "パス未入力" });
  const isOk = status.ok;
  const previewSrc = isOk && path && revision ? `${path}${path.includes("?") ? "&" : "?"}adminPreview=${revision}` : path;

  return (
    <figure className={`${styles.imagePreview}${isOk ? "" : ` ${styles.hasImageWarning}`}`}>
      <div className={styles.imagePreviewFrame}>
        {isOk && path ? <img src={previewSrc} alt={label} loading="lazy" /> : <span>{label}</span>}
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
