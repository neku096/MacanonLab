import "../styles.css";
import "./next.css";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegacyLanguageBridge from "@/components/LegacyLanguageBridge";
import { SITE } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`
  },
  description: SITE.description,
  applicationName: SITE.name,
  verification: {
    google: "t030Yl6f4yLzRK-yLO4CXP_zbh9gt84ytZpVyXrnwos"
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=20260516", sizes: "any" },
      { url: "/favicon-32x32.png?v=20260516", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png?v=20260516", type: "image/png", sizes: "16x16" }
    ],
    apple: [{ url: "/apple-touch-icon.png?v=20260516", sizes: "180x180" }]
  },
  manifest: "/site.webmanifest?v=20260516",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    url: "/",
    description: SITE.description,
    images: [
      {
        url: "/Macanon_Samune/ogp-v2.png",
        width: 1200,
        height: 630,
        alt: "macanon"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/Macanon_Samune/ogp-v2.png"]
  }
};

export const viewport = {
  themeColor: "#dff9ff"
};

const ENABLE_CLOUDFLARE_INSIGHTS =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_ENABLE_CLOUDFLARE_INSIGHTS === "1";

export default function RootLayout({ children }) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <Header />
        {children}
        <Footer />
        <LegacyLanguageBridge />
        {ENABLE_CLOUDFLARE_INSIGHTS ? (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon='{"token":"149708549118473db17c4d3f09c570b6"}'
          />
        ) : null}
      </body>
    </html>
  );
}
