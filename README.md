# 外資系コンサルの英語力底上げブログ

IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログサイトです。

## 🎨 デザインコンセプト

- **ミニマル白ベース**: 読みやすさを重視したクリーンなデザイン
- **indigoアクセント**: 信頼感と洗練さを表現するindigoカラー
- **日本語最適化**: 禁則処理、行間、可読幅を最適化

## 🚀 技術スタック

- **Framework**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS（indigoアクセント）
- **UI Components**: shadcn/ui
- **デプロイ**: Netlify
- **SEO**: Metadata API, sitemap.xml, robots.txt, RSS
- **検索**: FlexSearch（クライアントサイド全文検索）

## 📦 セットアップ

### 0. Node.js バージョンの確認

このプロジェクトは **Node.js 20.x** が必要です。

```bash
# バージョン確認
node -v  # v20.x.x と表示されるはず

# 20.x でない場合
nvm install 20
nvm use 20
```

詳細は `LOCAL_DEV.md` を参照してください。

### 1. 依存パッケージのインストール

```bash
pnpm install
```

または npm/yarn を使用する場合:

```bash
npm install
# または
yarn install
```

### 2. 既存記事のインポート

既存の `ielts_consult/*.html` ファイルを MDX 形式に変換して取り込みます。

```bash
pnpm run import:note
```

このコマンドは以下の処理を行います：

- `ielts_consult/*.html` を走査してタイトル・本文・日付を抽出
- HTML をサニタイズ（危険なインラインJSを除去）
- 画像パス `assets/...` を `/assets/...` に修正
- `content/posts/*.mdx` として保存
- `ielts_consult/assets` を `public/assets` にコピー

### 3. 開発サーバーの起動

```bash
pnpm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてサイトを確認できます。

### 4. 本番ビルド

```bash
pnpm run build
```

ビルドが完了すると、`out` ディレクトリに静的ファイルが生成されます。

## 📝 記事の管理

### 記事の追加

1. `content/posts/` ディレクトリに `.mdx` ファイルを作成
2. Frontmatter を記述：

```yaml
---
title: "記事のタイトル"
date: "2025-01-08"
description: "記事の説明文"
tags: ["IELTS", "Writing", "英語学習"]
hero: "/assets/hero-image.png"
slug: "article-slug"
---
```

3. 本文を Markdown または HTML で記述

### 画像の追加

画像は `public/assets/` ディレクトリに配置し、記事内で `/assets/image-name.png` のように参照します。

## 🎨 カスタマイズ

### サイト情報の変更

`app/layout.tsx` でサイトのメタデータを編集できます：

- サイト名
- 説明文
- OGP情報
- Twitter Card 設定

### テーマカラーの変更

`tailwind.config.ts` と `app/globals.css` でカラーパレットをカスタマイズできます。

### ダークモード

システム設定に応じて自動的にダークモードが適用されます。ヘッダーのトグルボタンで手動切り替えも可能です。

## 💰 マネタイズ設定

### Google AdSense

1. Netlify の環境変数に以下を設定：

```
NEXT_PUBLIC_ENABLE_ADS=true
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT=XXXXXXXXXX
```

2. 広告は以下の位置に自動表示されます：
   - トップページ（記事一覧の間）
   - サイドバー
   - 記事詳細（冒頭・本文末）

### Amazon アソシエイト

1. Netlify の環境変数に設定：

```
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=your-affiliate-tag
```

2. `AmazonProductCard` コンポーネントを使用して商品カードを表示：

```tsx
import { AmazonProductCard } from "@/components/amazon-product-card";

<AmazonProductCard
  title="商品名"
  asin="B08XXXXXX"
  price="¥2,980"
  description="商品の説明"
  imageUrl="/assets/product-image.png"
