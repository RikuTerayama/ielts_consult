# プロジェクト構造

このドキュメントでは、プロジェクトのディレクトリ構造と各ファイルの役割を説明します。

## 📁 ディレクトリ構造

```
ielts-consult-blog/
├── app/                          # Next.js App Router
│   ├── api/                      # API ルート
│   │   └── posts/                # 記事データAPI
│   │       └── route.ts          # 全記事取得エンドポイント
│   ├── posts/                    # 記事ページ
│   │   ├── [slug]/               # 動的ルート
│   │   │   └── page.tsx          # 記事詳細ページ
│   │   └── page.tsx              # 記事一覧ページ
│   ├── tags/                     # タグページ
│   │   ├── [tag]/                # 動的ルート
│   │   │   └── page.tsx          # タグ別記事一覧
│   │   └── page.tsx              # タグ一覧ページ
│   ├── search/                   # 検索ページ
│   │   └── page.tsx              # 検索機能
│   ├── about/                    # Aboutページ
│   │   └── page.tsx
│   ├── contact/                  # お問い合わせページ
│   │   └── page.tsx
│   ├── privacy/                  # プライバシーポリシー
│   │   └── page.tsx
│   ├── disclaimer/               # 免責事項
│   │   └── page.tsx
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # トップページ
│   ├── globals.css               # グローバルスタイル
│   └── not-found.tsx             # 404ページ
│
├── components/                   # Reactコンポーネント
│   ├── ui/                       # shadcn/ui ベースコンポーネント
│   │   ├── button.tsx            # ボタン
│   │   ├── card.tsx              # カード
│   │   ├── input.tsx             # 入力フォーム
│   │   └── badge.tsx             # バッジ
│   ├── header.tsx                # ヘッダー
│   ├── footer.tsx                # フッター
│   ├── hero-section.tsx          # ヒーローセクション
│   ├── post-card.tsx             # 記事カード
│   ├── sidebar.tsx               # サイドバー
│   ├── ad-slot.tsx               # 広告スロット
│   ├── amazon-product-card.tsx   # Amazon商品カード
│   ├── theme-provider.tsx        # テーマプロバイダー
│   └── theme-toggle.tsx          # ダークモード切り替え
│
├── lib/                          # ユーティリティ関数
│   ├── posts.ts                  # 記事データ取得・管理
│   ├── search.ts                 # 検索機能
│   └── utils.ts                  # 汎用ユーティリティ
│
├── scripts/                      # ビルドスクリプト
│   ├── import-note-posts.ts      # HTML→MDX変換スクリプト
│   ├── generate-sitemap.ts       # サイトマップ生成
│   └── generate-rss.ts           # RSS生成
│
├── content/                      # 記事コンテンツ (Git管理外)
│   ├── posts/                    # MDXファイル
│   │   ├── n2d360aa73005.mdx
│   │   ├── n1a971fb03450.mdx
│   │   └── ...
│   └── README.md                 # コンテンツディレクトリの説明
│
├── public/                       # 静的ファイル
│   ├── assets/                   # 画像 (Git管理外)
│   │   ├── *.png
│   │   └── ...
│   ├── robots.txt                # クローラー制御
│   ├── sitemap.xml               # サイトマップ（自動生成）
│   └── rss.xml                   # RSSフィード（自動生成）
│
├── ielts_consult/                # 元記事データ（インポート元）
│   ├── *.html                    # 既存のHTML記事
│   └── assets/                   # 元画像
│       └── *.png
│
├── package.json                  # 依存パッケージ定義
├── tsconfig.json                 # TypeScript設定
├── tailwind.config.ts            # Tailwind CSS設定
├── postcss.config.mjs            # PostCSS設定
├── next.config.mjs               # Next.js設定
├── netlify.toml                  # Netlifyデプロイ設定
├── .gitignore                    # Git除外ファイル
├── .nvmrc                        # Node.jsバージョン指定
├── .editorconfig                 # エディタ設定
├── .prettierrc                   # Prettier設定
├── .eslintrc.json                # ESLint設定
├── README.md                     # プロジェクト概要
├── SETUP.md                      # セットアップガイド
├── CONTRIBUTING.md               # コントリビューションガイド
├── LICENSE                       # ライセンス
└── PROJECT_STRUCTURE.md          # このファイル
```

## 🎯 主要ファイルの役割

### Next.js App Router

