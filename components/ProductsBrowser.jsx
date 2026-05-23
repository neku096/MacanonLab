"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getTagLabel } from "@/lib/site";

const PAGE_SIZE = 12;

function normalizeFilter(value) {
  return value && value !== "all" ? value : "all";
}

export default function ProductsBrowser({ products, options, initialFilters }) {
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

  function updateUrl(nextFilters, nextSort = sort) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["tag", "subtag", "avatar"]) {
      if (nextFilters[key] && nextFilters[key] !== "all") params.set(key, nextFilters[key]);
      else params.delete(key);
    }
    if (nextSort === "popular") params.set("sort", "popular");
    else params.delete("sort");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function setFilter(name, value) {
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    setPage(1);
    updateUrl(nextFilters);
  }

  function setSortMode(value) {
    setSort(value);
    setPage(1);
    updateUrl(filters, value);
  }

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const tagMatches = filters.tag === "all" || product.tags.includes(filters.tag);
      const subtagMatches = filters.subtag === "all" || product.subtags.includes(filters.subtag);
      const avatarMatches = filters.avatar === "all" || product.subtags.includes(filters.avatar);
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

  return (
    <>
      <div className="booth-sort-tabs" role="group" aria-label="BOOTH作品表示順">
        <button
          className={`booth-sort-button${sort === "default" ? " is-active" : ""}`}
          type="button"
          onClick={() => setSortMode("default")}
          aria-pressed={sort === "default"}
        >
          通常順
        </button>
        <button
          className={`booth-sort-button${sort === "popular" ? " is-active" : ""}`}
          type="button"
          onClick={() => setSortMode("popular")}
          aria-pressed={sort === "popular"}
        >
          人気順
        </button>
      </div>

      <div className="booth-filter-panel" data-count-suffix="件" data-page-size={PAGE_SIZE}>
        <p className="booth-filter-heading">通常タグ</p>
        <div className="booth-filter-tabs" role="group" aria-label="BOOTH作品タグ絞り込み">
          <FilterButton active={filters.tag === "all"} onClick={() => setFilter("tag", "all")}>
            すべて
          </FilterButton>
          {options.tags.map((tag) => (
            <FilterButton key={tag} active={filters.tag === tag} onClick={() => setFilter("tag", tag)}>
              {getTagLabel(tag)}
            </FilterButton>
          ))}
        </div>
        <span className="booth-filter-status" aria-live="polite">
          {filteredProducts.length}件
        </span>
      </div>

      <div className="booth-subtag-panel" id="booth-subtags">
        <p className="booth-subtag-heading">サブタグ</p>
        <div className="booth-subtag-tabs" role="group" aria-label="BOOTH作品サブタグ絞り込み">
          <SubtagButton active={filters.subtag === "all"} onClick={() => setFilter("subtag", "all")}>
            すべて
          </SubtagButton>
          {options.subtags.map((subtag) => (
            <SubtagButton key={subtag} active={filters.subtag === subtag} onClick={() => setFilter("subtag", subtag)}>
              {getTagLabel(subtag)}
            </SubtagButton>
          ))}
        </div>
      </div>

      <div className="booth-list-grid" aria-live="polite">
        {visibleProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={currentPage === 1 && index < 3} />
        ))}
      </div>

      <nav className="booth-pagination" aria-label="BOOTH作品ページ切り替え">
        <button className="booth-page-button" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1}>
          前へ
        </button>
        <span className="booth-page-status" aria-live="polite">
          {currentPage} / {totalPages}
        </span>
        <button className="booth-page-button" type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage >= totalPages}>
          次へ
        </button>
      </nav>
    </>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button className={`booth-filter-button${active ? " is-active" : ""}`} type="button" onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

function SubtagButton({ active, children, onClick }) {
  return (
    <button className={`booth-subtag-button${active ? " is-active" : ""}`} type="button" onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}
