import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${getSiteUrl("/sitemap.xml")}`
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
