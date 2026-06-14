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

Current workers.dev URL:

```txt
https://macanon-lab.macanon-vrc.workers.dev
```

Example `.dev.vars`:

```env
# Replace with the final canonical domain before DNS cutover.
NEXT_PUBLIC_SITE_URL=https://macanon-lab.macanon-vrc.workers.dev
MACANON_ENABLE_ADMIN=0
```

`MACANON_ENABLE_ADMIN` must stay disabled for Cloudflare production/preview deployments. The admin UI is still local-only, and admin APIs should return `403` in production.

`wrangler.jsonc` intentionally keeps this as a workers.dev Worker without DNS cutover:

- `name: macanon-lab`
- `workers_dev: true`
- `preview_urls: true`
- no custom domains
- no DNS routes

The `WORKER_SELF_REFERENCE` service binding must reference the same Worker name:

```jsonc
{
  "binding": "WORKER_SELF_REFERENCE",
  "service": "macanon-lab"
}
```

If the binding points at the package name, such as `macanonlab-next`, Wrangler fails with Cloudflare API error `10143` because that Worker does not exist.

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
https://macanon-lab.macanon-vrc.workers.dev
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
- `compatibility_date` is aligned with the remote Worker at `2026-06-06`.

## Robots And Sitemap

`/robots.txt` and `/sitemap.xml` are generated dynamically by App Router route handlers:

- `app/robots.txt/route.js`
- `app/sitemap.xml/route.js`

Both routes derive URLs from `SITE.url` / `NEXT_PUBLIC_SITE_URL`. Before production DNS cutover, set `NEXT_PUBLIC_SITE_URL` to the final canonical domain and re-run the route checklist.
