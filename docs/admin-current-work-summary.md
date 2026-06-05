# MacanonLab Admin / Next.js 作業まとめ

最終更新: 2026-06-01

## 目的

- 既存の公開サイト表示は壊さず、Next.js移行後の運用管理画面を整える。
- `products.json` と `slide-links.json` を安全に管理できるようにする。
- 管理画面の文言を、開発者向けではなく商品登録作業者向けの自然な日本語へ寄せる。
- Topページの商品リンクスライダーを、`data/slide-links.json` で管理できるようにする。

## 現在の大前提

- 公開ページは完成済み扱い。
- admin機能追加のために公開ページの見た目や挙動を変えない。
- `products.json` / `slide-links.json` のキー名は変更しない。
- commit / push はユーザー指示があるまで行わない。
- 現在、未コミット差分が複数テーマで混在しているため、commit時は意味ごとに分割する。

## 実施済み内容

### Next.js移行・旧HTML仕様復元

- 既存HTMLサイトをNext.js App Router構成へ移行。
- `data/products.json` を商品データの中心にした。
- `/products/[slug]` で商品LPを自動生成。
- 商品一覧、関連商品、SEO/OGP、旧 `product-*.html` リダイレクトを整備。
- 旧HTML版に寄せて、トップ、商品一覧、商品詳細、ブログ、利用規約、共有UI、JP/EN切替を調整。

### admin/products

- `/admin/products` を追加。
- 商品一覧、追加、編集、複製、削除、公開切替、タグ編集、関連商品編集、英語データ編集を実装。
- `validate:products` と連携。
- draft商品は公開一覧、sitemap、LP表示から除外される運用を確認。
- 画像入力補助を追加。
  - coverImage
  - gallery src
  - gallery thumb
  - ファイル参照ボタン
  - D&D入力
  - ローカル限定ファイル保存API
  - 本番では保存API 403
- 管理画面上部に `Adminへ戻る` を追加。
- validateボタンを `商品データを確認` に日本語化。
- 管理画面を日本語固定にするため、`data-no-translate` を追加。

### admin/products 文言調整

- 開発者向け表記を管理者向け日本語へ変更。
- 主な変更:
  - `Input Assist` -> `入力補助`
  - `relatedIds候補` -> `関連商品候補`
  - `coverImage` -> `カバー画像`
  - `coverAlt` -> `画像説明文`
  - `gallery` / `gallery画像` -> `商品画像一覧` / `商品画像`
  - `slug / ID` -> `商品ID`
  - `likes` / `人気数` -> `人気順スコア`
  - `対応アバター（カンマ区切り）` -> `対応アバター一覧`
  - `published` -> `公開`
  - `sortOrder` -> `表示順`
- 管理者向け補足を追加。
  - 商品IDはURLや画像フォルダ名に使う。
  - 関連商品は商品詳細ページ下部に表示する商品ID。
  - 人気順スコアは人気順ソートの目安。
  - 画像説明文は画像非表示時やアクセシビリティ用。

### admin/slide-links

- `/admin/slide-links` をTop商品リンクスライダー管理画面として整理。
- Topスライダーのデータ元を `data/slide-links.json` に切り替え。
- `slide-links.json` の初期データを作成。
- `validate:slide-links` を追加。
- TopカードクリックはBOOTH直リンクを維持。
- `/products` と `/products/[slug]` は内部リンク維持。
- ドラッグ&ドロップ並び替えを実装。
- 保存前リアルタイムプレビューを追加。
- カテゴリ分割表示は一度実装したが、Top公開側は以前の1本スライダー表示へ戻した。
- admin内カテゴリフィルターは残している。

### admin/slide-links 文言・複製

- `/admin/slide-links` の英語ラベルを日本語化。
  - `title` -> `タイトル`
  - `description` -> `説明`
  - `url` -> `リンクURL`
  - `thumbnail` -> `サムネイル`
  - `category` -> `カテゴリ`
  - `tags` -> `タグ`
  - `sortOrder` -> `表示順`
  - `published` -> `公開`
  - `openInNewTab` -> `新しいタブで開く`
  - `sourceProductSlug` -> `参照商品`
  - `preview` -> `プレビュー`
  - `published cards` -> `公開カード`
