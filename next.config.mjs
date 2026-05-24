const productRedirects = [
  "capybara-summon",
  "catmask",
  "cravingdance",
  "dark-knight",
  "galhalo",
  "mini-whale",
  "mirilori-uniform",
  "monsterchair",
  "restraint-system",
  "shark-summon",
  "star-guardian",
  "whale-summon"
].map((slug) => ({
  source: `/product-${slug}.html`,
  destination: `/products/${slug}`,
  permanent: true
}));

const pageRedirects = [
  { source: "/booth.html", destination: "/products", permanent: true },
  { source: "/blog.html", destination: "/blog", permanent: true },
  { source: "/links.html", destination: "/links", permanent: true },
  { source: "/terms.html", destination: "/terms", permanent: true },
  { source: "/tips.html", destination: "/blog", permanent: true },
  { source: "/pr.html", destination: "/", permanent: true },
  { source: "/booth", destination: "/products", permanent: true }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_PREVIEW_DIST_DIR ? { distDir: process.env.NEXT_PREVIEW_DIST_DIR } : {}),
  async redirects() {
    return [...productRedirects, ...pageRedirects];
  }
};

export default nextConfig;
