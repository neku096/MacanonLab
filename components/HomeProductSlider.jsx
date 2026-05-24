"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/ProductCard";

export default function HomeProductSlider({ products }) {
  const sliderRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return undefined;

    const updateMetrics = () => {
      const nextPageCount = Math.max(1, Math.ceil(slider.scrollWidth / Math.max(1, slider.clientWidth)));
      setPageCount(nextPageCount);
      setActivePage(Math.min(nextPageCount - 1, Math.round(slider.scrollLeft / Math.max(1, slider.clientWidth))));
    };

    updateMetrics();
    slider.addEventListener("scroll", updateMetrics, { passive: true });
    window.addEventListener("resize", updateMetrics);

    return () => {
      slider.removeEventListener("scroll", updateMetrics);
      window.removeEventListener("resize", updateMetrics);
    };
  }, [products.length]);

  function scrollToPage(index) {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.scrollTo({ left: index * slider.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="slider-shell">
      <div className="product-slider product-card-slider" data-slider data-card-selector=".product-card" data-loop="true" tabIndex={0} ref={sliderRef}>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} variant="related" priority={index < 4} />
        ))}
      </div>
      <div className="slider-dots" data-slider-dots aria-label="商品スライド位置">
        {Array.from({ length: pageCount }, (_, index) => (
          <button
            className={`slider-dot${activePage === index ? " is-active" : ""}`}
            type="button"
            aria-label={`商品スライド ${index + 1}`}
            aria-pressed={activePage === index}
            key={index}
            onClick={() => scrollToPage(index)}
          />
        ))}
      </div>
    </div>
  );
}
