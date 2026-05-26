import { notFound } from "next/navigation";
import AdminSlideLinksClient from "@/components/AdminSlideLinksClient";
import { isAdminWriteEnabled } from "@/lib/adminProductsStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "スライドリンク集カード管理",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminSlideLinksPage() {
  if (!isAdminWriteEnabled()) {
    notFound();
  }

  return <AdminSlideLinksClient />;
}