- 各カードに `複製` ボタンを追加。
- 複製仕様:
  - 既存カード内容をコピー。
  - `id` は重複しない新規ID。
  - `title` は `元タイトルのコピー`。
  - `sortOrder` は末尾。
  - `published` は `false`。
  - `sourceProductSlug` / `thumbnail` / `url` / `tags` / `category` / `openInNewTab` は引き継ぎ。
  - 複製後は複製カードを選択。
  - `複製後はタイトル・URL・表示順を確認してください。` を表示。
- EN切替中でもadmin表示が英語化されないよう `data-no-translate` を追加。

### ファイル整理・運用ドキュメント

- legacy資産と現行Next.js構成の関係を整理。
- 商品追加手順を `docs/products/adding-product.md` に分離。
- `docs/admin-workflow.md` を追加。
- admin運用ルールを整理。
  - draft商品追加手順
  - slug命名
  - gallery命名
  - coverImage運用
  - EN title運用
  - relatedIds運用
  - noindex/published運用
  - validate:products の使い方
  - ローカルadmin起動方法
  - 本番admin無効仕様

## 直近の検証結果

直近の作業で確認済み:

```txt
npm.cmd run validate
npm.cmd run build
git diff --check
```

- `validate` 成功。
- `build` 成功。
- `git diff --check` は成功。ただし LF -> CRLF 警告あり。
- `/admin/products` で 1920x1080 / 390px を確認。
- `/admin/slide-links` で複製、validate、preview、console warning/error 0件を確認。

## 現在の未コミット差分

2026-06-01時点の `git status --short`:

```txt
 M components/AdminProductsClient.jsx
 M components/AdminProductsClient.module.css
 M components/AdminSlideLinksClient.jsx
 M components/HomeProductSlider.jsx
 M components/LegacyLanguageBridge.jsx
?? app/api/admin/files/
?? components/AdminFilePathInput.jsx
```

### 差分の大まかな分類

#### admin/products 関連

- `components/AdminProductsClient.jsx`
  - 日本語表記改善。
  - 入力補助。
  - 画像パス入力改善。
  - 商品複製・削除UI。
  - draft説明。
  - `data-no-translate`。

- `components/AdminProductsClient.module.css`
  - admin用UI調整。
  - ファイル入力、複製notice、ボタン配置など。

- `components/AdminFilePathInput.jsx`
  - 画像/ファイルパス入力共通コンポーネント。

- `app/api/admin/files/`
  - ローカルadmin用ファイル保存API。
  - 本番では403想定。

#### admin/slide-links 関連

- `components/AdminSlideLinksClient.jsx`
  - 日本語表記改善。
  - 複製ボタン。
  - preview調整。
  - `data-no-translate`。

#### 公開側・共通に関わる差分

- `components/HomeProductSlider.jsx`
  - Topスライダー挙動やaria-label、openInNewTabなどの修正履歴が混在。
  - 公開側に影響するため、commit前に必ず差分確認が必要。

- `components/LegacyLanguageBridge.jsx`
  - admin領域を翻訳対象外にする `data-no-translate` 対応。
  - 公開側のJP/EN切替に影響しないか要確認。

## 未完了タスク

### 高優先度

- [ ] 未コミット差分を意味ごとに分割する。
  - admin/products文言改善
  - admin/products画像入力改善
  - admin/slide-links文言改善・複製
  - 共通翻訳ブリッジ `data-no-translate`
  - 公開側 `HomeProductSlider` 差分

- [ ] `components/HomeProductSlider.jsx` の差分を再確認する。
  - admin作業のためだけに公開Topが変わっていないか確認。
  - 公開Topはサムネイルだけ表示のままか確認。
  - BOOTH直リンク、ドラッグ、スワイプ、自動送り、openInNewTab が維持されているか確認。

