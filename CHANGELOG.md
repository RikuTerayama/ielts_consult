# 変更履歴

## v1.0.0 (2025-01-08)

### 🎉 初期リリース

#### 追加機能

- **デザイン**: ミニマル白ベース × indigoアクセントテーマ
- **レイアウト**: ヘッダー、フッター、サイドバー付きレスポンシブレイアウト
- **記事管理**: MDX形式でHTML/Markdown対応
- **サイドバー分類**:
  - 学習ステップ（はじめに/基礎/中級/上級/試験直前）
  - 技能別（Listening/Reading/Writing/Speaking）
- **noteへのCTA**: サイドバーと記事詳細に配置
- **検索機能**: FlexSearchによるクライアントサイド全文検索
- **広告対応**: AdSense、Amazonアソシエイトのプレースホルダー
- **SEO対策**:
  - Metadata API
  - サイトマップ自動生成
  - RSSフィード
  - OGP/Twitter Card
  - 構造化データ（BlogPosting）
- **アクセシビリティ**: ARIA属性、キーボード操作、適切なコントラスト
- **ダークモード**: システム設定追従 + 手動切り替え
- **日本語最適化**: 禁則処理、適切な行間、可読幅

#### ページ

- `/`: トップページ（最新記事、人気記事）
- `/posts`: 記事一覧
- `/posts/[slug]`: 記事詳細
- `/tags`: タグ一覧
- `/tags/[tag]`: タグ別記事一覧
- `/steps/[step]`: 学習ステップ別記事一覧
- `/skills/[skill]`: 技能別記事一覧
- `/search`: 検索ページ
- `/about`: このサイトについて
- `/contact`: お問い合わせ
- `/privacy`: プライバシーポリシー
- `/disclaimer`: 免責事項
- `/affiliate-disclosure`: アフィリエイト開示

#### スクリプト

- `import:note`: HTML記事をMDX形式に変換
- `generate:sitemap`: サイトマップ生成
- `generate:rss`: RSSフィード生成

#### 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- FlexSearch
- gray-matter
- sanitize-html
- Netlify (デプロイ)

---

## 今後の予定

### v1.1.0

- [ ] Google Analytics統合
- [ ] 記事のページネーション
- [ ] 関連記事の精度向上
- [ ] コメント機能（Giscus等）

### v1.2.0

- [ ] 記事の目次自動生成（スクロールハイライト付き）
- [ ] 画像の遅延読み込み最適化
- [ ] プログレスバー（記事読了率）
- [ ] ブックマーク機能

### v2.0.0

- [ ] Contentlayer導入
- [ ] 記事の執筆者プロフィール
- [ ] シリーズ記事機能
- [ ] インタラクティブクイズ機能

---

貢献やフィードバックは [GitHub Issues](https://github.com/your-repo/issues) でお願いします。
