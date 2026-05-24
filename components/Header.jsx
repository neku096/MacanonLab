"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ShareButton from "@/components/ShareButton";

export default function Header() {
  const pathname = usePathname();
  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

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
          <button className="language-option" type="button" data-language-option="ja" aria-pressed="true">
            JP
          </button>
          <button className="language-option" type="button" data-language-option="en" aria-pressed="false">
            EN
          </button>
        </div>
        <ShareButton />
      </div>
      <nav className="nav" aria-label="メインナビゲーション">
        <Link href="/" aria-current={isActive("/") ? "page" : undefined}>
          トップ
        </Link>
        <Link href="/products" aria-current={isActive("/products") ? "page" : undefined}>
          BOOTH作品
        </Link>
        <Link href="/blog" aria-current={isActive("/blog") ? "page" : undefined}>
          ブログ
        </Link>
        <Link href="/terms" aria-current={isActive("/terms") ? "page" : undefined}>
          利用規約
        </Link>
      </nav>
    </header>
  );
}
