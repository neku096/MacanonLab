import { notFound } from "next/navigation";
import AdminProductsClient from "@/components/AdminProductsClient";
import { isAdminWriteEnabled } from "@/lib/adminProductsStore";

export const dynamic = "force-dynamic";

const adminRobots = {
  index: false,
  follow: false
};

export function generateMetadata() {
  return {
    title: isAdminWriteEnabled() ? "商品管理 | macanon" : "404 | macanon",
    robots: adminRobots
  };
}

export default function AdminProductsPage() {
  if (!isAdminWriteEnabled()) {
    notFound();
  }

  return <AdminProductsClient />;
}
