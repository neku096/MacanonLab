# Cleanup Candidates

These are candidates only. Do not delete them until the references are checked again.

## Asset Duplicates

- Root `android-chrome-192x192.png`, `android-chrome-512x512.png`, `apple-touch-icon.png`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `robots.txt`, `site.webmanifest`, `sitemap.xml`
  - Runtime copies also exist under `public/`.
  - Keep while the extractor mirrors root assets into `public/`.

- Root `images/` and `Macanon_Samune/`
  - Currently used as source folders by `scripts/extract-legacy-products.mjs`.
  - Runtime copies live under `public/`.
  - Safe deletion requires changing the extractor to read from `public/` or another source folder.

## Legacy Sources

- `legacy/html/`
  - Still used by `npm run generate:products`.
  - Do not delete until product data is fully maintained without HTML extraction.

- `legacy/js/script.js`
  - Not imported by the Next.js app.
  - Keep while comparing old UI behavior or recovering static-site logic.

## Ignored Backups

- `codex-backups/`
  - Ignored by git.
  - Keep locally if needed, but avoid uploading folder-based deploys that include ignored local files.

## Later Cleanup Ideas

- Replace HTML extraction with direct edits to `data/products.json`.
- Move source asset folders under a clearly named non-runtime directory.
- Remove `tools/extract-products.mjs` after no scripts or docs reference the old path.
- Decide whether root source assets should move under `legacy/reference/` or a dedicated `source-assets/` directory.
