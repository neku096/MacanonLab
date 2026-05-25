# Adding Products

商品追加は `data/products.json` を正として管理します。通常はローカル管理画面から編集し、必要な場合だけJSONを直接確認します。

## 基本方針

- Next.jsの商品LPは `/products/[slug]` で自動生成されます。
- 商品一覧、関連商品、SEO/OGP、JP/EN切替は `data/products.json` と `data/legacy-i18n.json` を参照します。
- 旧HTMLからの再抽出は移行補助用です。通常運用では `/admin/products` で編集します。

## ローカル管理画面

開発サーバー起動中に次を開きます。

```text
http://localhost:3100/admin/products
```

管理画面では次を編集できます。

- 商品一覧
- 商品追加
- 商品編集
- `published` 切替
- タグ / サブタグ / 対応アバター
- `relatedIds`
- 画像パスとギャラリーJSON
- BOOTH / DLsite / 外部販売URL
- 英語タイトル、説明、specs、本文HTML

保存時は `validate:products` 相当の検証を先に実行します。エラーがある場合は `data/products.json` と `data/legacy-i18n.json` を保存しません。

管理画面はローカル開発環境用です。本番環境では既定で非公開です。どうしても本番で表示確認する場合だけ、環境変数 `MACANON_ENABLE_ADMIN=1` を設定します。

## 追加手順

1. `/admin/products` を開き、「追加」から商品オブジェクトを作成します。
2. `slug` と `id` は同じ値にします。
3. `public/products/<slug>/` に画像を配置します。
4. `coverImage`, `gallery[].src`, `gallery[].thumb` を `/products/<slug>/...` 形式で指定します。
5. `relatedIds` に関連商品IDを指定します。空配列でも動きます。
6. 英語データを入力します。管理画面は `data/legacy-i18n.json` の `productPageEnglish` に `product-<slug>.html` キーとして保存します。
7. `published` を `true` にする前に `npm run validate:products` を実行します。
8. `npm run build` でページ生成を確認します。

## 必須項目

公開商品では次を空にしないでください。

- `title`
- `description`
- `category`
- `categoryLabel`
- `tags`
- `summaryTags`
- `price`
- `support`
- `content`
- `usage`
- `note`
- `coverImage`
- `coverAlt`
- `gallery`
- `salesUrls`
- `legacyPath`
- `contentHtml`

## 画像ルール

- 実体は `public/products/<slug>/` に置きます。
- JSONでは `/products/<slug>/file.webp` のように、先頭 `/` 付きで指定します。
- `coverImage` と `gallery[].src` / `gallery[].thumb` はすべて存在チェックされます。
- WebP推奨です。

## タグとサブタグ

- 通常タグは `tags` に入れ、先頭タグを `category` と合わせます。
- 表示名は `tagLabels` / `subtagLabels` に入れます。
- フィルターで使うタグ名は既存の値に合わせてください。
- 新しいタグ体系を追加する場合は `lib/site.js` も確認してください。

## 英語データ

JP/EN切替のため、公開商品は `data/legacy-i18n.json` の `productPageEnglish` に英語データが必要です。

キーは次の形式です。

```json
"product-example-product.html": {
  "title": "Example Product",
  "pageTitle": "Example Product | macanon",
  "description": "English product description.",
  "summaryTags": ["VRChat", "Unity"],
  "specs": [["Price", "¥0"]],
  "note": "Check the BOOTH product page before purchasing.",
  "detailHtml": "<article class=\"product-detail-block\"><h2>Details</h2><p>English details.</p></article>"
}
```

## Scripts

### `npm run validate:products`

通常運用で使う検証です。

- `slug` 重複
- `title` 重複
- `relatedIds` の存在確認
- 画像存在確認
- 必須項目確認
- 公開商品の不足確認
- 英語キー不足確認
- `contentHtml` 内の broken internal link 確認

### `npm run generate:products`

移行補助用です。

- `legacy/html/booth.html`
- `legacy/html/product-*.html`

を読み取り、`data/products.json` と `public/` 配下の一部アセットを再生成します。

通常の商品追加では、意図せず `products.json` を上書きする可能性があるため注意してください。
