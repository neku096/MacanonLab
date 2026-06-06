import Link from "next/link";
import HomeProductSlider from "@/components/HomeProductSlider";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, getPublishedProducts } from "@/lib/products";
import { getPublishedSlideLinks } from "@/lib/slideLinks";
import { SITE } from "@/lib/site";

const WORK_SLUGS = [
  "cravingdance",
  "shark-summon",
  "whale-summon",
  "dark-knight",
  "star-guardian",
  "mirilori-uniform"
];

export const metadata = {
  title: "macanon | VRChat向け3D衣装・ギミック制作",
  description:
    "macanonはVRChat向けの3D衣装、召喚ギミック、アクセサリーを制作しています。BOOTH作品、制作相談、ブログ記事への導線をまとめた公式サイトです。",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    title: "macanon | VRChat向け3D衣装・ギミック制作",
    url: "/",
    description:
      "VRChat向けの3D衣装、召喚ギミック、アクセサリーを制作するmacanonの作品サイトです。BOOTH商品と制作相談の導線をまとめています。",
    images: [
      {
        url: "/Macanon_Samune/ogp-v2.png",
        width: 1200,
        height: 630,
        alt: "macanon BOOTH商品サムネイル"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "macanon | VRChat向け3D衣装・ギミック制作",
    description: "VRChat向けの3D衣装、召喚ギミック、アクセサリーを制作するmacanonの作品サイトです。",
    images: ["/Macanon_Samune/ogp-v2.png"]
  }
};

export default function HomePage() {
  const slideLinks = getPublishedSlideLinks();
  const workProducts = getProductsBySlug(WORK_SLUGS);

  return (
    <main>
      <section className="macanon-hero" aria-labelledby="hero-title">
        <div className="macanon-hero-copy">
          <h1 id="hero-title">
            VRChat向け
            <br />
            3Dアイテム制作
          </h1>
          <p>
            衣装、召喚ギミック、アクセサリーを中心に、改変に取り入れやすく、写真や交流のきっかけになるアイテムを制作しています。
          </p>
          <div className="hero-actions">
            <a className="button primary" href={SITE.boothUrl} target="_blank" rel="noopener noreferrer">
              BOOTHを見る
            </a>
            <a className="button secondary" href="#pr-title">
              制作実績を見る
            </a>
          </div>
        </div>
        <div className="macanon-hero-visual" aria-hidden="true">
          <img
            src="/Macanon_Samune/LUMINA_CravingDance-800.webp"
            alt=""
            srcSet="/Macanon_Samune/LUMINA_CravingDance-600.webp 600w, /Macanon_Samune/LUMINA_CravingDance-800.webp 800w, /Macanon_Samune/LUMINA_CravingDance-1000.webp 1000w"
            sizes="(max-width: 860px) 100vw, 900px"
            width="800"
            height="800"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </section>

      <section className="section sales-band sales-band-top" id="products" aria-labelledby="products-title">
        <div className="section-heading">
          <div>
            <h2 id="products-title">商品リンク</h2>
          </div>
          <Link className="button secondary" href="/products">
            一覧で見る
          </Link>
        </div>
        <HomeProductSlider items={slideLinks} />
      </section>

      <section className="section text-section pr-hero" aria-labelledby="pr-title">
        <div className="pr-hero-copy">
          <h2 id="pr-title">
            <span>企業・個人様の</span>
            <span>ご依頼について</span>
          </h2>
          <p>
            VRChat向け3D衣装、召喚ギミック、アクセサリー制作などのご相談を受け付けています。
            <br />
            世界観や用途に合わせた制作をご提案します。
          </p>
          <div className="hero-actions">
            <a className="button primary" href={SITE.boothUrl} target="_blank" rel="noopener noreferrer">
              BOOTH実績を見る
            </a>
            <a className="button secondary" href={SITE.xUrl} target="_blank" rel="noopener noreferrer">
              Xで相談する
            </a>
          </div>
        </div>
        <div className="pr-hero-image">
          <img
            src="/Macanon_Samune/1-800.webp"
            alt="鮫召喚 Shark summon の制作実績サムネイル"
            srcSet="/Macanon_Samune/1-600.webp 600w, /Macanon_Samune/1-800.webp 800w, /Macanon_Samune/1-1000.webp 1000w"
            sizes="(max-width: 860px) 100vw, 900px"
            width="800"
            height="800"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      <section className="section guideline" aria-labelledby="strength-title">
        <div>
          <h2 id="strength-title">制作で大切にしていること</h2>
        </div>
        <ul className="rule-list">
          <li>VRChatで使う場面を想定した見栄え、導入しやすさ、改変しやすさのバランス</li>
          <li>Modular Avatar導入を前提にした、ユーザーが扱いやすいPrefab構成</li>
          <li>写真映えするシルエット、発光、パーティクル、表情のある演出づくり</li>
          <li>商品ページで伝わりやすいサムネイル、説明文、更新履歴の整理</li>
        </ul>
      </section>

      <section className="section text-section" aria-labelledby="works-title">
        <div className="section-heading">
          <div>
            <h2 id="works-title">公開中の制作実績</h2>
          </div>
        </div>
        <div className="booth-list-grid pr-work-grid">
          {workProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section guideline request-diagrams-section" aria-labelledby="request-title">
        <div>
          <h2 id="request-title">相談しやすい内容</h2>
        </div>
        <div className="request-diagram-grid">
          <div className="diagram-image-wrap">
            <img
              className="diagram-image"
              src="/Macanon_Samune/soudan1.webp"
              data-ja-src="/Macanon_Samune/soudan1.webp"
              data-en-src="/Macanon_Samune/samune_eg1.webp"
              alt="相談時に必要なもの: ご希望アバター、作りたい内容、参考画像、希望納期、予算感"
              width="1536"
              height="1024"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="diagram-image-wrap">
            <img
              className="diagram-image"
              src="/Macanon_Samune/soudan2.webp"
              data-ja-src="/Macanon_Samune/soudan2.webp"
              data-en-src="/Macanon_Samune/samune_eg2.webp"
              alt="制作の流れ: 相談、見積もり、制作、確認、納品"
              width="1536"
              height="1024"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function getProductsBySlug(slugs) {
  const fallbackProducts = getPublishedProducts();
  const products = slugs.map((slug) => getProductBySlug(slug)).filter((product) => product?.published);
  return products.length ? products : fallbackProducts;
}
