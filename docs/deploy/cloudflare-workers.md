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

Set `NEXT_PUBLIC_SITE_URL` for the Cloudflare preview URL.

Example `.dev.vars`:

```env
NEXT_PUBLIC_SITE_URL=https://macanon-lab-preview.example.workers.dev
MACANON_ENABLE_ADMIN=0
```

`MACANON_ENABLE_ADMIN` must stay disabled for Cloudflare production/preview deployments. The admin UI is still local-only, and admin APIs should return `403` in production.

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
- Images render correctly, including Next image optimized URLs.
- Download/static distribution files, if any, are reachable.
- Admin remains unavailable in production mode.
- Vercel production remains unchanged and can be kept as rollback.

## Current Concerns

- Local admin JSON write APIs use filesystem access and are not intended for Cloudflare production.
- No R2 incremental cache is configured in this validation branch.
- Cloudflare Images is not configured in this preview-only branch. Re-check `/_next/image` behavior before remote deploy or DNS cutover.
- `next.config.mjs` sets `output: "standalone"` for the OpenNext build path. Confirm this has no unwanted Vercel production impact before merging this branch into the production branch.
