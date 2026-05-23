"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function ProductGallery({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbsRef = useRef(null);
  const current = images[currentIndex] || images[0];

  function move(delta) {
    const next = (currentIndex + delta + images.length) % images.length;
    setCurrentIndex(next);
    const thumb = thumbsRef.current?.querySelector(`[data-thumb-index="${next}"]`);
    thumb?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }

  if (!current) {
    return null;
  }

  return (
    <div className="product-gallery" aria-label="商品画像ギャラリー">
      <figure className="product-main-figure">
        <button className="product-main-button" type="button" onClick={() => move(1)} aria-label={`${title}の商品画像を切り替え`}>
          <Image
            className="product-main-image"
            src={current.src}
            alt={current.alt || title}
            width={current.width || 1000}
            height={current.height || 1000}
            sizes="(max-width: 720px) 100vw, 620px"
            priority
          />
        </button>
      </figure>
      {images.length > 1 ? (
        <div className="product-thumbnail-slider" aria-label="サムネイルスライダー">
          <button className="product-thumbnail-arrow" type="button" onClick={() => move(-1)} aria-label="前のサムネイルへ">
            ‹
          </button>
          <div className="product-thumbnails" ref={thumbsRef} aria-label="サムネイル">
            {images.map((image, index) => (
              <button
                className={`product-thumbnail${index === currentIndex ? " is-active" : ""}`}
                type="button"
                key={`${image.thumb}-${index}`}
                data-thumb-index={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`${index + 1}枚目の画像を表示`}
                aria-pressed={index === currentIndex}
              >
                <Image src={image.thumb || image.src} alt="" width={160} height={160} sizes="96px" />
              </button>
            ))}
          </div>
          <button className="product-thumbnail-arrow" type="button" onClick={() => move(1)} aria-label="次のサムネイルへ">
            ›
          </button>
        </div>
      ) : null}
      <p className="product-media-note">クリックして画像を切り替えられます。</p>
    </div>
  );
}