/>
```

## 🔍 SEO対策

### 自動生成されるもの

- `sitemap.xml`: `pnpm run generate:sitemap` で生成
- `rss.xml`: `pnpm run generate:rss` で生成（ビルド前に実行推奨）
- `robots.txt`: 既に `public/` に配置済み

### 構造化データ

記事詳細ページには自動的に BlogPosting スキーマが適用されます。

### OGP & Twitter Card

各ページで適切なメタデータが設定され、SNSシェア時に最適化されます。

## 🚀 デプロイ

### Netlify へのデプロイ

1. GitHub リポジトリにプッシュ
2. Netlify でサイトを作成
3. ビルド設定：
   - **Build command**: `pnpm run build`
   - **Publish directory**: `out`
4. 環境変数を設定（必要に応じて）
5. デプロイ完了

### カスタムドメインの設定

Netlify のダッシュボードから独自ドメインを設定できます。デフォルトは `ielts-consult.netlify.app` です。

## 🗂️ サイドバー分類

### 学習ステップ（5段階）

- **はじめに**: IELTS入門・基礎知識
- **基礎**: 基本的な対策と学習法
- **中級**: スコア6.0〜7.0を目指す
- **上級**: スコア7.0以上を目指す
- **試験直前**: 直前対策とテクニック

### 技能別（4種類）

- 🎧 **Listening**: リスニング対策
- 📖 **Reading**: リーディング対策
- ✍️ **Writing**: ライティング対策
- 🗣️ **Speaking**: スピーキング対策

分類は `config/categories.ts` で管理されており、記事のタイトルとタグから自動推定されます。

## 📝 noteへのCTA

### 表示位置

1. **サイドバー**: 全ページで表示（コンパクト版）
2. **記事詳細**: 記事末尾に表示（詳細版）

### カスタマイズ

`components/note-cta.tsx` でURLとテキストを編集できます。

## 📊 アクセス解析（オプション）

Google Analytics を使用する場合：

1. 環境変数に `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` を設定
2. `app/layout.tsx` に Google Analytics スクリプトを追加

## 🛠️ トラブルシューティング

### 記事が表示されない

- `content/posts/` ディレクトリに `.mdx` ファイルがあるか確認
- Frontmatter の形式が正しいか確認
- `pnpm run import:note` を再実行

### 画像が表示されない

- 画像が `public/assets/` にあるか確認
- パスが `/assets/...` で始まっているか確認

### ビルドエラー

- `pnpm install` で依存関係を再インストール
- `node_modules` と `.next` を削除してから再ビルド

## 📚 ディレクトリ構造

```
ielts-consult-blog/
├── app/                    # Next.js App Router
│   ├── api/                # API ルート
│   ├── posts/              # 記事ページ
│   ├── tags/               # タグページ
│   ├── search/             # 検索ページ
│   ├── about/              # Aboutページ
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # トップページ
├── components/             # Reactコンポーネント
│   ├── ui/                 # shadcn/ui コンポーネント
│   ├── header.tsx
│   ├── footer.tsx
│   ├── post-card.tsx
│   ├── ad-slot.tsx
│   └── ...
├── lib/                    # ユーティリティ関数
│   ├── posts.ts            # 記事データ取得
│   ├── search.ts           # 検索機能
│   └── utils.ts            # 汎用関数
├── scripts/                # ビルドスクリプト
│   ├── import-note-posts.ts  # 記事インポート
│   ├── generate-sitemap.ts   # サイトマップ生成
│   └── generate-rss.ts       # RSS生成
├── content/                # 記事コンテンツ (Git管理外)
│   └── posts/              # MDXファイル
├── public/                 # 静的ファイル
│   ├── assets/             # 画像 (Git管理外)
│   ├── robots.txt
│   ├── sitemap.xml
│   └── rss.xml
├── ielts_consult/          # 元記事データ
│   ├── *.html
│   └── assets/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── netlify.toml
└── README.md
```

## 🤝 コントリビューション

記事の追加・修正は `content/posts/` ディレクトリで管理します。プルリクエストを歓迎します。

## 📄 ライセンス

MIT License

## 📞 お問い合わせ

- サイト: https://ielts-consult.netlify.app
- Twitter: @ielts_consult

---

**次のステップ:**

1. `pnpm install` で依存関係をインストール
2. `pnpm run import:note` で既存記事をインポート
3. `pnpm run dev` で開発サーバーを起動
4. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

Happy blogging! 🎉
