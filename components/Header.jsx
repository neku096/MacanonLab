import Link from "next/link";
import ShareButton from "@/components/ShareButton";

export default function Header() {
  return (
    <header className="site-header">
      <Link className="brand brand-text" href="/" aria-label="トップへ">
        <img
          className="brand-ocean-logo"
          src="/Macanon_Samune/macanon_Logo_transparent.webp"
          alt="macanon"
          width="1370"
          height="408"
          decoding="async"
        />
        <span className="brand-subtitle">VRChat 3D衣装・ギミック制作</span>
      </Link>
      <div className="header-actions">
        <div className="language-switch" aria-label="Language">
          <button className="language-option" type="button" aria-pressed="true">
            JP
          </button>
          <button className="language-option" type="button" aria-pressed="false">
            EN
          </button>
        </div>
        <ShareButton />
      </div>
      <nav className="nav" aria-label="メインナビゲーション">
        <Link href="/">トップ</Link>
        <Link href="/products">BOOTH作品</Link>
        <Link href="/blog">ブログ</Link>
        <Link href="/terms">利用規約</Link>
      </nav>
    </header>
  );
}
