# Cloudflare Workers + OpenNext Preview

This branch is for migration validation only. Do not switch DNS or merge to production until the checklist below is complete.

## Goal

- Keep the current Vercel production flow intact.
- Build a Cloudflare Workers preview using OpenNext.
- Preserve the public UI and routes:
  - `/`
  - `/products`
  - `/products/[slug]`
  - `/blog`
  - `/terms`
  - legacy `product-*.html` redirects

## Environment

Set `NEXT_PUBLIC_SITE_URL` for the Cloudflare preview URL. This value is used by Next.js metadata through `lib/site.js`; it does not affect the existing Vercel production deployment unless this branch is merged and the environment variable is set there.

Current remote preview:

```txt
https://macanon-lab-preview.macanon-vrc.workers.dev
```

Example `.dev.vars`:

```env
# Replace with the final canonical domain before DNS cutover.
NEXT_PUBLIC_SITE_URL=https://macanon-lab-preview.macanon-vrc.workers.dev
MACANON_ENABLE_ADMIN=0
```

`MACANON_ENABLE_ADMIN` must stay disabled for Cloudflare production/preview deployments. The admin UI is still local-only, and admin APIs should return `403` in production.

`wrangler.jsonc` intentionally keeps this as a workers.dev preview worker:

- `workers_dev: true`
- `preview_urls: true`
- no custom domains
- no DNS routes

## Commands

```bash
npm run validate
npm run build
npm run preview
```

Deployment is intentionally separate:

```bash
npm run cf-typegen
npm run upload
npm run deploy
```

Do not deploy to the production domain from this branch.

`npm run preview`, `npm run upload`, and `npm run deploy` run the Cloudflare build step first. This project uses `next build --webpack` for the Cloudflare build path because the Windows preview path has been more reliable than Turbopack here.

## Cloudflare Preview URLs To Check

- `/`
- `/products`
- `/products/shark-summon`
- `/blog`
- `/terms`
- `/robots.txt`
- `/sitemap.xml`
- `/product-shark-summon.html`
- `/admin`
- `/api/admin/files`
- `/api/admin/products`
- `/api/admin/slide-links`

## Expected Admin Behavior

- Production-equivalent `/admin` routes: `404`
- Production-equivalent admin APIs: `403`
- No persistent admin writes on Cloudflare in this migration phase

## Pre-DNS Cutover Checklist

- Cloudflare preview renders all public pages without UI regressions.
- Top slider, product gallery, related products, JP/EN toggle, and share modal work.
- Legacy redirects work.
- `/robots.txt` and `/sitemap.xml` are reachable.
- `/robots.txt` and `/sitemap.xml` use the final canonical domain instead of the current GitHub Pages URLs.
- Images render correctly, including Next image optimized URLs.
- Download/static distribution files, if any, are reachable.
- Admin remains unavailable in production mode.
- Vercel production remains unchanged and can be kept as rollback.
- Confirm `output: "standalone"` in `next.config.mjs` has no unwanted impact before merging into the production branch.
- Confirm the desired Cloudflare Images strategy before DNS cutover.

## Remote Preview Result

Checked remote Workers preview:

```txt
https://macanon-lab-preview.macanon-vrc.workers.dev
```

- Public pages returned `200`.
- Legacy `/product-shark-summon.html` redirected to `/products/shark-summon`.
- `/admin` returned `404`.
- Admin APIs returned `403`.
- Static images and `/_next/image` returned `200`.
- JP/EN switching, product gallery interaction, and browser console warning/error checks passed.

## Current Concerns

- Local admin JSON write APIs use filesystem access and are not intended for Cloudflare production.
- No R2 incremental cache is configured in this validation branch.
- `next.config.mjs` sets `output: "standalone"` for the OpenNext build path. Confirm this has no unwanted Vercel production impact before merging this branch into the production branch.
- Cloudflare Images is not configured in this preview-only branch. Remote preview returned `200` for `/_next/image`, so keep image binding out of this migration commit. If image optimization needs Cloudflare Images later, handle it as a separate task.
- OpenNext prints a Windows compatibility warning. The reliable Windows path for this repo remains `next build --webpack` followed by `opennextjs-cloudflare build --skipNextBuild`.
- Wrangler warns that `compatibility_date: "2024-12-30"` could be updated to a newer date. Keep it unchanged in this preview stabilization pass because changing it may alter runtime behavior. Candidate follow-up: test a newer compatibility date in a separate branch after re-running the full route checklist.

## Robots And Sitemap

`public/robots.txt` and `public/sitemap.xml` currently contain the existing GitHub Pages URL:

```txt
https://neku096.github.io/MacanonLab
```

Do not change these to the Cloudflare workers.dev preview URL. Before production DNS cutover, replace them with the final canonical domain or migrate to dynamic Next.js generation:

- `app/robots.js`
- `app/sitemap.js`

Dynamic generation would let the files derive URLs from `SITE.url` / `NEXT_PUBLIC_SITE_URL`, but it should be reviewed separately because it changes how public metadata files are produced.
