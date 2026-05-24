"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function wrapIndex(index, length) {
  return (index + length) % length;
}

export default function ProductGallery({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const thumbsRef = useRef(null);
  const mainButtonRef = useRef(null);
  const lightboxRef = useRef(null);
  const lightboxImageWrapRef = useRef(null);
  const currentIndexRef = useRef(0);
  const suppressThumbClickRef = useRef(false);
  const suppressMainClickRef = useRef(false);
  const thumbDragRef = useRef({ pointerId: null, startX: 0, startY: 0, startScrollLeft: 0, dragged: false, pressTarget: null });
  const mainDragRef = useRef({ pointerId: null, startX: 0, startY: 0 });
  const stageDragRef = useRef({ pointerId: null, startX: 0, startY: 0 });
  const inlineScrollMutedRef = useRef(false);
  const inlineScrollTimerRef = useRef(null);
  const inlineScrollFrameRef = useRef(null);
  const current = images[currentIndex] || images[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    document.body.classList.toggle("product-lightbox-open", isLightboxOpen);
    return () => {
      document.body.classList.remove("product-lightbox-open");
    };
  }, [isLightboxOpen]);

  useLayoutEffect(() => {
    if (!isLightboxOpen) return;
    lightboxRef.current?.focus({ preventScroll: true });
  }, [isLightboxOpen]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      } else if (event.key === "ArrowLeft") {
        move(-1, false);
      } else if (event.key === "ArrowRight") {
        move(1, false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, images.length]);

  if (!current) {
    return null;
  }

  function scrollActiveThumb(index, behavior = "smooth") {
    const thumb = thumbsRef.current?.querySelector(`[data-gallery-index="${index}"]`);
    thumb?.scrollIntoView({ behavior, inline: "center", block: "nearest" });
  }

  function muteInlineScrollSelection() {
    inlineScrollMutedRef.current = true;
    window.clearTimeout(inlineScrollTimerRef.current);
    inlineScrollTimerRef.current = window.setTimeout(() => {
      inlineScrollMutedRef.current = false;
    }, 360);
  }

  function setImage(index, syncInlineThumb = true) {
    const nextIndex = wrapIndex(index, images.length);
    setCurrentIndex(nextIndex);
    if (syncInlineThumb) {
      muteInlineScrollSelection();
      window.requestAnimationFrame(() => scrollActiveThumb(nextIndex));
    }
  }

  function move(delta, syncInlineThumb = true) {
    setImage(currentIndexRef.current + delta, syncInlineThumb);
  }

  function getLeadingInlineThumbIndex() {
    const thumbs = thumbsRef.current;
    if (!thumbs) return null;
    const sliderRect = thumbs.getBoundingClientRect();
    let leadingThumb = null;
    let leadingDistance = Number.POSITIVE_INFINITY;

    thumbs.querySelectorAll("[data-gallery-index]").forEach((button) => {
      const rect = button.getBoundingClientRect();
      const isVisible = rect.right > sliderRect.left + 1 && rect.left < sliderRect.right - 1;
      if (!isVisible) return;
      const distance = Math.abs(rect.left - sliderRect.left);
      if (distance < leadingDistance) {
        leadingDistance = distance;
        leadingThumb = button;
      }
    });

    return leadingThumb ? Number(leadingThumb.dataset.galleryIndex) : null;
  }

  function syncMainImageToLeadingInlineThumb() {
    if (inlineScrollMutedRef.current || inlineScrollFrameRef.current !== null) return;

    inlineScrollFrameRef.current = window.requestAnimationFrame(() => {
      inlineScrollFrameRef.current = null;
      if (inlineScrollMutedRef.current) return;

      const index = getLeadingInlineThumbIndex();
      if (!Number.isFinite(index) || index === currentIndexRef.current) return;
      setImage(index, false);
    });
  }

  function suppressNextThumbClick() {
    suppressThumbClickRef.current = true;
    window.setTimeout(() => {
      suppressThumbClickRef.current = false;
    }, 300);
  }

  function suppressNextMainClick() {
    suppressMainClickRef.current = true;
    window.setTimeout(() => {
      suppressMainClickRef.current = false;
    }, 300);
  }

  function resetThumbDrag(event) {
    const thumbs = thumbsRef.current;
    thumbs?.classList.remove("is-dragging");
    if (thumbs?.hasPointerCapture?.(event.pointerId)) {
      thumbs.releasePointerCapture(event.pointerId);
    }
    thumbDragRef.current.pointerId = null;
    thumbDragRef.current.pressTarget = null;
  }

  function onThumbPointerDown(event) {
    if (event.button !== 0 || event.isPrimary === false) return;
    inlineScrollMutedRef.current = false;
    window.clearTimeout(inlineScrollTimerRef.current);
    thumbDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: thumbsRef.current?.scrollLeft || 0,
      dragged: false,
      pressTarget: event.target.closest("[data-gallery-index]")
    };
    try {
      thumbsRef.current?.setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture can fail if the browser interrupts the gesture.
    }
    if (event.pointerType !== "touch") {
      event.preventDefault();
    }
  }

  function onThumbPointerMove(event) {
    const state = thumbDragRef.current;
    if (state.pointerId !== event.pointerId || !thumbsRef.current) return;
    const movedX = event.clientX - state.startX;
    const movedY = event.clientY - state.startY;
    if (Math.abs(movedX) < 8 || Math.abs(movedX) < Math.abs(movedY) * 1.15) return;
    state.dragged = true;
    thumbsRef.current.classList.add("is-dragging");
    thumbsRef.current.scrollLeft = state.startScrollLeft - movedX;
    syncMainImageToLeadingInlineThumb();
    event.preventDefault();
  }

  function onThumbPointerUp(event) {
    const state = thumbDragRef.current;
    if (state.pointerId !== event.pointerId) return;

    const pressedThumb = state.pressTarget;
    const shouldSelect = !state.dragged && pressedThumb;
    if (state.dragged || shouldSelect) {
      suppressNextThumbClick();
    }

    resetThumbDrag(event);

    if (shouldSelect) {
      const index = Number(pressedThumb.dataset.galleryIndex);
      if (Number.isFinite(index)) {
        setImage(index);
      }
    }
  }

  function onMainPointerDown(event) {
    if (event.button !== 0 || event.isPrimary === false) return;
    mainDragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
    try {
      mainButtonRef.current?.setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture can fail if the browser interrupts the gesture.
    }
  }

  function onMainPointerMove(event) {
    const state = mainDragRef.current;
    if (state.pointerId !== event.pointerId) return;
    const movedX = event.clientX - state.startX;
    const movedY = event.clientY - state.startY;
    if (Math.abs(movedX) > 8 && Math.abs(movedX) > Math.abs(movedY) * 1.15) {
      mainButtonRef.current?.classList.add("is-dragging");
      event.preventDefault();
    }
  }

  function resetMainDrag(event) {
    mainButtonRef.current?.classList.remove("is-dragging");
    if (mainButtonRef.current?.hasPointerCapture?.(event.pointerId)) {
      mainButtonRef.current.releasePointerCapture(event.pointerId);
    }
    mainDragRef.current.pointerId = null;
  }

  function finishMainDrag(event) {
    const state = mainDragRef.current;
    if (state.pointerId !== event.pointerId) return;

    const movedX = event.clientX - state.startX;
    const movedY = event.clientY - state.startY;
    const isHorizontalSlide = Math.abs(movedX) >= 48 && Math.abs(movedX) > Math.abs(movedY) * 1.15;
    resetMainDrag(event);

    if (!isHorizontalSlide) return;
    suppressNextMainClick();
    move(movedX < 0 ? 1 : -1);
  }

  function openLightbox(event) {
    if (suppressMainClickRef.current) {
      event.preventDefault();
      suppressMainClickRef.current = false;
      return;
    }
    setLightboxOpen(true);
  }

  function onStagePointerDown(event) {
    if (event.button !== 0 || event.target.closest("button")) return;
    stageDragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture can fail if the browser interrupts the gesture.
    }
  }

  function onStagePointerMove(event) {
    const state = stageDragRef.current;
    if (state.pointerId !== event.pointerId) return;
    if (Math.abs(event.clientX - state.startX) > 8) {
      lightboxImageWrapRef.current?.classList.add("is-dragging");
      event.preventDefault();
    }
  }

  function resetStageDrag(event) {
    lightboxImageWrapRef.current?.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    stageDragRef.current.pointerId = null;
  }

  function finishStageDrag(event) {
    const state = stageDragRef.current;
    if (state.pointerId !== event.pointerId) return;

    const movedX = event.clientX - state.startX;
    const movedY = event.clientY - state.startY;
    resetStageDrag(event);

    if (Math.abs(movedX) >= 48 && Math.abs(movedX) > Math.abs(movedY) * 1.15) {
      move(movedX < 0 ? 1 : -1, false);
    }
  }

  const lightbox = (
    <div
      className="product-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="商品画像ギャラリー"
      tabIndex={-1}
      ref={lightboxRef}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setLightboxOpen(false);
        }
      }}
    >
      <div
        className="product-lightbox-stage"
        data-gallery-stage
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setLightboxOpen(false);
          }
        }}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={finishStageDrag}
        onPointerCancel={resetStageDrag}
        onLostPointerCapture={() => {
          lightboxImageWrapRef.current?.classList.remove("is-dragging");
          stageDragRef.current.pointerId = null;
        }}
      >
        <div className="product-lightbox-image-wrap" ref={lightboxImageWrapRef}>
          <button className="product-lightbox-close" type="button" data-gallery-close aria-label="閉じる" onClick={() => setLightboxOpen(false)}>
            ×
          </button>
          <button className="product-lightbox-nav" type="button" data-gallery-prev aria-label="前の画像" onClick={() => move(-1, false)}>
            ‹
          </button>
          <img className="product-lightbox-image" src={current.src} alt={current.alt || title} draggable="false" />
          <button className="product-lightbox-nav" type="button" data-gallery-next aria-label="次の画像" onClick={() => move(1, false)}>
            ›
          </button>
        </div>
      </div>
      <aside className="product-lightbox-side">
        <p className="product-lightbox-title">{title}</p>
        <p className="product-lightbox-count">
          {currentIndex + 1} / {images.length}
        </p>
        <div className="product-lightbox-thumbs" aria-label="サムネイル">
          {images.map((image, index) => (
            <button
              className={`product-lightbox-thumb${index === currentIndex ? " is-active" : ""}`}
              type="button"
              key={`lightbox-${image.thumb || image.src}-${index}`}
              data-gallery-index={index}
              onClick={() => setImage(index, false)}
              aria-label={`${title} 商品画像 ${index + 1}枚目`}
              aria-current={index === currentIndex ? "true" : "false"}
            >
              <img src={image.thumb || image.src} alt={image.alt || title} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
            </button>
          ))}
        </div>
      </aside>
    </div>
  );

  return (
    <div className="product-gallery" data-product-gallery aria-label="商品画像ギャラリー">
      <figure className="product-main-figure">
        <button
          className="product-main-button"
          type="button"
          data-gallery-open
          ref={mainButtonRef}
          onClick={openLightbox}
          onPointerDown={onMainPointerDown}
          onPointerMove={onMainPointerMove}
          onPointerUp={finishMainDrag}
          onPointerCancel={resetMainDrag}
          onLostPointerCapture={() => {
            mainButtonRef.current?.classList.remove("is-dragging");
            mainDragRef.current.pointerId = null;
          }}
          aria-label={`${title}の商品画像を拡大表示`}
        >
          <Image
            className="product-main-image"
            data-product-main-image
            src={current.src}
            alt={current.alt || title}
            width={current.width || 1000}
            height={current.height || 1000}
            sizes="(max-width: 720px) 100vw, 620px"
            priority
            draggable={false}
          />
        </button>
      </figure>
      {images.length > 1 ? (
        <div className="product-thumbnail-slider" aria-label="サムネイルスライダー">
          <button className="product-thumbnail-arrow" type="button" onClick={() => move(-1)} aria-label="前のサムネイルへ">
            ‹
          </button>
          <div
            className="product-thumbnails"
            data-gallery-inline-thumbs
            ref={thumbsRef}
            aria-label="サムネイル"
            onClickCapture={(event) => {
              if (!suppressThumbClickRef.current) return;
              event.preventDefault();
              event.stopPropagation();
            }}
            onPointerDown={onThumbPointerDown}
            onPointerMove={onThumbPointerMove}
            onPointerUp={onThumbPointerUp}
            onPointerCancel={resetThumbDrag}
            onLostPointerCapture={() => {
              thumbsRef.current?.classList.remove("is-dragging");
              thumbDragRef.current.pointerId = null;
              thumbDragRef.current.pressTarget = null;
            }}
            onScroll={syncMainImageToLeadingInlineThumb}
          >
            {images.map((image, index) => (
              <button
                className={`product-thumbnail${index === currentIndex ? " is-active" : ""}`}
                type="button"
                key={`${image.thumb || image.src}-${index}`}
                data-gallery-index={index}
                data-gallery-thumb
                onClick={() => {
                  if (!suppressThumbClickRef.current) {
                    setImage(index);
                  }
                }}
                aria-label={`${title} 商品画像 ${index + 1}枚目`}
                aria-current={index === currentIndex ? "true" : "false"}
              >
                <Image src={image.thumb || image.src} alt={image.alt || title} width={160} height={160} sizes="96px" loading={index === 0 ? "eager" : "lazy"} />
              </button>
            ))}
          </div>
          <button className="product-thumbnail-arrow" type="button" onClick={() => move(1)} aria-label="次のサムネイルへ">
            ›
          </button>
        </div>
      ) : null}
      <p className="product-media-note">クリックして拡大できます。</p>
      {mounted && isLightboxOpen ? createPortal(lightbox, document.body) : null}
    </div>
  );
}
