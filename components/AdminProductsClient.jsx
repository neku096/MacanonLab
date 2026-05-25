"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./AdminProductsClient.module.css";

const API_BASE = "/api/admin/products";

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
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.slug === selectedSlug) || products[0] || null,
    [products, selectedSlug]
  );
  const selectedKey = legacyKey(selectedProduct);
  const english = selectedProduct ? productPageEnglish[selectedKey] || createEnglish(selectedProduct) : null;

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    setGalleryText(JSON.stringify(selectedProduct.gallery || [], null, 2));
    setExternalLinksText(JSON.stringify(selectedProduct.salesUrls?.external || [], null, 2));
    setSpecsText(JSON.stringify(english?.specs || [], null, 2));
    setJsonError("");
  }, [selectedProduct?.slug]);

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

  function updateSlug(nextValue) {
    if (!selectedProduct) return;
    const nextSlug = slugify(nextValue);
    if (!nextSlug) return;

    const oldSlug = selectedProduct.slug;
    const oldKey = legacyKey(selectedProduct);
    const nextKey = `product-${nextSlug}.html`;

    setProducts((current) =>
      current.map((product) =>
        product.slug === oldSlug
          ? {
              ...product,
              id: nextSlug,
              slug: nextSlug,
              legacyPath: `/${nextKey}`
            }
          : product
      )
    );
    setProductPageEnglish((current) => {
      const next = { ...current };
      next[nextKey] = current[oldKey] || createEnglish(selectedProduct);
      if (oldKey !== nextKey) delete next[oldKey];
      return next;
    });
    setSelectedSlug(nextSlug);
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
      coverImage: template.coverImage?.replace("example-product", baseSlug) || `/products/${baseSlug}/cover.webp`,
      gallery: (template.gallery || []).map((image) => ({
        ...image,
        src: image.src?.replace("example-product", baseSlug),
        thumb: image.thumb?.replace("example-product", baseSlug)
      }))
    };

    setProducts((current) => [...current, nextProduct]);
    setProductPageEnglish((current) => ({
      ...current,
      [legacyKey(nextProduct)]: createEnglish(nextProduct)
    }));
    setSelectedSlug(baseSlug);
    setValidation(null);
    setMessage("新規商品を追加しました。保存前に内容と画像パスを確認してください。");
  }

  function generateSlugFromTitle() {
    if (!selectedProduct) return;
    updateSlug(uniqueSlug(english?.title || selectedProduct.title || selectedProduct.slug, products, selectedProduct.slug));
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

  async function validateDraft() {
    setMessage("");
    try {
      const draft = commitJsonTextareas();
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
      setMessage("products.json と legacy-i18n.json を保存しました。");
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
          <div className={styles.gridTwo}>
            <Field label="タイトル">
              <input value={selectedProduct.title || ""} onChange={(event) => updateSelected({ title: event.target.value })} />
            </Field>
            <Field label="slug / id">
              <div className={styles.inlineControl}>
                <input value={selectedProduct.slug || ""} onChange={(event) => updateSlug(event.target.value)} />
                <button type="button" onClick={generateSlugFromTitle}>生成</button>
              </div>
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

function ValidationResult({ validation }) {
  return (
    <div className={styles.validation}>
      <strong>{validation.ok ? "Validation passed" : "Validation failed"}</strong>
      {validation.counts ? (
        <p>
          Products: {validation.counts.products} / Published: {validation.counts.published} / Images: {validation.counts.images} / Links: {validation.counts.links}
        </p>
      ) : null}
      {validation.errors?.length ? (
        <ul className={styles.errorList}>
          {validation.errors.map((error) => <li key={error}>{error}</li>)}
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
