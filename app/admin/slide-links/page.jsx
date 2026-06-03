import { notFound } from "next/navigation";
import AdminSlideLinksClient from "@/components/AdminSlideLinksClient";
import { isAdminWriteEnabled } from "@/lib/adminProductsStore";

export const dynamic = "force-dynamic";

const adminRobots = {
  index: false,
  follow: false
};

export function generateMetadata() {
  return {
    title: isAdminWriteEnabled() ? "スライドリンク集カード管理 | macanon" : "404 | macanon",
    robots: adminRobots
  };
}

export default function AdminSlideLinksPage() {
  if (!isAdminWriteEnabled()) {
    notFound();
  }

  return <AdminSlideLinksClient />;
}
