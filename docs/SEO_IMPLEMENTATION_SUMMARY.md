# SEO修正 実装サマリー

**実施日**: 2026年2月12日  
**目的**: GSCで「リダイレクト」「代替ページ」「重複」「クロール済み-インデックス未登録」になっているURLを、インデックス・配信される状態に修正

---

## 1. 変更ファイル一覧

| ファイル | 変更内容 |
|----------|----------|
| `app/tags/page.tsx` | `robots: { index: true, follow: true }` に変更 |
| `app/tags/[tag]/page.tsx` | noindex解除、`alternates.canonical` 追加、`SITE_URL` インポート |
| `app/skills/[skill]/page.tsx` | noindex解除、`alternates.canonical` 追加、`SITE_URL` インポート |
| `app/steps/[step]/page.tsx` | noindex解除、`alternates.canonical` 追加、`SITE_URL` インポート |
| `app/search/layout.tsx` | `robots: { index: true, follow: true }` に変更 |
| `app/layout.tsx` | OGP画像を絶対URL化（`${SITE_URL}/og-image.png`） |
| `scripts/generate-sitemap.ts` | **SITEMAP_EXCLUDE_PREFIXES を削除**、`/tags`, `/search`, `/steps` を追加、`getAllTags` でタグURLを sitemap に含める |
| `netlify.toml` | SPA fallback（`/* -> /index.html 200`）を削除、`/rss.xml` 用 Content-Type ヘッダー追加 |
| `public/_redirects` | `/posts/n2cd779121111` と `/posts/n2cd779121111/` を 404 に、`/tags/ielts` と `/tags/ielts/` を `/tags/IELTS/` に 301 リダイレクト |

---

## 2. 受け入れ基準の確認結果

### 2.1 ビルド生成物確認

| 項目 | 結果 |
|------|------|
| `out/404.html` | ✅ 存在 |
| `out/sitemap.xml` | ✅ `/tags/`, `/skills/`, `/steps/`, `/search/` を含む |
| `out/rss.xml` | ✅ 存在 |
| `out/_redirects` | ✅ public からコピー済み |

### 2.2 ビルド後の HTML メタ確認（`out/tags/Writing/index.html`）

| 項目 | 結果 |
|------|------|
| `<link rel="canonical" href="https://ieltsconsult.netlify.app/tags/Writing/">` | ✅ |
| `<meta name="robots" content="index, follow">` | ✅（noindex ではない） |
| `<meta property="og:image" content="https://ieltsconsult.netlify.app/og-image.png">` | ✅ 絶対URL |
| `<meta name="twitter:image" content="https://ieltsconsult.netlify.app/og-image.png">` | ✅ 絶対URL |
| `<meta name="twitter:card" content="summary_large_image">` | ✅ |

### 2.3 sitemap 内容確認

- 末尾スラッシュなしURLの混在: **なし**（すべて末尾/付き）
- `/tags/`, `/search/`, `/steps/`, `/skills/`, 各タグURL（`/tags/IELTS/`, `/tags/Task%201/` 等）を含む
- `/search/?q=` を含まない（canonical 統一のため）

---

## 3. デプロイ後の確認コマンド（推奨）

Netlify にデプロイ後、以下を実行して確認してください。

```bash
# 1) /tags/Writing のリダイレクト確認
curl -I "https://ieltsconsult.netlify.app/tags/Writing"
# 期待: 301 → /tags/Writing/（Netlify Pretty URLs の挙動）

# 2) /tags/Writing/ のメタ確認
curl -s "https://ieltsconsult.netlify.app/tags/Writing/" | head -n 80
# 期待: canonical, robots index, og:image absolute URL

# 3) 存在しない記事の 404 確認
curl -I "https://ieltsconsult.netlify.app/posts/n2cd779121111/"
# 期待: 404

# 4) /tags/ielts/ の 301 リダイレクト確認
curl -I "https://ieltsconsult.netlify.app/tags/ielts/"
# 期待: 301 → /tags/IELTS/

# 5) RSS の Content-Type 確認
curl -I "https://ieltsconsult.netlify.app/rss.xml"
# 期待: Content-Type: application/rss+xml
```

---

## 4. 注意事項

- **Netlify の Pretty URLs**: 末尾スラッシュなし URL のリダイレクトは Netlify の Pretty URLs により自動で行われます。ダッシュボードで有効か確認してください。
- **デプロイ後**: 変更が反映されるまで数分かかる場合があります。確認が失敗する場合は、しばらく待ってから再試行してください。
- **検索ページ**: Google は検索結果ページの noindex を推奨する場合があります。インデックス後の状況を GSC で確認し、必要に応じて noindex に戻すことを検討してください。

---

以上
