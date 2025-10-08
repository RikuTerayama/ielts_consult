# セットアップガイド

このドキュメントでは、プロジェクトの初期セットアップから記事のインポート、デプロイまでの手順を詳しく説明します。

## 📋 前提条件

- Node.js 20以上
- pnpm（推奨）、npm、または yarn
- Git

## 🚀 初期セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd ielts-consult-blog
```

### 2. Node.js バージョンの確認

プロジェクトには `.nvmrc` ファイルが含まれています。nvm を使用している場合：

```bash
nvm use
```

### 3. 依存パッケージのインストール

```bash
pnpm install
```

npm または yarn を使用する場合：

```bash
npm install
# または
yarn install
```

## 📝 記事のインポート

### 既存の HTML 記事をインポート

`ielts_consult` ディレクトリに HTML ファイルがある場合、以下のコマンドで MDX 形式に変換できます：

```bash
pnpm run import:note
```

このコマンドは以下の処理を実行します：

1. `ielts_consult/*.html` を走査
2. タイトル、本文、日付、タグを抽出
3. HTML をサニタイズ（XSS対策）
4. 画像パスを修正（`assets/...` → `/assets/...`）
5. `content/posts/*.mdx` として保存
6. `ielts_consult/assets` を `public/assets` にコピー

### インポート後の確認

```bash
# content/posts ディレクトリを確認
ls -la content/posts/

# public/assets ディレクトリを確認
ls -la public/assets/
```

## 🛠️ 開発

### 開発サーバーの起動

```bash
pnpm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認します。

### ホットリロード

ファイルを編集すると、自動的にブラウザがリロードされます。

## 🔧 環境変数の設定

### ローカル開発用

プロジェクトルートに `.env.local` ファイルを作成：

```env
# 広告を有効にする場合
NEXT_PUBLIC_ENABLE_ADS=false

# Google AdSense（本番環境で設定）
# NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
# NEXT_PUBLIC_ADSENSE_SLOT=XXXXXXXXXX

# Amazon アソシエイト（本番環境で設定）
# NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=your-affiliate-tag
```

### 本番環境用（Netlify）

Netlify のダッシュボードで環境変数を設定します。

## 🏗️ ビルド

### 本番ビルドの実行

```bash
pnpm run build
```

このコマンドは以下を実行します：

1. `prebuild` スクリプトで sitemap.xml と rss.xml を生成
2. Next.js で静的サイトをビルド
3. `out` ディレクトリに出力

### ビルドの確認

```bash
# ローカルで本番ビルドを確認
pnpm run start
```

## 🚀 デプロイ

### Netlify へのデプロイ

#### 方法1: Git連携（推奨）

1. GitHubにリポジトリをプッシュ
2. Netlify でサイトを新規作成
3. ビルド設定：
   - **Build command**: `pnpm run build`
   - **Publish directory**: `out`
   - **Node version**: `20`
4. 環境変数を設定（必要に応じて）
5. デプロイ

#### 方法2: Netlify CLI

```bash
# Netlify CLI のインストール
npm install -g netlify-cli

# ログイン
netlify login

# 初回デプロイ
netlify init

# 以降のデプロイ
netlify deploy --prod
```

### デプロイ後の確認

- サイトが正常に表示されるか
- 記事が表示されるか
- 画像が表示されるか
- 検索機能が動作するか
- ダークモードが動作するか

## 📊 SEO & 分析

### サイトマップの生成

```bash
pnpm run generate:sitemap
```

生成されたファイル: `public/sitemap.xml`

### RSS フィードの生成

```bash
pnpm run generate:rss
```

生成されたファイル: `public/rss.xml`

### Google Search Console への登録

1. [Google Search Console](https://search.google.com/search-console) にアクセス
2. サイトを追加
3. サイトマップを送信: `https://ielts-consult.netlify.app/sitemap.xml`

## 🐛 トラブルシューティング

### 記事が表示されない

**原因**: `content/posts` ディレクトリに記事がない

**解決方法**:
```bash
pnpm run import:note
```

### 画像が表示されない

**原因**: 画像が `public/assets` にない、またはパスが間違っている

**解決方法**:
1. `public/assets` ディレクトリを確認
2. 記事内の画像パスが `/assets/...` で始まっているか確認
3. 必要に応じて `pnpm run import:note` を再実行

### ビルドエラー

**エラー例**: `Module not found` または `Cannot find module`

**解決方法**:
```bash
# node_modules を削除して再インストール
rm -rf node_modules
pnpm install

# .next キャッシュを削除
rm -rf .next
pnpm run build
```

### TypeScript エラー

**エラー例**: Type errors

**解決方法**:
```bash
# TypeScript の型チェック
pnpm tsc --noEmit

# エラーを確認して修正
```

### Netlify デプロイエラー

**原因**: ビルドコマンドまたは環境変数の設定ミス

**解決方法**:
1. Netlify のビルドログを確認
2. ローカルで `pnpm run build` を実行してエラーを再現
3. 環境変数が正しく設定されているか確認

## 📚 追加リソース

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [shadcn/ui ドキュメント](https://ui.shadcn.com/)
- [Netlify ドキュメント](https://docs.netlify.com/)

## 💡 ヒント

### 記事の執筆効率化

1. エディタに Markdown プラグインをインストール
2. 画像は先に `public/assets` に配置
3. Frontmatter のテンプレートを用意しておく

### パフォーマンス最適化

1. 画像を適切なサイズに圧縮
2. 不要なコンポーネントは遅延読み込み
3. Lighthouse でパフォーマンスを計測

### セキュリティ

1. 環境変数に秘密情報を保存
2. `.env.local` は Git にコミットしない
3. 定期的に依存パッケージを更新

## 📞 サポート

問題が解決しない場合は、以下の方法でサポートを求めてください：

- GitHub Issues
- Twitter: @ielts_consult
- Email: info@example.com

---

Happy blogging! 🎉
