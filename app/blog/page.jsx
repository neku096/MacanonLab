import Link from "next/link";

export const metadata = {
  title: "ブログ",
  description: "macanonのお知らせ、制作メモ、使い方に関するブログです。"
};

const posts = [
  {
    title: "BOOTH作品をNext.jsで管理しやすくしました",
    excerpt: "商品データを追加するだけでLPと関連商品を生成できる構成へ移行しています。",
    href: "/products"
  },
  {
    title: "利用規約・ライセンス",
    excerpt: "購入前に利用条件、禁止事項、導入上の注意事項をご確認ください。",
    href: "/terms"
  }
];

export default function BlogPage() {
  return (
    <main className="blog-page">
      <section className="section sub-hero">
        <p className="eyebrow">Blog</p>
        <h1>ブログ</h1>
        <p>制作メモ、更新情報、使い方に関する情報をまとめます。</p>
      </section>
      <section className="section article-related" aria-label="ブログ記事">
        <div className="article-related-list">
          {posts.map((post) => (
            <Link className="article-related-item" href={post.href} key={post.title}>
              <span className="article-related-copy">
                <strong>{post.title}</strong>
                <small>{post.excerpt}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
