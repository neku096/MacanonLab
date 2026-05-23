import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getPublishedProducts } from "@/lib/products";

export default function HomePage() {
  const products = getPublishedProducts().slice(0, 6);

  return (
    <main>
      <section className="hero section">
        <div className="hero-copy">
          <p className="eyebrow">VRChat 3D衣装・ギミック制作</p>
          <h1>macanon</h1>
          <p>
            BOOTHで公開している衣装、召喚ギミック、アクセサリーを一覧から確認できます。
            商品データを追加すると、LPと関連商品が自動で更新されるNext.js構成へ移行中です。
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/products">
              BOOTH作品を見る
            </Link>
            <Link className="button secondary" href="/terms">
              利用規約を見る
            </Link>
          </div>
        </div>
      </section>
      <section className="section booth-list-section" aria-labelledby="home-products-title">
        <div className="section-heading booth-list-heading">
          <div>
            <small>BOOTH</small>
            <h2 id="home-products-title">BOOTH作品</h2>
          </div>
          <Link className="button secondary" href="/products">
            一覧へ
          </Link>
        </div>
        <div className="booth-list-grid">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 3} />
          ))}
        </div>
      </section>
    </main>
  );
}
