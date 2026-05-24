"use client";

import { useState } from "react";

const filters = [
  { value: "all", label: "すべて" },
  { value: "tips", label: "Tips" },
  { value: "review-product", label: "レビュー/紹介" },
  { value: "worklog", label: "制作メモ" }
];

export default function BlogFilterPanel() {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <>
      <div className="blog-filter-panel" data-blog-filter>
        <div className="blog-filter-tabs" role="group" aria-label="ブログタグ絞り込み">
          {filters.map((filter) => {
            const active = activeFilter === filter.value;
            return (
              <button
                className={`booth-filter-button${active ? " is-active" : ""}`}
                type="button"
                data-blog-filter-button={filter.value}
                aria-pressed={active ? "true" : "false"}
                onClick={() => setActiveFilter(filter.value)}
                key={filter.value}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
        <span className="booth-filter-status" data-blog-filter-status aria-live="polite">
          0件
        </span>
      </div>
      <div
        className="tips-column-layout tips-list-only"
        data-tips-list
        data-page-size="5"
        data-empty-message="該当するブログ記事はまだありません。"
      >
        <div className="tips-list-column" aria-label="ブログ記事一覧">
          <p className="empty-note" data-tips-empty>
            ブログ記事はまだありません。公開後はタグごとに絞り込みできます。
          </p>
        </div>
      </div>
      <div className="tips-pagination booth-pagination" data-tips-pagination aria-label="ブログページ切り替え">
        <button className="tips-page-arrow booth-page-button" type="button" data-tips-prev aria-label="前のブログページ" disabled>
          前へ
        </button>
        <span className="tips-page-status booth-page-status" data-tips-status aria-live="polite">
          1 / 1
        </span>
        <button className="tips-page-arrow booth-page-button" type="button" data-tips-next aria-label="次のブログページ" disabled>
          次へ
        </button>
      </div>
    </>
  );
}
