"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import legacyI18n from "@/data/legacy-i18n.json";

const AUTO_SLIDE_DELAY = 3600;
const STEP_SIZE = 2;
const { translations } = legacyI18n;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getCurrentLanguage() {
  if (typeof window === "undefined") return "ja";
  try {
    const storedLanguage = window.localStorage.getItem("macanon-language");
    if (storedLanguage === "en" || storedLanguage === "ja") {
      return storedLanguage;
    }
  } catch {
    // localStorage can be blocked; fall back to the document language.
  }
  return document.documentElement.lang === "en" ? "en" : "ja";
}

function getSlideLabel(index, language) {
  if (language === "en") {
    return `Go to slide ${index + 1}`;
  }
  return `${index + 1}枚目へ`;
}

function getSliderDotsLabel(language) {
  if (language === "en") {
    return "Product slide position";
  }
  return "商品スライド位置";
}

function getCardAriaLabel(item, language) {
  if (language === "en") {
    return `Open link for ${translations[item.title] || item.title}`;
  }
  return `${item.title}のリンクを開く`;
}

export default function HomeProductSlider({ items = [] }) {
  const sliderRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const [language, setLanguage] = useState("ja");
  const dragStateRef = useRef({
    isDragging: false,
    hasDragged: false,
    startX: 0,
    startScrollLeft: 0,
    pressedLink: null,
    suppressNextClick: false
  });
  const autoSlideTimerRef = useRef(null);
  const canAutoSlideRef = useRef(false);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return undefined;

    const getGap = () => {
      const gap = Number.parseFloat(getComputedStyle(slider).columnGap);
      return Number.isNaN(gap) ? 24 : gap;
    };
    const getCard = () => slider.querySelector(".product-card");
    const getCardDistance = () => {
      const card = getCard();
      return card ? card.getBoundingClientRect().width + getGap() : slider.clientWidth;
    };
    const getMaxScrollLeft = () => Math.max(0, slider.scrollWidth - slider.clientWidth);
    const getMaxIndex = () => {
      const distance = getCardDistance();
      return distance > 0 ? Math.ceil(getMaxScrollLeft() / distance) : 0;
    };
    const getMaxStepIndex = () => Math.ceil(getMaxIndex() / STEP_SIZE);
    const getSlideLeft = (index) => Math.min(getCardDistance() * index, getMaxScrollLeft());
    const getCurrentIndex = () => {
      const distance = getCardDistance();
      return distance > 0 ? clamp(Math.round(slider.scrollLeft / distance), 0, getMaxIndex()) : 0;
    };
    const getCurrentStepIndex = () => clamp(Math.round(getCurrentIndex() / STEP_SIZE), 0, getMaxStepIndex());
    const isAtEnd = () => slider.scrollLeft >= getMaxScrollLeft() - 2;

    const updateMetrics = () => {
      const nextPageCount = Math.max(1, getMaxStepIndex() + 1);
      setPageCount(nextPageCount);
      setActivePage(getCurrentStepIndex());
    };

    const fastScrollToStart = () => {
      const start = slider.scrollLeft;
      const duration = 20;
      const startedAt = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        slider.scrollLeft = start * (1 - progress);
        if (progress < 1) {
          requestAnimationFrame(step);
          return;
        }
        slider.scrollLeft = 0;
        updateMetrics();
      };

      requestAnimationFrame(step);
    };

    const slideByCard = (direction) => {
      const maxScrollLeft = getMaxScrollLeft();
      if (maxScrollLeft <= 0) return;
      const currentIndex = getCurrentIndex();
      if (direction > 0 && isAtEnd()) {
        fastScrollToStart();
        return;
      }
      if (direction < 0 && slider.scrollLeft <= 2) {
        slider.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
        return;
      }
      const nextIndex = clamp(currentIndex + direction * STEP_SIZE, 0, items.length - 1);
      slider.scrollTo({ left: getSlideLeft(nextIndex), behavior: "smooth" });
    };

    const stopAutoSlide = () => {
      window.clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    };

    const startAutoSlide = () => {
      if (autoSlideTimerRef.current || !canAutoSlideRef.current) return;
      autoSlideTimerRef.current = window.setInterval(() => slideByCard(1), AUTO_SLIDE_DELAY);
    };

    const restartAutoSlide = () => {
      stopAutoSlide();
      startAutoSlide();
    };

    const move = (direction) => {
      slideByCard(direction);
      restartAutoSlide();
    };

    const onKeyDown = (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    };

    const onPointerDown = (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      dragStateRef.current.isDragging = true;
      dragStateRef.current.hasDragged = false;
      dragStateRef.current.startX = event.clientX;
      dragStateRef.current.startScrollLeft = slider.scrollLeft;
      dragStateRef.current.pressedLink = event.target.closest("a[href]");
      slider.setPointerCapture(event.pointerId);
      stopAutoSlide();
    };

    const onPointerMove = (event) => {
      const dragState = dragStateRef.current;
      if (!dragState.isDragging) return;
      const movedX = event.clientX - dragState.startX;
      if (Math.abs(movedX) < 8) return;
      dragState.hasDragged = true;
      dragState.pressedLink = null;
      slider.classList.add("is-dragging");
      event.preventDefault();
      slider.scrollLeft = dragState.startScrollLeft - movedX;
    };

    const stopDragging = (event) => {
      const dragState = dragStateRef.current;
      if (!dragState.isDragging) return;
      dragState.isDragging = false;
      slider.classList.remove("is-dragging");
      restartAutoSlide();
      if (slider.hasPointerCapture(event.pointerId)) {
        slider.releasePointerCapture(event.pointerId);
      }
      const totalMovedX = Math.abs(event.clientX - dragState.startX);
      if (!dragState.hasDragged && totalMovedX < 8 && dragState.pressedLink && dragState.pressedLink.getAttribute("href") !== "#") {
        dragState.suppressNextClick = true;
        if (dragState.pressedLink.target === "_blank") {
          window.open(dragState.pressedLink.href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = dragState.pressedLink.href;
        }
      }
      dragState.pressedLink = null;
    };

    const onClickCapture = (event) => {
      const dragState = dragStateRef.current;
      if (dragState.suppressNextClick) {
        event.preventDefault();
        event.stopPropagation();
        dragState.suppressNextClick = false;
        return;
      }
      if (!dragState.hasDragged) return;
      event.preventDefault();
      event.stopPropagation();
      window.setTimeout(() => {
        dragState.hasDragged = false;
      }, 0);
    };

    const onLanguageChange = () => {
      setLanguage(getCurrentLanguage());
    };
    const onDragStart = (event) => event.preventDefault();
    const onLostPointerCapture = () => {
      dragStateRef.current.isDragging = false;
      slider.classList.remove("is-dragging");
      restartAutoSlide();
    };

    updateMetrics();
    onLanguageChange();
    slider.addEventListener("scroll", updateMetrics, { passive: true });
    slider.addEventListener("keydown", onKeyDown);
    slider.addEventListener("pointerdown", onPointerDown);
    slider.addEventListener("pointermove", onPointerMove);
    slider.addEventListener("pointerup", stopDragging);
    slider.addEventListener("pointercancel", stopDragging);
    slider.addEventListener("lostpointercapture", onLostPointerCapture);
    slider.addEventListener("click", onClickCapture, true);
    slider.addEventListener("dragstart", onDragStart);
    slider.addEventListener("mouseenter", stopAutoSlide);
    slider.addEventListener("mouseleave", restartAutoSlide);
    slider.addEventListener("focusin", stopAutoSlide);
    slider.addEventListener("focusout", restartAutoSlide);
    window.addEventListener("resize", updateMetrics);
    window.addEventListener("macanon:languagechange", onLanguageChange);

    let observer;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          canAutoSlideRef.current = entries.some((entry) => entry.isIntersecting);
          if (canAutoSlideRef.current) {
            startAutoSlide();
          } else {
            stopAutoSlide();
          }
        },
        { rootMargin: "160px 0px" }
      );
      observer.observe(slider);
    } else {
      canAutoSlideRef.current = true;
      startAutoSlide();
    }

    return () => {
      stopAutoSlide();
      observer?.disconnect();
      slider.removeEventListener("scroll", updateMetrics);
      slider.removeEventListener("keydown", onKeyDown);
      slider.removeEventListener("pointerdown", onPointerDown);
      slider.removeEventListener("pointermove", onPointerMove);
      slider.removeEventListener("pointerup", stopDragging);
      slider.removeEventListener("pointercancel", stopDragging);
      slider.removeEventListener("lostpointercapture", onLostPointerCapture);
      slider.removeEventListener("click", onClickCapture, true);
      slider.removeEventListener("dragstart", onDragStart);
      slider.removeEventListener("mouseenter", stopAutoSlide);
      slider.removeEventListener("mouseleave", restartAutoSlide);
      slider.removeEventListener("focusin", stopAutoSlide);
      slider.removeEventListener("focusout", restartAutoSlide);
      window.removeEventListener("resize", updateMetrics);
      window.removeEventListener("macanon:languagechange", onLanguageChange);
    };
  }, [items.length]);

  function scrollToPage(index) {
    const slider = sliderRef.current;
    if (!slider) return;
    const card = slider.querySelector(".product-card");
    const gap = Number.parseFloat(getComputedStyle(slider).columnGap);
    const distance = card ? card.getBoundingClientRect().width + (Number.isNaN(gap) ? 24 : gap) : slider.clientWidth;
    slider.scrollTo({ left: distance * index * STEP_SIZE, behavior: "smooth" });
  }

  return (
    <div className="slider-shell">
      <div className="product-slider product-card-slider" data-slider data-card-selector=".product-card" data-loop="true" tabIndex={0} ref={sliderRef}>
        {items.map((item) => (
          <SlideLinkCard item={item} language={language} key={item.id} />
        ))}
      </div>
      <div className="slider-dots" data-slider-dots aria-label={getSliderDotsLabel(language)}>
        {Array.from({ length: pageCount }, (_, index) => (
          <button
            className={`slider-dot${activePage === index ? " is-active" : ""}`}
            type="button"
            aria-label={getSlideLabel(index, language)}
            aria-pressed={activePage === index}
            aria-current={activePage === index ? "true" : "false"}
            key={index}
            onClick={() => scrollToPage(index)}
          />
        ))}
      </div>
    </div>
  );
}

function SlideLinkCard({ item, language }) {
  const linkProps = item.openInNewTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a className="product-card" href={item.url} aria-label={getCardAriaLabel(item, language)} {...linkProps}>
      <Image
        className="product-cover"
        src={item.thumbnail}
        alt={item.thumbnailAlt || item.title}
        width={item.thumbnailWidth || 600}
        height={item.thumbnailHeight || 600}
        sizes="(max-width: 860px) 50vw, 240px"
      />
    </a>
  );
}
