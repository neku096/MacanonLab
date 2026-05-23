import ProductsBrowser from "@/components/ProductsBrowser";
import { getFilterOptions, getPublishedProducts } from "@/lib/products";

export const metadata = {
  title: "BOOTH作品一覧",
  description: "macanonのVRChat向け3D衣装、召喚ギミック、アクセサリーを商品サムネイルから確認できます。"
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const products = getPublishedProducts();
  const options = getFilterOptions();
  const tagParam = params?.tag || "all";
  const tagFilter = options.tags.includes(tagParam) ? tagParam : "all";
  const subtagFilter = params?.subtag || (options.subtags.includes(tagParam) ? tagParam : "all");
  const avatarFilter = params?.avatar || (options.avatars.includes(tagParam) ? tagParam : "all");

  return (
    <main className="booth-list-page">
      <section className="section booth-list-section" aria-label="BOOTH作品一覧">
        <div className="section-heading booth-list-heading">
          <div>
            <h1>BOOTH作品一覧</h1>
            <p className="booth-list-lead">商品をサムネイルから確認できます。</p>
          </div>
        </div>
        <ProductsBrowser
          products={products}
          options={options}
          initialFilters={{
            tag: tagFilter,
            subtag: subtagFilter,
            avatar: avatarFilter,
            sort: params?.sort || "default"
          }}
        />
      </section>
    </main>
  );
}
