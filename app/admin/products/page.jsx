import AdminProductsClient from "@/components/AdminProductsClient";
import { isAdminWriteEnabled } from "@/lib/adminProductsStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "商品管理",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminProductsPage() {
  if (!isAdminWriteEnabled()) {
    return (
      <main className="section">
        <div className="product-detail-block">
          <h1>商品管理</h1>
          <p>この管理画面はローカル開発環境専用です。</p>
        </div>
      </main>
    );
  }

  return <AdminProductsClient />;
}