- [ ] `/admin/slide-links` の未使用項目を整理する。
  - `description`
  - `category`
  - `tags`

### 中優先度

- [ ] `slide-links.json` の項目を削除するか判断する。
  - `description`: 公開Top未表示。削除候補。
  - `tags`: 公開Top未表示。削除候補。
  - `category`: 公開Top未表示。ただしadminカテゴリフィルターに使用中。削除は慎重。

- [ ] `validate-slide-links.mjs` の必須項目を見直す。
  - 現在 `description / category / tags` を必須扱いしている。
  - 削除するなら validate からも外す必要あり。

- [ ] `lib/slideLinks.js` の正規化項目を見直す。
  - 現在 `description / category / tags` を整形データに含めている。
  - 公開Topでは未描画。

- [ ] `/admin/slide-links` から未使用編集欄を削るか検討する。
  - 削除する場合は `data/slide-links.json` 構造とvalidateをセットで変更。

### 低優先度

- [ ] admin/products のさらに自然な文言調整。
  - `商品ID` 補足の文言。
  - `商品画像一覧JSON` をさらに隠す/折りたたむか検討。
  - 管理者しか触らないJSON欄を「詳細設定」扱いにするか検討。

- [ ] admin画面の保存前差分確認UI。
  - どのフィールドが変わったか見えるようにする。

- [ ] admin画面の画像アップロード補助をさらに改善。
  - WebP変換は未実装。
  - 画像リネーム補助も未実装。

## slide-links項目 使用状況

### 公開Top表示で実際に使われている項目

`components/HomeProductSlider.jsx` の公開カードで使用:

- `url`
- `thumbnail`
- `title`
- `openInNewTab`
- `thumbnailAlt`
- `thumbnailWidth`
- `thumbnailHeight`

`lib/slideLinks.js` で補完に使う項目:

- `sourceProductSlug`
- `thumbnail`
- `title`
- `url`

`getPublishedSlideLinks()` で表示対象・順番に使う項目:

- `published`
- `sortOrder`

### 現在未表示の項目

以下は `lib/slideLinks.js` で正規化データには含まれるが、公開Topカードでは表示されていない。

- `description`
- `category`
- `tags`

### validateで使われている項目

`scripts/validate-slide-links.mjs` では現在以下が必須:

- `id`
- `title`
- `description`
- `url`
- `thumbnail`
- `category`
- `tags`
- `sortOrder`
- `published`
- `openInNewTab`

任意:

- `slug`
- `sourceProductSlug`

### 削除候補

削除候補:

- `description`
  - 公開Top未表示。
  - admin編集欄以外の意味が薄い。
  - 削除するなら validate必須から外す。

- `tags`
  - 公開Top未表示。
  - admin編集欄以外の意味が薄い。
  - 削除するなら validate必須と配列チェックから外す。

慎重に判断:

- `category`
  - 公開Top未表示。
  - ただし `/admin/slide-links` のカテゴリフィルターに使われている。
  - 削除するならadminフィルターも整理が必要。

## 次にやるならおすすめの順番

1. `slide-links` の未使用項目を削るか決める。
2. 削る場合、まず `description` と `tags` だけを対象にする。
3. `validate-slide-links.mjs` から必須扱いを外す。
4. `AdminSlideLinksClient.jsx` から編集欄を削る。
5. `lib/slideLinks.js` の正規化から未使用項目を外す。
6. `data/slide-links.json` から該当キーを削る。
7. validate/build/browser確認。
8. commitはadmin系と公開側系を分ける。

## 注意点

- まだ削除はしていない。
- 公開ページ変更を避ける方針なので、公開側ファイルを触る場合は必ず理由を明確にする。
- `HomeProductSlider.jsx` は公開Topに直結するため、慎重に扱う。
- admin機能はローカル運用前提。本番でAPI書き込みできない状態を維持する。
- `.env.local` は絶対にstageしない。
