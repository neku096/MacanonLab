import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata = {
  alternates: {
    canonical: "/links"
  },
  openGraph: {
    url: "/links"
  },
  title: "Links",
  description: "macanonのBOOTH、X、サイト内ページへのリンク集です。"
};

export default function LinksPage() {
  return (
    <main className="links-page">
      <h1 className="visually-hidden" id="links-title">
        macanon Links
      </h1>

      <section className="section links-hero" aria-labelledby="links-title">
        <div className="links-profile">
          <img
            className="links-profile-icon"
            src="/Macanon_Samune/macanon_samune.webp"
            alt="macanon"
            width="400"
            height="400"
            decoding="async"
          />
          <p className="links-profile-name">macanon</p>
          <p className="links-profile-bio">
            VRChat向けの3D衣装やギミックを制作しています。
            <br />
            <br />
            作品一覧はBOOTH、
            <br />
            更新情報はXからご確認ください。
          </p>
        </div>

        <div className="links-list" aria-label="外部リンク">
          <a className="link-card link-card-primary" href={SITE.boothUrl} target="_blank" rel="noopener noreferrer">
            <span className="link-card-icon" aria-hidden="true">
              <img src="/images/link-icons/booth.webp" alt="" width="56" height="56" decoding="async" />
            </span>
            <span className="link-card-body">
              <strong>BOOTH</strong>
              <small>VRChat向け3D衣装・ギミック作品ページ</small>
            </span>
          </a>

          <a className="link-card" href={SITE.xUrl} target="_blank" rel="noopener noreferrer">
            <span className="link-card-icon" aria-hidden="true">
              <img src="/images/link-icons/x.svg" alt="" width="56" height="56" decoding="async" />
            </span>
            <span className="link-card-body">
              <strong>X</strong>
              <small>制作告知・更新情報・お問い合わせ</small>
            </span>
          </a>
        </div>
      </section>

      <section className="section links-internal" aria-labelledby="site-links-title">
        <div className="section-heading">
          <div>
            <h2 id="site-links-title">サイト内で探す</h2>
          </div>
        </div>
        <div className="links-mini-grid">
          <Link className="links-mini-card" href="/products">
            <strong>BOOTH作品一覧</strong>
            <span>サムネイルから作品を探す</span>
          </Link>
          <Link className="links-mini-card" href="/terms">
            <strong>利用規約</strong>
            <span>使用条件を確認する</span>
          </Link>
          <Link className="links-mini-card" href="/blog">
            <strong>ブログ</strong>
            <span>ブログを確認する</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
