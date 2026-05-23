import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductRelated from "@/components/ProductRelated";
import { getProductBySlug, getPublishedProducts, getRelatedProducts, getTagLabel } from "@/lib/products";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return getPublishedProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product || !product.published) {
    return {
      title: "商品が見つかりません",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  return {
    title: product.title,
    description: product.description,
    alternates: {
      canonical: `/products/${product.slug}`
    },
    openGraph: {
      type: "website",
      title: `${product.title} | ${SITE.name}`,
      description: product.description,
      images: [
        {
          url: product.gallery[0]?.src || product.coverImage,
          width: product.gallery[0]?.width || product.coverWidth,
          height: product.gallery[0]?.height || product.coverHeight,
          alt: product.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | ${SITE.name}`,
      description: product.description,
      images: [product.gallery[0]?.src || product.coverImage]
    }
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product || !product.published) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);

  return (
    <main className="product-page">
      <section className="section product-hero" aria-labelledby="product-title">
        <ProductGallery images={product.gallery} title={product.title} />
        <aside className="product-summary" aria-label="商品情報">
          <nav className="product-summary-breadcrumb" aria-label="作品カテゴリ">
            <Link href="/products" aria-label="BOOTH">
              BOOTH作品一覧
            </Link>
            <span aria-hidden="true">›</span>
            <Link href={`/products?tag=${product.category}`}>{product.categoryLabel}</Link>
          </nav>
          <h1 id="product-title">{product.title}</h1>
          <div className="product-summary-tags" aria-label="商品キーワード">
            {product.summaryTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <dl className="product-specs">
            <div>
              <dt>対応</dt>
              <dd>{product.support}</dd>
            </div>
            <div>
              <dt>内容</dt>
              <dd>{product.content}</dd>
            </div>
            <div>
              <dt>用途</dt>
              <dd>{product.usage}</dd>
            </div>
            <div>
              <dt>価格</dt>
              <dd>{product.price}</dd>
            </div>
          </dl>
          <div className="product-actions">
            {product.salesUrls.booth ? (
              <a className="button primary product-buy-button" href={product.salesUrls.booth} target="_blank" rel="noopener noreferrer">
                BOOTHで購入する
              </a>
            ) : null}
            {product.salesUrls.dlsite ? (
              <a className="button secondary product-buy-button" href={product.salesUrls.dlsite} target="_blank" rel="noopener noreferrer">
                DLsiteで見る
              </a>
            ) : null}
            {product.salesUrls.external.map((link) => (
              <a className="button secondary product-buy-button" href={link.url} target="_blank" rel="noopener noreferrer" key={link.url}>
                {link.label || "外部販売ページを見る"}
              </a>
            ))}
          </div>
          <p className="product-note">{product.note}</p>
        </aside>
      </section>

      <section className="section product-detail-section" aria-label="商品詳細">
        <div className="product-detail-grid" dangerouslySetInnerHTML={{ __html: product.contentHtml }} />
      </section>

      <section className="section product-tag-section" aria-label="この商品のタグ">
        <div className="product-tag-group">
          <p className="booth-subtag-heading">通常タグ</p>
          <div className="product-tag-list">
            {product.tags.map((tag) => (
              <Link className="product-tag" href={`/products?tag=${tag}`} key={tag}>
                {getTagLabel(tag)}
              </Link>
            ))}
          </div>
        </div>
        {product.subtags.length ? (
          <div className="product-tag-group">
            <p className="booth-subtag-heading">サブタグ</p>
            <div className="product-tag-list">
              {product.subtags.map((subtag) => (
                <Link className="product-tag" href={`/products?subtag=${subtag}`} key={subtag}>
                  {getTagLabel(subtag)}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <ProductRelated products={relatedProducts} />
    </main>
  );
}
