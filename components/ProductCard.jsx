import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product, priority = false, variant = "grid" }) {
  const isRelated = variant === "related";
  const caption = getCardCaption(product);

  return (
    <Link
      className={isRelated ? "product-card" : "booth-list-thumb"}
      href={`/products/${product.slug}`}
      data-booth-tags={product.tags.join(" ")}
      data-booth-subtags={product.subtags.join(" ")}
      data-likes={product.likes}
      aria-label={`${product.title}の商品ページへ`}
    >
      <Image
        className={isRelated ? "product-cover" : undefined}
        src={product.coverImage}
        alt={product.coverAlt || product.title}
        width={product.coverWidth || 600}
        height={product.coverHeight || 600}
        sizes={isRelated ? "(max-width: 860px) 50vw, 240px" : "(max-width: 860px) 50vw, 430px"}
        priority={priority}
      />
      {isRelated ? (
        <>
          <strong>{product.title}</strong>
          <small>{caption}</small>
        </>
      ) : null}
    </Link>
  );
}

function getCardCaption(product) {
  if (product.subtags?.includes("summon-gimmick")) return "召喚ギミック";
  if (product.subtags?.includes("chair-gimmick")) return "ギミック";
  if (product.tags?.includes("clothing")) return "3D衣装";
  if (product.tags?.includes("accessory")) return "3D装飾品";
  if (product.tags?.includes("avatar")) return "3Dモデル";
  if (product.tags?.includes("world-gimmick")) return "ワールドギミック";
  return product.categoryLabel || product.support;
}
