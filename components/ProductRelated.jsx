import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default function ProductRelated({ products }) {
  if (!products.length) return null;

  return (
    <section className="section product-related-section" aria-labelledby="related-products-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Related</p>
          <h2 id="related-products-title">関連商品</h2>
        </div>
        <Link className="button secondary" href="/products">
          BOOTH作品一覧へ
        </Link>
      </div>
      <div className="product-related-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="related" />
        ))}
      </div>
    </section>
  );
}
