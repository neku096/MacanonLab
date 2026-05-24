# MacanonLab

Next.js App Router へ移行した macanon のローカル開発用メモです。

## ローカルプレビュー

Windowsでは、プロジェクト直下の `preview-next.bat` をダブルクリック、またはPowerShell / コマンドプロンプトから実行してください。

```bat
preview-next.bat
```

このbatは次の動作をします。

- 既定ポート `3200` から起動します。
- `3200` が使用中の場合は、`3201`, `3202`, `3203`... の順に空きポートを探します。
- 空きポートで `npm run dev -- -p <port>` を別ウィンドウで起動します。
- 起動確認後、`http://localhost:<port>` のトップページだけをブラウザで開きます。
- 既にこのプロジェクトのNext.js previewが起動している場合は、既存のトップページを開きます。
- エラー時は画面がすぐ閉じないように停止します。

## 初回セットアップ

`node_modules` が無い場合、batは起動せずに `npm install` を促します。

```bash
npm install
```

その後、もう一度 `preview-next.bat` を実行してください。

## .next が壊れた場合

開発サーバーのキャッシュが壊れているように見える場合は、すべてのNext.jsサーバーを停止してから `.next` を削除してください。

```bat
rmdir /s /q .next
```

削除後、再度 `preview-next.bat` を実行すると `.next` は自動で再生成されます。

## 手動コマンド

通常のNext.jsコマンドもそのまま使えます。

```bash
npm run dev
npm run build
npm run start
```

商品データを既存HTMLから再生成する場合は次を実行します。

```bash
npm run generate:products
```
