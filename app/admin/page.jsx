import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "@/components/AdminProductsClient.module.css";
import { isAdminWriteEnabled } from "@/lib/adminProductsStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  if (!isAdminWriteEnabled()) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Local Admin</p>
          <h1>Admin</h1>
          <p>ローカルJSONを手入力で管理します。</p>
        </div>
      </header>

      <section className={styles.editor} aria-label="管理メニュー">
        <Link className={styles.productItem} href="/admin/products">
          <span>商品管理</span>
          <small>data/products.json と商品LP情報を編集</small>
        </Link>
        <Link className={styles.productItem} href="/admin/slide-links">
          <span>スライドリンク集カード管理</span>
          <small>data/slide-links.json を編集</small>
        </Link>
      </section>
    </main>
  );
}
