import { getPublishedProducts } from "@/lib/products";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const staticRoutes = [
  { path: "/", priority: "1.0" },
  { path: "/products", priority: "0.9" },
  { path: "/blog", priority: "0.6" },
  { path: "/links", priority: "0.6" },
  { path: "/terms", priority: "0.5" }
];

export function GET() {
  const productRoutes = getPublishedProducts().map((product) => ({
    path: `/products/${product.slug}`,
    priority: "0.75"
  }));
  const urls = [...staticRoutes, ...productRoutes];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      ({ path, priority }) => `  <url>
    <loc>${getSiteUrl(path)}</loc>
    <priority>${priority}</priority>
  </url>`
    ),
    "</urlset>"
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  });
}
