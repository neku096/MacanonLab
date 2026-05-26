"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validation, setValidation] = useState(null);

  const sortedSlideLinks = useMemo(
    () => [...slideLinks].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)),
    [slideLinks]
  );
  const selectedLink = useMemo(
    () => slideLinks.find((link) => link.id === selectedId) || sortedSlideLinks[0] || null,
    [selectedId, slideLinks, sortedSlideLinks]
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
        setSlideLinks(nextSlideLinks);
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

  function addSlideLink() {
    const nextLink = createSlideLink(slideLinks);
    setSlideLinks((current) => [...current, nextLink]);
    setSelectedId(nextLink.id);
    setValidation(null);
    setError("");
    setMessage("スライドリンク集カードを追加しました。保存前にURLとthumbnailを入力してください。");
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
      setMessage("data/slide-links.json を保存しました。");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
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
            <h1>スライドリンク集カード管理</h1>
            <p>data/slide-links.json を手入力で管理します。</p>
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
          <h1>スライドリンク集カード管理</h1>
          <p>外部取得なしで、リンク集カードの表示情報をローカルJSONへ保存します。</p>
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

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <strong>{slideLinks.length} cards</strong>
            <button className={styles.smallButton} type="button" onClick={addSlideLink}>
              追加
            </button>
          </div>
          <div className={styles.productList}>
            {sortedSlideLinks.map((link) => (
              <button
                className={`${styles.productItem}${link.id === selectedLink.id ? ` ${styles.isSelected}` : ""}`}
                type="button"
                key={link.id}
                onClick={() => setSelectedId(link.id)}
              >
                <span>{link.title || link.id}</span>
                <small>
                  {link.published ? "published" : "draft"} / {link.category || "no category"}
                </small>
              </button>
            ))}
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
            <Field label="url">
              <input value={selectedLink.url || ""} onChange={(event) => updateSelected({ url: event.target.value })} />
            </Field>
            <Field label="thumbnail">
              <input value={selectedLink.thumbnail || ""} onChange={(event) => updateSelected({ thumbnail: event.target.value })} />
              <small className={styles.fieldHint}>手入力のみです。URL先や画像の自動取得は行いません。</small>
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