| ファイル | 役割 |
|---------|------|
| `app/layout.tsx` | 全ページ共通のレイアウト、メタデータ、テーマプロバイダー |
| `app/page.tsx` | トップページ（最新記事・人気記事） |
| `app/posts/[slug]/page.tsx` | 記事詳細ページ（動的ルート） |
| `app/posts/page.tsx` | 記事一覧ページ |
| `app/tags/[tag]/page.tsx` | タグ別記事一覧（動的ルート） |
| `app/search/page.tsx` | クライアントサイド検索ページ |

### コンポーネント

| コンポーネント | 役割 |
|--------------|------|
| `components/header.tsx` | サイトヘッダー、ナビゲーション |
| `components/footer.tsx` | サイトフッター、リンク集 |
| `components/post-card.tsx` | 記事カード（一覧表示用） |
| `components/sidebar.tsx` | サイドバー（新着・タグ） |
| `components/ad-slot.tsx` | 広告スロット（AdSense対応） |
| `components/amazon-product-card.tsx` | Amazon商品カード |

### ユーティリティ

| ファイル | 役割 |
|---------|------|
| `lib/posts.ts` | 記事の取得、フィルタリング、ソート |
| `lib/search.ts` | FlexSearchを使った全文検索 |
| `lib/utils.ts` | 日付フォーマット、スラッグ化など |

### スクリプト

| スクリプト | 役割 | 実行コマンド |
|----------|------|------------|
| `scripts/import-note-posts.ts` | HTML→MDX変換 | `pnpm run import:note` |
| `scripts/generate-sitemap.ts` | サイトマップ生成 | `pnpm run generate:sitemap` |
| `scripts/generate-rss.ts` | RSSフィード生成 | `pnpm run generate:rss` |

## 🔄 データフロー

### 記事データの流れ

```
1. 既存HTML記事 (ielts_consult/*.html)
   ↓
2. インポートスクリプト (scripts/import-note-posts.ts)
   ↓
3. MDXファイル (content/posts/*.mdx)
   ↓
4. 記事取得関数 (lib/posts.ts)
   ↓
5. ページコンポーネント (app/posts/[slug]/page.tsx)
   ↓
6. ブラウザ表示
```

### ビルドフロー

```
1. pnpm run build
   ↓
2. prebuild: サイトマップ・RSS生成
   ↓
3. Next.js ビルド
   ↓
4. 静的ファイル生成 (out/)
   ↓
5. Netlify デプロイ
```

## 🎨 スタイリング

### Tailwind CSS

- ユーティリティファースト
- カスタムテーマ（`tailwind.config.ts`）
- ダークモード対応

### CSS変数

グローバルスタイル（`app/globals.css`）でCSS変数を定義：

- `--background`
- `--foreground`
- `--primary`
- `--secondary`
- など

## 🔐 環境変数

| 変数名 | 用途 | 設定場所 |
|-------|------|---------|
| `NEXT_PUBLIC_ENABLE_ADS` | 広告の有効/無効 | Netlify |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSenseクライアントID | Netlify |
| `NEXT_PUBLIC_ADSENSE_SLOT` | AdSenseスロットID | Netlify |
| `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` | Amazonアフィリエイトタグ | Netlify |

## 📦 依存パッケージ

### 主要な依存関係

| パッケージ | 用途 |
|----------|------|
| `next` | Reactフレームワーク |
| `react` | UIライブラリ |
| `tailwindcss` | CSSフレームワーク |
| `lucide-react` | アイコンライブラリ |
| `gray-matter` | Frontmatterパーサー |
| `sanitize-html` | HTMLサニタイズ |
| `flexsearch` | 全文検索エンジン |
| `next-themes` | ダークモード管理 |

## 🚀 デプロイ

### 静的エクスポート

Next.js の `output: 'export'` を使用して静的サイトとして生成。

### Netlify

- ビルドコマンド: `pnpm run build`
- 公開ディレクトリ: `out`
- Node.js バージョン: 20

## 📊 パフォーマンス最適化

1. **画像最適化**: Next.js Image（ただし静的エクスポートでは制限あり）
2. **コード分割**: 動的import、lazy loading
3. **CSS最小化**: Tailwind CSS のパージ機能
4. **キャッシュ**: 静的ファイルのブラウザキャッシュ

## 🔍 SEO対策

1. **メタデータ**: 各ページで適切なメタデータ設定
2. **サイトマップ**: 自動生成（`public/sitemap.xml`）
3. **RSS**: 自動生成（`public/rss.xml`）
4. **構造化データ**: BlogPostingスキーマ
5. **OGP/Twitter Card**: SNSシェア最適化

## 📱 レスポンシブデザイン

Tailwind CSS のブレークポイント：

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

このプロジェクト構造により、保守性が高く、拡張しやすいブログサイトを実現しています。