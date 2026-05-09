# ドラム打ち込み診断 LIFF Web App

LINE公式アカウントのリッチメニューから開く前提の、ローカル処理のみで動く診断アプリです。

## ファイル構成

- `index.html`: 画面構造とLIFF SDK読み込み
- `styles.css`: スマホ最適化した白背景ベースのUI
- `app.js`: 質問表示、スコア計算、結果表示、LIFF終了処理
- `package.json`: 構文チェック用スクリプトとプロジェクト情報
- `vercel.json`: Vercel公開時の静的サイト設定

## LIFF ID設定

`app.js` の先頭にある `LIFF_ID` を、LINE Developersで作成したLIFF IDに差し替えてください。

```js
const LIFF_ID = "YOUR_LIFF_ID";
```

ローカル確認だけなら、このままでも診断機能は動きます。

## LINE送信機能

結果画面の「結果をLINEに送る」ボタンは、LIFF内で開いた場合のみ表示されます。LIFF外の通常ブラウザで開いた場合は非表示になります。

送信にはLIFFの `liff.sendMessages()` を使っています。LINE DevelopersのLIFF設定で、スコープに `chat_message.write` を含めてください。

送信される内容は以下です。

- ドラム打ち込み診断結果
- スコア
- レベル
- デモ音源URL

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
- `package.json`
- `vercel.json`
- `.gitignore`

`.vercel/` や `node_modules/` は `.gitignore` で除外しています。

## 動作

- 1問ずつ表示
- ボタンタップで次へ進む
- Q6のデモ音源URLはスコア対象外
- 合計16点満点で結果を表示
- LIFF内では結果をLINEトークへ送信
- LIFF内では「LINEに戻る」で `liff.closeWindow()` を実行
