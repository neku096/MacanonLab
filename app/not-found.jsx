import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section className="section sub-hero">
        <p className="eyebrow">404</p>
        <h1>ページが見つかりません</h1>
        <p>公開されていない商品、または移動したページの可能性があります。</p>
        <Link className="button primary" href="/products">
          BOOTH作品一覧へ
        </Link>
      </section>
    </main>
  );
}
