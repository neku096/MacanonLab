"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    const title = document.title;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className="share-button"
      type="button"
      onClick={handleShare}
      aria-label={copied ? "URLをコピーしました" : "このページを共有"}
      title={copied ? "URLをコピーしました" : "このページを共有"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .13.88L8.91 8.42a3 3 0 1 0 0 7.16l6.22 3.54A3 3 0 1 0 16 17.4l-6.22-3.54a3.06 3.06 0 0 0 0-3.72L16 6.6A3 3 0 0 0 18 8Z" />
      </svg>
      <span>{copied ? "コピー済み" : "共有"}</span>
    </button>
  );
}
