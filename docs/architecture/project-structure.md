# Project Structure

## Active Next.js App

- `app/`: App Router pages and route metadata.
- `components/`: shared UI components.
- `data/`: product and legacy i18n data consumed by the app.
- `data/products.json`: current product source for listing pages, LP pages, related products, and SEO metadata.
- `data/product-template.json`: template for adding a new product.
- `lib/`: product/site helper functions.
- `public/`: runtime assets served by Next.js.
- `styles.css`: active shared site styles imported by `app/layout.jsx`.
- `app/next.css`: Next.js-specific bridge and page adjustments.

## Migration Sources

- `legacy/html/`: old static HTML snapshots used as extraction input.
- `legacy/js/`: old static-site JavaScript retained for comparison.
- `scripts/extract-legacy-products.mjs`: maintained extractor for regenerating product data.
- `scripts/validate-products.mjs`: validation script for current product operations.
- `tools/extract-products.mjs`: compatibility wrapper for the old script path.

## Legacy vs Current

- Current runtime pages are generated from `app/`, `components/`, `data/products.json`, and `public/`.
- Legacy HTML is preserved only as migration/reference input under `legacy/html/`.
- `npm run generate:products` is a migration helper that reads legacy HTML and can overwrite `data/products.json`.
- `npm run validate:products` is the normal operation check before adding or publishing products.
- For day-to-day product additions, edit `data/products.json` directly and follow `docs/products/adding-product.md`.

## Root Files

### Active

- `package.json`
- `package-lock.json`
- `next.config.mjs`
- `jsconfig.json`
- `preview-next.bat`
- `README.md`
- `.env.example`
- `.gitignore`
- `.gitattributes`
- `.nojekyll`

### Source / Compatibility

- `images/`: source images used by the extractor before copying to `public/`.
- `Macanon_Samune/`: source top-page and OGP images used by the extractor.
- root favicon / manifest / robots / sitemap files: source copies mirrored into `public/`.

## Do Not Move Without Rechecking

- `styles.css`: imported directly by `app/layout.jsx`.
- `public/`: active runtime asset paths such as `/products/...`, `/Macanon_Samune/...`, and `/images/...`.
- `data/products.json`: canonical product data for the Next.js pages.
- `data/legacy-i18n.json`: used by the language bridge.
