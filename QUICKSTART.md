# クイックスタートガイド

このガイドでは、プロジェクトのセットアップから記事のインポート、ローカル確認、デプロイまでの手順を説明します。

## 🚀 5ステップでブログを立ち上げる

### ステップ1: 依存パッケージのインストール

```bash
pnpm install
```

npm または yarn を使う場合：
```bash
npm install
# または
yarn install
```

### ステップ2: 既存記事のインポート

`ielts_consult` ディレクトリ内のHTMLファイルをMDX形式に変換します。

```bash
pnpm run import:note
```

このコマンドは：
- `ielts_consult/*.html` を走査
- タイトル、本文、日付、タグを抽出
- HTMLをサニタイズ（XSS対策）
- 画像パス修正（`assets/...` → `/assets/...`）
- 学習ステップとスキルを自動分類
- `content/posts/*.mdx` として保存
- `ielts_consult/assets` を `public/assets` にコピー

### ステップ3: 開発サーバーの起動

```bash
pnpm run dev
```

ブラウザで http://localhost:3000 を開いて確認します。

### ステップ4: 確認事項

- ✅ トップページに記事が表示される
- ✅ サイドバーに学習ステップと技能別が表示される
- ✅ 記事詳細ページが表示される
- ✅ noteへのCTAが表示される
- ✅ ダークモードが動作する
- ✅ 検索機能が動作する

### ステップ5: Netlify デプロイ

#### 方法A: GitHub連携（推奨）

1. GitHubにリポジトリをプッシュ
2. Netlifyでサイトを新規作成
3. ビルド設定：
   - **Build command**: `pnpm run build`
   - **Publish directory**: `out`
4. デプロイ完了！

#### 方法B: Netlify CLI

```bash
# Netlify CLI のインストール
npm install -g netlify-cli

# ログイン
netlify login

# 初回デプロイ
netlify init

# 本番デプロイ
netlify deploy --prod
```

## 🎨 デザインのポイント

### ミニマル×indigoテーマ

- **白ベース**: 読みやすさを重視
- **indigoアクセント**: ボタンやリンクに使用
- **ダークモード**: システム設定に自動追従

### カラーコード

```css
/* ライトモード */
--primary: hsl(239 84% 67%);  /* indigo-500 */
--background: hsl(0 0% 100%); /* 白 */

/* ダークモード */
--primary: hsl(239 84% 67%);
--background: hsl(222 47% 11%);
```

## 📂 サイドバー分類

### 学習ステップ（5段階）

| ステップ | 対象 |
|---------|------|
| はじめに | IELTS入門・基礎知識 |
| 基礎 | 基本的な対策と学習法 |
| 中級 | スコア6.0〜7.0を目指す |
| 上級 | スコア7.0以上を目指す |
| 試験直前 | 直前対策とテクニック |

### 技能別（4種類）

- 🎧 Listening
- 📖 Reading
- ✍️ Writing
- 🗣️ Speaking

分類は `config/categories.ts` で管理され、記事のタイトルとタグから自動推定されます。

## 💰 広告設定（オプション）

### 初期状態

広告は **無効** になっています（`ENABLE_ADS=false`）。

### 有効化する場合

Netlifyの環境変数に設定：

```
NEXT_PUBLIC_ENABLE_ADS=true
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT=XXXXXXXXXX
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=your-affiliate-tag
```

## 📝 noteへのCTA

### 表示位置

1. **サイドバー**: 全ページで表示（コンパクト版）
2. **記事詳細**: 記事末尾に表示（詳細版）

### カスタマイズ

`components/note-cta.tsx` でURLとテキストを編集できます。

```typescript
const noteUrl = "https://note.com/ielts_consult/m/m8830a309f830";
```

## 🔍 トラブルシューティング

### 記事が表示されない

```bash
# 再インポート
pnpm run import:note

# キャッシュクリア
rm -rf .next
pnpm run dev
```

### 画像が表示されない

```bash
# assetsディレクトリを確認
ls -la public/assets/

# 記事の画像パスを確認（/assets/... で始まっているか）
```

### ビルドエラー

```bash
# 依存関係を再インストール
rm -rf node_modules
pnpm install
pnpm run build
```

## 📚 次のステップ

1. **記事の追加**: `content/posts/` に新しい `.mdx` ファイルを作成
2. **カテゴリ調整**: `config/categories.ts` で分類ルールを編集
3. **デザインのカスタマイズ**: `tailwind.config.ts` と `app/globals.css`
4. **環境変数の設定**: Netlifyで広告IDを設定

## 🎯 パフォーマンス目標

- Performance: **85+**
- Accessibility: **95+**
- Best Practices: **95+**
- SEO: **95+**

Lighthouse（モバイル）で計測してください。

---

問題が発生した場合は、`SETUP.md` または `README.md` を参照してください。

Happy blogging! 🎉
