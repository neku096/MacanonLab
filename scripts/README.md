# Scripts

Maintenance scripts for the Next.js migration live here.

## Product Data

- `extract-legacy-products.mjs`
  - Reads `legacy/html/booth.html` and `legacy/html/product-*.html`.
  - Regenerates `data/products.json`.
  - Copies product and shared assets into `public/`.

- `validate-products.mjs`
  - Validates `data/products.json` for safe product operations.
  - Checks required fields, duplicate slugs/titles, image paths, related products, English product keys, and internal links.

The old `tools/extract-products.mjs` path remains as a thin compatibility wrapper.
