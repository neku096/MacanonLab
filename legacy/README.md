# Legacy Assets

This directory keeps source material from the pre-Next.js static site.

## Layout

- `html/`: preserved legacy HTML pages used by the migration extractor.
- `js/`: legacy browser script from the static HTML site.
- `reference/`: reserved for future comparison notes or screenshots.

## Rules

- Do not import files from this directory at runtime in the Next.js app.
- If product data must be regenerated, use `npm run generate:products`.
- Keep legacy files here as reference material until the Next.js data model fully replaces the old HTML source.
