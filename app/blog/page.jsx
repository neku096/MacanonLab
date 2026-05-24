import BlogFilterPanel from "@/components/BlogFilterPanel";

export const metadata = {
  title: "Blog",
  description: "macanonのVRChat、Unity、Modular Avatar向けTips、商品レビュー、制作ブログ記事一覧です。タグで絞り込みできます。"
};

export default function BlogPage() {
  return (
    <main className="text-page tips-list-page blog-list-page">
      <section className="section text-section" aria-labelledby="blog-title">
        <div className="section-heading">
          <div>
            <h1 id="blog-title">Blog</h1>
          </div>
        </div>
        <BlogFilterPanel />
      </section>
    </main>
  );
}
