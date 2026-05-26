# Admin Products Workflow

`/admin/products` は、`data/products.json` と `data/legacy-i18n.json` を安全に編集するためのローカル専用管理画面です。

## 基本ルール

- 商品追加・編集は原則 `/admin/products` から行います。
- 直接JSONを編集した場合も、必ず `npm.cmd run validate:products` を通してから commit します。
- 管理画面の保存処理は、保存前に `validate:products` 相当の検証を実行します。
- `products.json` は2スペース整形で保存します。巨大diffを避けるため、自動sortや自動バックアップファイル生成は現時点では行いません。
- 商品の表示順は配列の並びではなく `sortOrder` で管理します。

## Draft商品追加手順

1. ローカルで開発サーバーを起動します。

   ```powershell
   npm.cmd run dev -- -p 3100
   ```

2. ブラウザで次を開きます。

   ```text
   http://localhost:3100/admin/products
   ```

3. 「追加」から新規商品を作成します。
4. `published:false` のまま、本文・画像・タグ・英語データを入力します。
5. `public/products/<slug>/` に画像を配置します。
6. 管理画面の画像warningと validate 結果を確認します。
7. 公開前に `published:true` へ切り替え、`npm.cmd run validate:products` と `npm.cmd run build` を通します。

## 既存商品の複製手順

1. 複製元の商品を選択し、「複製」を押します。
2. 複製された商品は `published:false`、`<slug>-copy` 系の仮slug、`(Copy)` 付きタイトルになります。
3. warningに従い、保存前に `slug`, `title`, 画像パスを実商品用に変更します。
4. slug変更時は `coverImage`, `gallery`, 英語キーも候補更新されます。
5. 保存前に管理画面の validate と画像warningを確認します。

## Slug命名ルール

- `slug` と `id` は同じ値にします。
- 小文字英数字とハイフンのみを使います。
- 例: `shark-summon`, `mirilori-uniform`, `dark-knight`
- 旧HTML互換URLは `legacyPath: "/product-<slug>.html"` にします。
- slug変更時は、`coverImage`, `gallery`, `legacyPath`, 英語キー `product-<slug>.html` も同時に更新されているか確認します。

## Gallery命名ルール

- 商品画像は `public/products/<slug>/` に置きます。
- JSONでは `/products/<slug>/file.webp` のように、先頭 `/` 付きの public path を指定します。
- galleryは次の命名を基本にします。

  ```text
  /products/<slug>/<slug>-01.webp
  /products/<slug>/<slug>-01-thumb.webp
  /products/<slug>/<slug>-02.webp
  /products/<slug>/<slug>-02-thumb.webp
  ```

- `gallery[].src` は重複させないでください。
- `gallery[].thumb` はサムネイル用の軽い画像を指定します。
- `width` と `height` は整数で入れます。

## CoverImage運用

- coverは原則 `/products/<slug>/cover.webp` にします。
- `coverImage` は空にしません。
- 公開商品では実ファイルの存在チェックを通します。
- 管理画面で missing warning が出た場合は、画像配置またはパスを修正します。

## EN title運用

- 英語データは `data/legacy-i18n.json` の `productPageEnglish` に保存されます。
- キーは `product-<slug>.html` です。
- `title`, `pageTitle`, `description`, `summaryTags`, `specs`, `detailHtml` を公開前に確認します。
- EN title が未入力の場合は、管理画面の候補を仮入力として使い、公開前に自然な英語へ整えます。

## RelatedIds運用

- `relatedIds` には関連商品の `id` を入れます。
- 自分自身の `id` は入れません。
- 存在しない `id` は `validate:products` でエラーになります。
- 商品削除時は、他商品の `relatedIds` に残った参照も削除されることを確認します。
- `relatedIds` が空の場合、商品LPではタグ・サブタグが近い公開商品が自動表示されます。

## Noindex / Published運用

`published:false` の商品は draft 扱いです。

- 商品一覧には表示されません。
- `generateStaticParams()` に含まれないため、公開用商品LPとして生成されません。
- `/products/[slug]` へ直接アクセスしても `notFound()` になります。
- metadata上も未公開商品は `robots: { index: false, follow: false }` 扱いです。
- sitemapは公開商品のみを対象にします。
- draft の公開URLをブラウザやHTTPで確認した時に `404` になるのは正常です。
- ブラウザconsoleでは main document の `404` が error として記録される場合がありますが、draft 非公開確認としてはHTTP status `404` を見ます。

公開する時は `published:true` にしたうえで、公開商品向け必須項目、英語データ、画像実体、販売URLを確認してください。

## validate:products の使い方

```powershell
npm.cmd run validate:products
```

現在の主な検証内容:

- `slug` 重複
- `title` 重複
- `title` 空欄
- `description` 空欄
- `coverImage` 空欄
- 公開商品の必須項目不足
- 公開商品の英語キー不足
- 公開商品の画像存在確認
- `gallery[].src` 重複
- `relatedIds` 存在確認
- `contentHtml` 内の broken internal link

成功時は商品数、公開商品数、画像確認数、内部リンク確認数が表示されます。

## ローカルadmin起動方法

固定ポートで確認する場合:

```powershell
npm.cmd run dev -- -p 3100
```

Windowsで簡単に開く場合:

```text
preview-next.bat
```

起動後:

```text
http://localhost:3100/admin/products
```

## 本番admin無効仕様

- `NODE_ENV=production` では、既定で admin API と admin 画面は無効です。
- 本番で明示的に有効化する場合のみ `MACANON_ENABLE_ADMIN=1` を使います。
- 通常運用では本番adminを有効化しません。
- 本番反映は GitHub / Vercel の通常デプロイフローで行います。

## Commit前チェック

```powershell
npm.cmd run validate:products
npm.cmd run build
git -c safe.directory=D:/Codex/MacanonLab diff --check
git -c safe.directory=D:/Codex/MacanonLab status --short
```

注意:

- `package.json` には現時点で `lint` / `typecheck` script はありません。未定義は失敗扱いにせず、必要になった段階で追加します。
- `data/products.json` と `data/legacy-i18n.json` に意図しない差分が出ていないか、commit前に必ず確認します。
- 管理画面で保存テストをしただけの draft は、検証後に差分を残さないよう戻すか、意図した作業として別commitに分けます。
