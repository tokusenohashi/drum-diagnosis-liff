# ドラム打ち込み診断 LIFF Web App

LINE公式アカウントのリッチメニューから開く前提の、ローカル処理のみで動く診断アプリです。

## ファイル構成

- `index.html`: 画面構造とLIFF SDK読み込み
- `styles.css`: スマホ最適化した白背景ベースのUI
- `app.js`: 質問表示、スコア計算、結果表示、LIFF終了処理
- `gas-doPost.gs`: Google Apps Script側の保存処理サンプル
- `package.json`: 構文チェック用スクリプトとプロジェクト情報
- `vercel.json`: Vercel公開時の静的サイト設定

## LIFF ID設定

`app.js` の先頭にある `LIFF_ID` を、LINE Developersで作成したLIFF IDに差し替えてください。

```js
const LIFF_ID = "YOUR_LIFF_ID";
```

ローカル確認だけなら、このままでも診断機能は動きます。

## Googleスプレッドシート保存設定

診断完了時に、Google Apps ScriptのWebアプリURLへ結果をPOST送信します。保存先URLは `app.js` の先頭にある `GAS_WEB_APP_URL` を差し替えてください。

```js
const GAS_WEB_APP_URL = "YOUR_GAS_WEB_APP_URL";
```

保存される項目は以下です。

- 送信日時
- LINE表示名
- スコア
- レベル
- Q1〜Q5の回答内容

LIFF外で開いた場合、LINE表示名は空欄で保存されます。

LINE表示名の取得にはLIFFの `profile` スコープが必要です。LINE DevelopersのLIFF設定で `profile` を有効にしてください。

### Google Apps Script手順

1. Googleスプレッドシートを新規作成します。
2. メニューから「拡張機能」→「Apps Script」を開きます。
3. このリポジトリの `gas-doPost.gs` の内容をApps Scriptへ貼り付けます。
4. Apps Script画面右上の「デプロイ」→「新しいデプロイ」を選びます。
5. 種類は「ウェブアプリ」を選びます。
6. 「実行するユーザー」は「自分」を選びます。
7. 「アクセスできるユーザー」は運用方針に合わせて選びます。まず動作確認する場合は「全員」を選ぶとLIFFからPOSTできます。
8. デプロイ後に発行されるWebアプリURLをコピーします。
9. `app.js` の `GAS_WEB_APP_URL` に貼り付けます。
10. Vercelへ再デプロイします。

Apps Script側では、`diagnosis_results` というシートが自動作成され、初回保存時に見出し行が入ります。

ブラウザからGoogle Apps Scriptへ送る都合上、アプリ側は `fetch()` の `no-cors` モードで送信しています。そのため、送信リクエストがブラウザ上で完了した場合に「結果を保存しました」と表示します。

## LINE送信機能

結果画面の「結果をLINEに送る」ボタンは、LIFF内で開いた場合のみ表示されます。LIFF外の通常ブラウザで開いた場合は非表示になります。

送信にはLIFFの `liff.sendMessages()` を使っています。LINE DevelopersのLIFF設定で、スコープに `chat_message.write` を含めてください。

送信される内容は以下です。

- ドラム打ち込み診断結果
- スコア
- レベル

`liff.sendMessages()` は、LIFFアプリを開いたトークルームへユーザーのメッセージとして送信します。最近使用したサービスから再表示された場合など、LINE側の条件によって送信できないケースがあります。

## Vercel公開手順

このアプリはHTML/CSS/Vanilla JavaScriptのみで構成されているため、Vercelでは静的サイトとして公開できます。Firebaseやサーバー処理は不要です。

1. GitHubにこのフォルダの内容をアップロードします。
2. Vercelで「Add New Project」からGitHubリポジトリを選択します。
3. Framework Presetは「Other」のままで問題ありません。
4. Build Commandは空欄、Output Directoryも空欄のままにします。
5. Deployを実行します。
6. 公開されたVercel URLを、LINE DevelopersのLIFFエンドポイントURLに設定します。
7. LINE公式アカウントのリッチメニューに、そのLIFF URLを設定します。

公開後、本番用のLIFF IDに差し替える場所は `app.js` の先頭です。

```js
const LIFF_ID = "YOUR_LIFF_ID";
```

`YOUR_LIFF_ID` を、LINE Developersで発行されたLIFF IDに変更してください。

## GitHubに上げる前の確認

現時点でGitHubに含める想定のファイルは以下です。

- `index.html`
- `styles.css`
- `app.js`
- `README.md`
- `gas-doPost.gs`
- `package.json`
- `vercel.json`
- `.gitignore`

`.vercel/` や `node_modules/` は `.gitignore` で除外しています。

## 動作

- 1問ずつ表示
- ボタンタップで次へ進む
- 合計15点満点で結果を表示
- 診断完了時にGoogleスプレッドシートへ保存
- LIFF内では結果をLINEトークへ送信
- LIFF内では「LINEに戻る」で `liff.closeWindow()` を実行
