"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import HomeProductSlider from "./HomeProductSlider";
import styles from "./AdminProductsClient.module.css";

const API_BASE = "/api/admin/slide-links";

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

function uniqueId(base, slideLinks, currentId = "") {
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

function nextSortOrder(slideLinks) {
  return Math.max(-1, ...slideLinks.map((link) => (Number.isFinite(link.sortOrder) ? link.sortOrder : 0))) + 1;
}

function normalizeSortOrder(slideLinks) {
  return slideLinks.map((link, index) => ({ ...link, sortOrder: index }));
}

function orderSignature(slideLinks) {
  return slideLinks.map((link) => `${link.id}:${link.sortOrder}`).join("|");
}

function slideLinkFromProduct(product, slideLinks, sortOrder = nextSortOrder(slideLinks)) {
  return {
    id: uniqueId(product.slug || product.title, slideLinks),
    title: product.title || product.slug,
    description: product.description || "",
    url: product.salesUrls?.booth || `/products/${product.slug}`,
    thumbnail: product.coverImage || "",
    category: product.categoryLabel || product.category || "",
    tags: Array.isArray(product.tags) ? product.tags : [],
    sortOrder,
    published: Boolean(product.published),
    openInNewTab: Boolean(product.salesUrls?.booth),
    sourceProductSlug: product.slug
  };
}

function createSlideLink(slideLinks) {
  const id = uniqueId("slide-link", slideLinks);
  return {
    id,
    title: "New Slide Link",
    description: "",
    url: "",
    thumbnail: "",
    category: "",
    tags: [],
    sortOrder: nextSortOrder(slideLinks),
    published: false,
    openInNewTab: true
  };
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function AdminSlideLinksClient() {
  const [slideLinks, setSlideLinks] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [draggingId, setDraggingId] = useState("");
  const [savedOrderSignature, setSavedOrderSignature] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validation, setValidation] = useState(null);
  const dragStateRef = useRef({ id: "", pointerId: null });

  const sortedSlideLinks = useMemo(
    () => [...slideLinks].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [slideLinks]
  );
  const selectedLink = useMemo(
    () => slideLinks.find((link) => link.id === selectedId) || sortedSlideLinks[0] || null,
    [selectedId, slideLinks, sortedSlideLinks]
  );
  const selectedProduct = useMemo(
    () => products.find((product) => product.slug === selectedLink?.sourceProductSlug) || null,
    [products, selectedLink?.sourceProductSlug]
  );
  const publishedProducts = useMemo(() => products.filter((product) => product.published), [products]);
  const hasOrderChanges = useMemo(
    () => Boolean(savedOrderSignature) && orderSignature(sortedSlideLinks) !== savedOrderSignature,
    [savedOrderSignature, sortedSlideLinks]
  );
  const previewItems = useMemo(
    () => sortedSlideLinks.filter((link) => link.published),
    [sortedSlideLinks]
  );
  const previewSignature = useMemo(
    () => previewItems.map((link) => `${link.id}:${link.sortOrder}:${link.published}`).join("|"),
    [previewItems]
  );

  useEffect(() => {
    let ignore = false;

    async function loadSlideLinks() {
      try {
        const response = await fetch(API_BASE);
        const payload = await parseJsonResponse(response);
        if (!response.ok) throw new Error(payload.error || "スライドリンク集カードを読み込めませんでした。");
        if (ignore) return;
        const nextSlideLinks = Array.isArray(payload.slideLinks) ? payload.slideLinks : [];
        setProducts(Array.isArray(payload.products) ? payload.products : []);
        setSlideLinks(nextSlideLinks);
        setSavedOrderSignature(orderSignature([...nextSlideLinks].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))));
        setSelectedId(nextSlideLinks[0]?.id || "");
      } catch (loadError) {
        if (!ignore) setError(loadError.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSlideLinks();
    return () => {
      ignore = true;
    };
  }, []);

  function updateSelected(patch) {
    if (!selectedLink) return;
    setSlideLinks((current) =>
      current.map((link) => (link.id === selectedLink.id ? { ...link, ...patch } : link))
    );
    setValidation(null);
    setError("");
  }

  function reorderSlideLinks(activeId, targetId) {
    if (!activeId || !targetId || activeId === targetId) return;
    setSlideLinks((current) => {
      const ordered = [...current].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
      const activeIndex = ordered.findIndex((link) => link.id === activeId);
      const targetIndex = ordered.findIndex((link) => link.id === targetId);
      if (activeIndex < 0 || targetIndex < 0 || activeIndex === targetIndex) return current;
      const [activeLink] = ordered.splice(activeIndex, 1);
      ordered.splice(targetIndex, 0, activeLink);
      return normalizeSortOrder(ordered);
    });
    setSelectedId(activeId);
    setValidation(null);
    setError("");
  }

  function moveSlideLink(id, direction) {
    const ordered = sortedSlideLinks;
    const currentIndex = ordered.findIndex((link) => link.id === id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;
    reorderSlideLinks(id, ordered[nextIndex].id);
    setMessage("順番を変更しました。保存するとTopスライダーに反映されます。");
  }

  function startDrag(event, id) {
    dragStateRef.current = { id, pointerId: event.pointerId };
    setDraggingId(id);
    setSelectedId(id);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveDrag(event) {
    const activeId = dragStateRef.current.id;
    if (!activeId) return;
    const target = document
      .elementsFromPoint(event.clientX, event.clientY)
      .find((element) => element instanceof HTMLElement && element.dataset.slideId);
    const targetId = target?.dataset.slideId;
    if (targetId) reorderSlideLinks(activeId, targetId);
    event.preventDefault();
  }

  function stopDrag(event) {
    if (!dragStateRef.current.id) return;
    if (event.currentTarget.hasPointerCapture(dragStateRef.current.pointerId)) {
      event.currentTarget.releasePointerCapture(dragStateRef.current.pointerId);
    }
    dragStateRef.current = { id: "", pointerId: null };
    setDraggingId("");
    setMessage("順番を変更しました。保存するとTopスライダーに反映されます。");
  }

  function addSlideLink() {
    const nextLink = createSlideLink(slideLinks);
    setSlideLinks(normalizeSortOrder([...sortedSlideLinks, nextLink]));
    setSelectedId(nextLink.id);
    setValidation(null);
    setError("");
    setMessage("スライドリンク集カードを追加しました。保存前にURLとthumbnailを入力してください。");
  }

  function addProductSlideLink(product) {
    const nextLink = slideLinkFromProduct(product, slideLinks);
    setSlideLinks(normalizeSortOrder([...sortedSlideLinks, nextLink]));
    setSelectedId(nextLink.id);
    setValidation(null);
    setError("");
    setMessage(`${product.title || product.slug} からTopスライダー用カードを追加しました。`);
  }

  function deleteSelectedLink() {
    if (!selectedLink) return;
    const nextSlideLinks = slideLinks.filter((link) => link.id !== selectedLink.id);
    setSlideLinks(nextSlideLinks);
    setSelectedId(nextSlideLinks[0]?.id || "");
    setValidation(null);
    setError("");
    setMessage(`${selectedLink.title || selectedLink.id} を削除しました。保存すると data/slide-links.json に反映されます。`);
  }

  async function requestValidation(draft) {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    const payload = await parseJsonResponse(response);
    setValidation(payload.validation || null);
    if (!response.ok) throw new Error(payload.error || "validate:slide-links でエラーがありました。");
    return payload.validation;
  }

  async function validateDraft() {
    setMessage("");
    setError("");
    try {
      await requestValidation({ slideLinks });
      setMessage("validate:slide-links 相当の検証に成功しました。");
    } catch (validateError) {
      setError(validateError.message);
    }
  }

  async function saveDraft() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const draft = { slideLinks };
      await requestValidation(draft);
      const response = await fetch(API_BASE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      const payload = await parseJsonResponse(response);
      setValidation(payload.validation || null);
      if (!response.ok) throw new Error(payload.error || "保存に失敗しました。");
      setSavedOrderSignature(orderSignature(sortedSlideLinks));
      setMessage("data/slide-links.json を保存しました。");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  function applyProductDefaults(product = selectedProduct) {
    if (!selectedLink || !product) return;
    updateSelected({
      title: product.title || selectedLink.title,
      description: product.description || selectedLink.description,
      url: product.salesUrls?.booth || selectedLink.url || `/products/${product.slug}`,
      thumbnail: product.coverImage || selectedLink.thumbnail,
      category: product.categoryLabel || product.category || selectedLink.category,
      tags: Array.isArray(product.tags) ? product.tags : selectedLink.tags || [],
      openInNewTab: Boolean(product.salesUrls?.booth) || selectedLink.openInNewTab,
      sourceProductSlug: product.slug
    });
  }

  function applyProductThumbnail(product = selectedProduct) {
    if (!product?.coverImage) return;
    updateSelected({ thumbnail: product.coverImage, sourceProductSlug: product.slug });
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p>スライドリンク集カードを読み込んでいます...</p>
      </main>
    );
  }

  if (!selectedLink) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Local Admin</p>
            <h1>Top商品スライダー管理</h1>
            <p>data/slide-links.json でTopページの商品リンクスライダーを管理します。</p>
          </div>
          <div className={styles.actions}>
            <Link className={styles.secondaryButton} href="/admin">
              Adminへ戻る
            </Link>
            <button className={styles.primaryButton} type="button" onClick={addSlideLink}>
              追加
            </button>
          </div>
        </header>
        {(message || error || validation) && (
          <section className={styles.statusPanel} aria-live="polite">
            {message ? <p className={styles.successText}>{message}</p> : null}
            {error ? <p className={styles.errorText}>{error}</p> : null}
            {validation ? <ValidationResult validation={validation} /> : null}
          </section>
        )}
      </main>
    );
  }

  return (
    <main className={styles.page} data-admin-slide-links>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Local Admin</p>
          <h1>Top商品スライダー管理</h1>
          <p>Topページの商品リンクスライダー用カードをローカルJSONへ保存します。</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondaryButton} href="/admin">
            Adminへ戻る
          </Link>
          <button className={styles.secondaryButton} type="button" onClick={validateDraft}>
            validate:slide-links
          </button>
          <button className={styles.primaryButton} type="button" onClick={saveDraft} disabled={isSaving}>
            {isSaving ? "保存中..." : "検証して保存"}
          </button>
        </div>
      </header>

      {(message || error || validation) && (
        <section className={styles.statusPanel} aria-live="polite">
          {message ? <p className={styles.successText}>{message}</p> : null}
          {error ? <p className={styles.errorText}>{error}</p> : null}
          {validation ? <ValidationResult validation={validation} /> : null}
        </section>
      )}

      {hasOrderChanges ? (
        <section className={styles.orderNotice} aria-live="polite">
          <strong>順番変更あり</strong>
          <span>保存すると、この並び順がTopの商品スライダーに反映されます。</span>
        </section>
      ) : null}

      <section className={styles.sliderPreviewPanel} aria-label="Topスライダープレビュー">
        <header className={styles.sliderPreviewHeader}>
          <div>
            <span>Preview</span>
            <strong>Topスライダー表示</strong>
            <small>保存前のstateから published:true のカードだけを表示します。</small>
          </div>
          <small>{previewItems.length} published cards</small>
        </header>
        {previewItems.length ? (
          <div className={styles.sliderPreviewGrid}>
            <div className={styles.sliderPreviewFrame}>
              <span className={styles.previewLabel}>PC</span>
              <HomeProductSlider items={previewItems} key={`desktop-${previewSignature}`} />
            </div>
            <div className={`${styles.sliderPreviewFrame} ${styles.mobileSliderPreview}`}>
              <span className={styles.previewLabel}>Mobile</span>
              <HomeProductSlider items={previewItems} key={`mobile-${previewSignature}`} />
            </div>
          </div>
        ) : (
          <p className={styles.fieldHint}>published:true のカードがないため、Topスライダーには表示されません。</p>
        )}
      </section>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <strong>{slideLinks.length} cards</strong>
            <button className={styles.smallButton} type="button" onClick={addSlideLink}>
              追加
            </button>
          </div>
          <p className={styles.fieldHint}>左のハンドルをドラッグ、または上下ボタンでTop表示順を調整できます。</p>
          <div className={`${styles.productList} ${styles.sortableList}`}>
            {sortedSlideLinks.map((link, index) => (
              <div
                className={`${styles.sortableItem}${link.id === selectedLink.id ? ` ${styles.isSelected}` : ""}${!link.published ? ` ${styles.isDraft}` : ""}${draggingId === link.id ? ` ${styles.isDragging}` : ""}`}
                data-slide-id={link.id}
                key={link.id}
              >
                <button
                  className={styles.dragHandle}
                  type="button"
                  aria-label={`${link.title || link.id} をドラッグして並び替え`}
                  onPointerDown={(event) => startDrag(event, link.id)}
                  onPointerMove={moveDrag}
                  onPointerUp={stopDrag}
                  onPointerCancel={stopDrag}
                >
                  <span aria-hidden="true">≡</span>
                </button>
                <button
                  className={styles.sortableSelect}
                  type="button"
                  onClick={() => setSelectedId(link.id)}
                >
                  <span>{index + 1}. {link.title || link.id}</span>
                  <small>
                    {link.published ? "published" : "draft"} / {link.category || "no category"}
                  </small>
                </button>
                <div className={styles.sortActions} aria-label={`${link.title || link.id} の並び替え`}>
                  <button type="button" onClick={() => moveSlideLink(link.id, -1)} disabled={index === 0} aria-label="上へ移動">
                    ↑
                  </button>
                  <button type="button" onClick={() => moveSlideLink(link.id, 1)} disabled={index === sortedSlideLinks.length - 1} aria-label="下へ移動">
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.sidebarHeader}>
            <strong>商品から追加</strong>
          </div>
          <div className={styles.productList}>
            {publishedProducts
              .filter((product) => !slideLinks.some((link) => link.sourceProductSlug === product.slug))
              .slice(0, 12)
              .map((product) => (
                <button
                  className={styles.productItem}
                  type="button"
                  key={product.slug}
                  onClick={() => addProductSlideLink(product)}
                >
                  <span>{product.title || product.slug}</span>
                  <small>{product.slug}</small>
                </button>
              ))}
            {publishedProducts.every((product) => slideLinks.some((link) => link.sourceProductSlug === product.slug)) ? (
              <p className={styles.fieldHint}>追加できる未登録商品はありません。</p>
            ) : null}
          </div>
        </aside>

        <section className={styles.editor}>
          <div className={styles.editorHeader}>
            <div>
              <span>選択中</span>
              <strong>{selectedLink.title || selectedLink.id}</strong>
              <small>{selectedLink.id}</small>
            </div>
            <button className={styles.dangerButton} type="button" onClick={deleteSelectedLink}>
              削除
            </button>
          </div>

          {!selectedLink.published ? (
            <div className={styles.draftNotice}>
              <strong>Draft</strong>
              <span>published:false のカードは公開側で利用しない前提のデータです。</span>
            </div>
          ) : null}

          <div className={styles.gridTwo}>
            <Field label="title">
              <input value={selectedLink.title || ""} onChange={(event) => updateSelected({ title: event.target.value })} />
            </Field>
            <Field label="category">
              <input value={selectedLink.category || ""} onChange={(event) => updateSelected({ category: event.target.value })} />
            </Field>
            <Field label="sourceProductSlug">
              <select
                value={selectedLink.sourceProductSlug || ""}
                onChange={(event) => {
                  const product = products.find((item) => item.slug === event.target.value);
                  if (product) {
                    applyProductDefaults(product);
                  } else {
                    updateSelected({ sourceProductSlug: "" });
                  }
                }}
              >
                <option value="">なし</option>
                {products.map((product) => (
                  <option value={product.slug} key={product.slug}>
                    {product.title || product.slug}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="url">
              <input value={selectedLink.url || ""} onChange={(event) => updateSelected({ url: event.target.value })} />
              {selectedProduct?.salesUrls?.booth ? (
                <button className={styles.smallButton} type="button" onClick={() => updateSelected({ url: selectedProduct.salesUrls.booth, openInNewTab: true })}>
                  BOOTH URLを入れる
                </button>
              ) : null}
            </Field>
            <Field label="thumbnail">
              <input value={selectedLink.thumbnail || ""} onChange={(event) => updateSelected({ thumbnail: event.target.value })} />
              <small className={styles.fieldHint}>手入力、または sourceProductSlug の商品画像から候補入力できます。外部取得は行いません。</small>
              {selectedProduct?.coverImage ? (
                <button className={styles.smallButton} type="button" onClick={() => applyProductThumbnail()}>
                  商品画像を入れる
                </button>
              ) : null}
            </Field>
            <Field label="sortOrder">
              <input
                type="number"
                value={selectedLink.sortOrder ?? 0}
                onChange={(event) => updateSelected({ sortOrder: Number(event.target.value) })}
              />
            </Field>
            <Field label="published">
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(selectedLink.published)}
                  onChange={(event) => updateSelected({ published: event.target.checked })}
                />
                published
              </label>
            </Field>
            <Field label="openInNewTab">
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(selectedLink.openInNewTab)}
                  onChange={(event) => updateSelected({ openInNewTab: event.target.checked })}
                />
                openInNewTab
              </label>
            </Field>
          </div>

          <Field label="description">
            <textarea value={selectedLink.description || ""} onChange={(event) => updateSelected({ description: event.target.value })} />
          </Field>

          <Field label="tags (, または改行区切り)">
            <input value={joinList(selectedLink.tags)} onChange={(event) => updateSelected({ tags: splitList(event.target.value) })} />
          </Field>
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
      <strong>{validation.ok ? "検証OK" : "検証エラー"}</strong>
      <span>
        Cards: {validation.counts.slideLinks} / Published: {validation.counts.published}
      </span>
      {validation.errors?.length ? (
        <div className={styles.validationGroup}>
          <strong>Errors</strong>
          <ul className={styles.errorList}>
            {validation.errors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {validation.warnings?.length ? (
        <div className={styles.validationGroup}>
          <strong>Warnings</strong>
          <ul className={styles.warningList}>
            {validation.warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
