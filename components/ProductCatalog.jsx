"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getTagLabel } from "@/lib/site";

const PAGE_SIZE = 12;
const ALL = "all";

const SUBTAG_SEARCH_ALIASES = {
  "summon-gimmick": "shark whale capybara summon gimmick 鮫 鯨 カピバラ",
  "character-lumina": "lumina ルミナ",
  "character-shinano": "shinano しなの",
  "character-milltina": "miltina milltina ミルティナ",
  "character-kipfel": "kipfel キプフェル",
  "character-manuka": "manuka マヌカ",
  "character-selestia": "selestia セレスティア",
  "character-shinra": "shinra 森羅",
  "character-chocolat": "chocolat ショコラ",
  "character-milfy": "milfy ミルフィ",
  "character-rurune": "rurune ルルネ",
  "character-sio": "sio shio しお",
  "character-shiratsume": "shiratsume しらつめ",
  "chair-gimmick": "chair gimmick 椅子",
  halo: "halo ヘイロー",
  mask: "mask catmask マスク お面"
};

function normalizeFilter(value) {
  return value && value !== ALL ? value : ALL;
}

function normalizeSearchText(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

export default function ProductCatalog({ products, options, initialFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    tag: normalizeFilter(initialFilters.tag),
    subtag: normalizeFilter(initialFilters.subtag),
    avatar: normalizeFilter(initialFilters.avatar)
  });
  const [sort, setSort] = useState(initialFilters.sort === "popular" ? "popular" : "default");
  const [page, setPage] = useState(1);
  const [isSubtagSearchOpen, setSubtagSearchOpen] = useState(false);
  const [subtagSearch, setSubtagSearch] = useState("");

  const subtagOptions = useMemo(
    () => [ALL, ...options.subtags].map((value) => ({ value, label: value === ALL ? "すべて" : getTagLabel(value) })),
    [options.subtags]
  );

  const searchableSubtags = useMemo(
    () =>
      subtagOptions.map((option) => ({
        ...option,
        searchText: normalizeSearchText(`${option.label} ${option.value} ${SUBTAG_SEARCH_ALIASES[option.value] || ""}`)
      })),
    [subtagOptions]
  );

  const searchResults = useMemo(() => {
    const query = normalizeSearchText(subtagSearch);
    return searchableSubtags.filter((option) => !query || option.searchText.includes(query));
  }, [searchableSubtags, subtagSearch]);

  function updateUrl(nextFilters, nextSort = sort) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["tag", "subtag", "avatar"]) {
      if (nextFilters[key] && nextFilters[key] !== ALL) params.set(key, nextFilters[key]);
      else params.delete(key);
    }
    if (nextSort === "popular") params.set("sort", "popular");
    else params.delete("sort");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function setFilter(name, value) {
    const nextFilters = { ...filters, [name]: value || ALL };
    setFilters(nextFilters);
    setPage(1);
    updateUrl(nextFilters);
  }

  function setSortMode(value) {
    setSort(value);
    setPage(1);
    updateUrl(filters, value);
  }

  function chooseSubtag(value) {
    setSubtagSearchOpen(false);
    setSubtagSearch("");
    setFilter("subtag", value);
  }

  function toggleSubtagSearch() {
    setSubtagSearchOpen((open) => {
      if (open) setSubtagSearch("");
      return !open;
    });
  }

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const tagMatches = filters.tag === ALL || product.tags.includes(filters.tag);
      const subtagMatches = filters.subtag === ALL || product.subtags.includes(filters.subtag);
      const avatarMatches = filters.avatar === ALL || product.subtags.includes(filters.avatar);
      return tagMatches && subtagMatches && avatarMatches;
    });

    return filtered.sort((a, b) => {
      if (sort === "popular") return b.likes - a.likes || a.sortOrder - b.sortOrder;
      return a.sortOrder - b.sortOrder;
    });
  }, [filters, products, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedSubtagLabel = filters.subtag === ALL ? "すべて" : getTagLabel(filters.subtag);

  return (
    <>
      <div className="booth-sort-tabs" role="group" aria-label="BOOTH作品表示順">
        <button
          className={`booth-sort-button${sort === "default" ? " is-active" : ""}`}
          type="button"
          data-booth-sort-button="default"
          onClick={() => setSortMode("default")}
          aria-pressed={sort === "default"}
        >
          通常順
        </button>
        <button
          className={`booth-sort-button${sort === "popular" ? " is-active" : ""}`}
          type="button"
          data-booth-sort-button="popular"
          onClick={() => setSortMode("popular")}
          aria-pressed={sort === "popular"}
        >
          人気順
        </button>
      </div>

      <div className="booth-filter-panel" data-booth-filter data-count-suffix="件" data-page-size={PAGE_SIZE}>
        <p className="booth-filter-heading">通常タグ</p>
        <div className="booth-filter-tabs" role="group" aria-label="BOOTH作品タグ絞り込み">
          <FilterButton active={filters.tag === ALL} value={ALL} onClick={() => setFilter("tag", ALL)}>
            すべて
          </FilterButton>
          {options.tags.map((tag) => (
            <FilterButton key={tag} active={filters.tag === tag} value={tag} onClick={() => setFilter("tag", tag)}>
              {getTagLabel(tag)}
            </FilterButton>
          ))}
        </div>
        <span className="booth-filter-status" data-booth-filter-status aria-live="polite">
          {filteredProducts.length}件
        </span>
      </div>

      <div className="booth-subtag-panel" id="booth-subtags" data-booth-subtag-filter>
        <p className="booth-subtag-heading">サブタグ</p>
        <div className="booth-subtag-mobile-controls">
          <span className="booth-subtag-mobile-label">サブタグ</span>
          <button
            className={`booth-subtag-picker-toggle${filters.subtag !== ALL ? " is-selected" : ""}`}
            type="button"
            data-booth-subtag-toggle
            data-booth-subtag-search-toggle
            data-default-label="すべて"
            aria-expanded={isSubtagSearchOpen}
            aria-controls="booth-subtag-search-popover"
            onClick={toggleSubtagSearch}
          >
            {selectedSubtagLabel}
          </button>
        </div>
        <div className="booth-subtag-picker" id="booth-subtag-options" data-booth-subtag-picker>
          <div className="booth-subtag-tabs" role="group" aria-label="BOOTH作品サブタグ絞り込み">
            {subtagOptions.map((option) => (
              <SubtagButton
                key={option.value}
                active={filters.subtag === option.value}
                value={option.value}
                onClick={() => chooseSubtag(option.value)}
              >
                {option.label}
              </SubtagButton>
            ))}
          </div>
        </div>
        <button
          className="booth-subtag-row-toggle"
          type="button"
          data-booth-subtag-row-toggle
          data-booth-subtag-search-toggle
          data-open-label="サブタグを検索▼"
          data-close-label="サブタグを検索▲"
          data-open-aria-label="サブタグを検索する"
          data-close-aria-label="サブタグ検索を閉じる"
          aria-expanded={isSubtagSearchOpen}
          aria-controls="booth-subtag-search-popover"
          aria-label={isSubtagSearchOpen ? "サブタグ検索を閉じる" : "サブタグを検索する"}
          onClick={toggleSubtagSearch}
        >
          {isSubtagSearchOpen ? "サブタグを検索▲" : "サブタグを検索▼"}
        </button>
        <div
          className={`booth-subtag-search-popover${isSubtagSearchOpen ? " is-open" : ""}`}
          id="booth-subtag-search-popover"
          data-booth-subtag-search-popover
          hidden={!isSubtagSearchOpen}
        >
          <div className="booth-subtag-search-field">
            <span className="booth-subtag-search-icon" aria-hidden="true" />
            <input
              type="text"
              data-booth-subtag-search-input
              placeholder="サブタグで検索..."
              aria-label="サブタグで検索"
              autoComplete="off"
              value={subtagSearch}
              onChange={(event) => setSubtagSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSubtagSearchOpen(false);
                  setSubtagSearch("");
                }
                if (event.key === "Enter" && searchResults[0]) {
                  chooseSubtag(searchResults[0].value);
                }
              }}
            />
            {subtagSearch ? (
              <button
                className="booth-subtag-search-clear"
                type="button"
                data-booth-subtag-search-clear
                aria-label="検索文字列をクリア"
                onClick={() => setSubtagSearch("")}
              >
                ×
              </button>
            ) : null}
          </div>
          <div className="booth-subtag-search-results" data-booth-subtag-search-results role="group" aria-label="検索できるサブタグ">
            {searchResults.map((option) => (
              <SubtagButton
                key={option.value}
                active={filters.subtag === option.value}
                value={option.value}
                className="booth-subtag-search-chip"
                onClick={() => chooseSubtag(option.value)}
              >
                {option.label}
              </SubtagButton>
            ))}
          </div>
          <p className="booth-subtag-search-empty" data-booth-subtag-search-empty hidden={searchResults.length > 0}>
            該当するサブタグがありません
          </p>
        </div>
      </div>

      <div className="booth-list-grid" data-booth-list aria-live="polite">
        {visibleProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={currentPage === 1 && index < 3} />
        ))}
      </div>

      <nav className="booth-pagination" data-booth-pagination aria-label="BOOTH作品ページ切り替え">
        <button
          className="booth-page-button"
          type="button"
          data-booth-page-button="prev"
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          disabled={currentPage <= 1}
        >
          前へ
        </button>
        <span className="booth-page-status" data-booth-page-status aria-live="polite">
          {currentPage} / {totalPages}
        </span>
        <button
          className="booth-page-button"
          type="button"
          data-booth-page-button="next"
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          disabled={currentPage >= totalPages}
        >
          次へ
        </button>
      </nav>
    </>
  );
}

function FilterButton({ active, children, onClick, value }) {
  return (
    <button
      className={`booth-filter-button${active ? " is-active" : ""}`}
      type="button"
      data-booth-filter-button={value}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function SubtagButton({ active, children, className = "", onClick, value }) {
  const classes = `booth-subtag-button${className ? ` ${className}` : ""}${active ? " is-active" : ""}`;

  return (
    <button
      className={classes}
      type="button"
      data-booth-subtag-button={value}
      data-booth-subtag-search-value={value}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
