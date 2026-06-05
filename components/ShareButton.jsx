"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function getShareData() {
  if (typeof document === "undefined") {
    return { title: "", text: "", url: "" };
  }

  return {
    title: document.title,
    text: document.querySelector('meta[name="description"]')?.content || "",
    url: document.querySelector('link[rel="canonical"]')?.href || window.location.href
  };
}

export default function ShareButton() {
  const [isOpen, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef(null);
  const lastFocusedButtonRef = useRef(null);

  function openShareModal(event) {
    lastFocusedButtonRef.current = event.currentTarget;
    setCopied(false);
    setOpen(true);
  }

  function closeShareModal() {
    const restoreTarget = lastFocusedButtonRef.current;
    const restoreFocus = () => {
      if (restoreTarget?.isConnected) {
        restoreTarget.focus({ preventScroll: true });
      }
    };
    setOpen(false);
    setCopied(false);
    window.requestAnimationFrame(restoreFocus);
    window.setTimeout(restoreFocus, 0);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-share-modal-open", isOpen);

    return () => {
      document.body.classList.remove("is-share-modal-open");
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeShareModal();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = [...document.querySelectorAll(".share-modal button, .share-modal [href], .share-modal input, .share-modal select, .share-modal textarea")]
        .filter((element) => !element.disabled && element.getAttribute("aria-hidden") !== "true");
      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function shareToX() {
    const shareData = getShareData();
    const intent = new URL("https://twitter.com/intent/tweet");
    intent.searchParams.set("text", shareData.title);
    intent.searchParams.set("url", shareData.url);
    window.open(intent.href, "_blank", "noopener,noreferrer");
    closeShareModal();
  }

  function shareToLine() {
    const shareData = getShareData();
    const intent = new URL("https://social-plugins.line.me/lineit/share");
    intent.searchParams.set("url", shareData.url);
    window.open(intent.href, "_blank", "noopener,noreferrer");
    closeShareModal();
  }

  async function copyUrl() {
    const shareData = getShareData();
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const shareData = isOpen ? getShareData() : { title: "", url: "" };
  const modal = (
    <div className="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-modal-title" hidden={!isOpen}>
      <div className="share-backdrop" data-share-close onClick={closeShareModal} />
      <div className="share-panel">
        <button className="share-close" type="button" data-share-close data-share-close-button aria-label="閉じる" onClick={closeShareModal} ref={closeButtonRef}>
          ×
        </button>
        <h2 id="share-modal-title" className="share-title">
          このページを共有
        </h2>
        <div className="share-preview">
          <div className="share-preview-image" aria-hidden="true">
            <img src="/Macanon_Samune/macanon_Logo_transparent.webp" alt="" />
          </div>
          <div className="share-page-card">
            <p className="share-preview-label">リンクプレビュー</p>
            <p className="share-page-title" data-share-title>
              {shareData.title}
            </p>
            <p className="share-page-url" data-share-url>
              {shareData.url}
            </p>
          </div>
        </div>
        <div className="share-options">
          <button className="share-option share-option-copy-button" type="button" data-share-action="copy" onClick={copyUrl}>
            <span className="share-option-icon share-option-copy" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.9-3.9a3 3 0 0 1 4.2 4.2l-3 3a3 3 0 0 1-4.25 0 1 1 0 1 1 1.42-1.42 1 1 0 0 0 1.41 0l3-3a1 1 0 0 0-1.41-1.41L12 13.4a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3.9 3.9a3 3 0 1 1-4.2-4.2l3-3a3 3 0 0 1 4.25 0 1 1 0 0 1-1.42 1.42 1 1 0 0 0-1.41 0l-3 3a1 1 0 1 0 1.41 1.41L12 10.6a1 1 0 0 1 1.4 0Z" />
              </svg>
            </span>
            <span data-copy-label>{copied ? "URLをコピーしました" : "URLをコピー"}</span>
          </button>
          <button className="share-option share-option-social" type="button" data-share-action="x" onClick={shareToX}>
            <span className="share-option-icon share-option-x" aria-hidden="true">
              X
            </span>
            <span>X</span>
          </button>
          <button className="share-option share-option-social" type="button" data-share-action="line" onClick={shareToLine}>
            <span className="share-option-icon share-option-line" aria-hidden="true">
              LINE
            </span>
            <span>LINE</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button className="share-button" type="button" data-share-button aria-label="このページを共有" title="このページを共有" onClick={openShareModal}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .13.88L8.91 8.42a3 3 0 1 0 0 7.16l6.22 3.54A3 3 0 1 0 16 17.4l-6.22-3.54a3.06 3.06 0 0 0 0-3.72L16 6.6A3 3 0 0 0 18 8Z" />
        </svg>
        <span>共有</span>
      </button>
      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
