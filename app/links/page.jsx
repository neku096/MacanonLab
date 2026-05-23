import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Links",
  description: "macanonのBOOTH、X、サイト内ページへのリンク集です。"
};

export default function LinksPage() {
  return (
    <main className="links-page">
      <section className="section sub-hero">
        <p className="eyebrow">Links</p>
        <h1>Links</h1>
        <p>BOOTH、X、サイト内ページへのリンクをまとめています。</p>
      </section>
      <section className="section link-hub-section" aria-label="外部リンク">
        <img className="link-hub-image" src="/Macanon_Samune/macanon_samune.webp" alt="macanon" width="600" height="600" loading="lazy" />
        <div className="link-hub-actions">
          <a className="footer-pill link-hub-pill" href={SITE.boothUrl} target="_blank" rel="noopener noreferrer">
            <span className="footer-pill-icon" aria-hidden="true">B</span>
            <span>BOOTH</span>
          </a>
          <a className="footer-pill link-hub-pill" href={SITE.xUrl} target="_blank" rel="noopener noreferrer">
            <span className="footer-pill-icon" aria-hidden="true">X</span>
            <span>X</span>
          </a>
        </div>
      </section>
      <section className="section link-hub-section" aria-label="サイト内で探す">
        <div className="section-heading">
          <div>
            <small>Internal</small>
            <h2>サイト内で探す</h2>
          </div>
        </div>
        <div className="link-hub-grid">
          <Link className="article-related-item" href="/products">
            <span className="article-related-copy">
              <strong>BOOTH作品一覧</strong>
              <small>サムネイルから作品を探す</small>
            </span>
          </Link>
          <Link className="article-related-item" href="/terms">
            <span className="article-related-copy">
              <strong>利用規約</strong>
              <small>使用条件を確認する</small>
            </span>
          </Link>
          <Link className="article-related-item" href="/blog">
            <span className="article-related-copy">
              <strong>ブログ</strong>
              <small>ブログを確認する</small>
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
