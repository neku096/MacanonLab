# Deploy Notes

The production app is the Next.js app, not the legacy HTML files.

## Expected Runtime Paths

- `/`
- `/products`
- `/products/[slug]`
- `/blog`
- `/links`
- `/terms`

## Legacy Redirects

Legacy `.html` URLs are handled by `next.config.mjs` redirects. The physical HTML files live under `legacy/html/` and are not runtime pages.

## Local Preview

Use:

```bat
preview-next.bat
```

The preview starts on fixed port `3100` and opens:

- `http://localhost:3100/`
- `http://localhost:3100/products`
