# SEO/テクニカルSEO 現状分析レポート

**対象サイト**: https://ieltsconsult.netlify.app  
**調査日**: 2026年2月12日  
**目的**: GSCで「リダイレクト」「代替ページ（canonicalあり）」「重複」「クロール済み-インデックス未登録」になっているURLの原因特定と、インデックス・配信される状態への修正方針策定

---

## 1. サマリー

1. **リダイレクト16件**: Netlifyの「Pretty URLs」により、末尾スラッシュなしURL（例: `/contact`）が末尾スラッシュあり（`/contact/`）へ301リダイレクトされている。リダイレクト先のページは正規URLとして正しく設定されているが、**tags/skills/steps/search は `robots: { index: false }` により意図的にnoindex** になっており、リダイレクト先もインデックスされない。

2. **代替ページ（canonicalあり）10件**: 末尾スラッシュあり（`/contact/`）や、日本語タグ・URLエンコード版（`/tags/文法/`）が canonical で正規URLを指している。**canonical の指し先が正しいにもかかわらず、インデックスされない主因は、tags/skills/steps の noindex** と、**sitemap からの除外**。

3. **重複（正規未選択）1件**: `/posts/n2cd779121111/` は存在しない記事（note 削除済み）。`generateStaticParams` に含まれず、**Netlify fallback により `/index.html`（トップページ）が200で返る** → ソフト404。

4. **クロール済み-インデックス未登録3件**: `/rss.xml` は Content-Type や X-Robots-Tag の明示なし（要確認）。`/skills/listening` は noindex。`/tags/ielts/` は **小文字のタグパスが存在しない**（正規は `IELTS`）→ `/index.html` が返る可能性あり（ソフト404）。

5. **OGP画像**: `og-image.png` は `public/` に存在し、`metadataBase` により絶対URL化される。**ただし layout の `og:image` は相対パス `/og-image.png`**。Next.js の `metadataBase` により解決されるため、**実装上は問題なし**（ただし検証ツールでの確認推奨）。

---

## 2. 重要ファイル一覧

| ファイル | 役割 |
|----------|------|
| `next.config.mjs` | `output: 'export'`, `trailingSlash: true`, `skipTrailingSlashRedirect: true` |
| `netlify.toml` | ビルド: `out/`, フォールバック: `/*` → `/index.html` (200) |
| `public/_redirects` | HTTP→HTTPS, www→non-www, index.html 除去 |
| `public/robots.txt` | Allow: /, Sitemap 指定 |
| `app/layout.tsx` | ルート metadata（og:image, metadataBase, robots） |
| `app/search/layout.tsx` | 検索ページ: canonical: /search/, **robots: noindex** |
| `app/tags/page.tsx` | タグ一覧: canonical: /tags/, **robots: noindex** |
| `app/tags/[tag]/page.tsx` | タグ別: **robots: noindex**（canonical 未設定） |
| `app/skills/[skill]/page.tsx` | スキル別: **robots: noindex** |
| `app/steps/[step]/page.tsx` | ステップ別: **robots: noindex** |
| `scripts/generate-sitemap.ts` | **SITEMAP_EXCLUDE_PREFIXES** で `/tags`, `/search`, `/steps`, `/skills` を除外 |
| `scripts/generate-rss.ts` | RSS 生成（prebuild で実行） |
| `config/site.ts` | SITE_URL |
| `config/categories.ts` | skill は小文字（listening, reading, writing, speaking）、step は小文字 |
| `lib/tagging.ts` | タグは大文字（IELTS, Writing, Reading 等） |

---

## 3. URL別診断テーブル（30URLを網羅）

| # | URL | URL種別 | 現状ステータス | リダイレクト先 | canonical | robots | 問題分類 | 修正方針 |
|---|-----|----------|----------------|----------------|-----------|--------|----------|----------|
| 1 | /search?q={search_term_string} | リダイレクト | 301→/search/?q= | /search/?q= | /search/ | noindex | ①末尾/正規化＋②noindex | 末尾/リダイレクト統一、noindex解除（検索ページのリスク要検討） |
| 2 | /affiliate-disclosure | リダイレクト | 301→/affiliate-disclosure/ | - | /affiliate-disclosure/ | index | ①末尾/正規化 | リダイレクト先が正規。sitemap に含済。インデックス促進のため追加施策検討 |
| 3 | /contact | リダイレクト | 301→/contact/ | - | /contact/ | index | ①末尾/正規化 | 同上 |
| 4 | /tags/Writing | リダイレクト | 301→/tags/Writing/ | - | 未設定 | noindex | ①末尾/正規化＋②noindex | noindex 解除、canonical 設定 |
| 5 | /privacy | リダイレクト | 301→/privacy/ | - | /privacy/ | index | ①末尾/正規化 | 同上（2） |
| 6 | /skills/writing | リダイレクト | 301→/skills/writing/ | - | 未設定 | noindex | ①末尾/正規化＋②noindex | noindex 解除、canonical 設定 |
| 7 | /posts/n2cd779121111 | リダイレクト | 301→/posts/.../ または fallback | - | - | - | ④存在しない記事 | 404 ページ返却、または 410 Gone |
| 8 | /steps/foundation | リダイレクト | 301→/steps/foundation/ | - | 未設定 | noindex | ①＋② | noindex 解除、canonical 設定 |
| 9 | /steps/exam-prep | リダイレクト | 301→/steps/exam-prep/ | - | 未設定 | noindex | ①＋② | 同上 |
| 10 | /steps/advanced | リダイレクト | 301→/steps/advanced/ | - | 未設定 | noindex | ①＋② | 同上 |
| 11 | /tags/Reading | リダイレクト | 301→/tags/Reading/ | - | 未設定 | noindex | ①＋② | 同上 |
| 12 | /search | リダイレクト | 301→/search/ | - | /search/ | noindex | ①＋② | noindex 解除（検索ページのリスク要検討） |
| 13 | /tags | リダイレクト | 301→/tags/ | - | /tags/ | noindex | ①＋② | noindex 解除（タグ一覧） |
| 14 | /steps/beginner | リダイレクト | 301→/steps/beginner/ | - | 未設定 | noindex | ①＋② | 同上 |
| 15 | /about | リダイレクト | 301→/about/ | - | /about/ | index | ①末尾/正規化 | リダイレクト先が正規。sitemap に含済 |
| 16 | /posts | リダイレクト | 301→/posts/ | - | /posts/ | index | ①末尾/正規化 | 同上 |
| 17 | /search/?q={search_term_string} | 代替ページ | 200 | - | /search/ | noindex | ②noindex＋⑤検索パラメータ | noindex 解除、?q= の canonical 正規化 |
| 18 | /tags/文法 | 代替ページ | 200 | - | /tags/文法/ 相当 | noindex | ②noindex | noindex 解除、canonical 設定 |
| 19 | /tags/Task%201 | 代替ページ | 200 | - | 未確認 | noindex | ②noindex | 同上 |
| 20 | /skills/writing/ | 代替ページ | 200 | - | 未設定 | noindex | ②noindex | noindex 解除、canonical 設定 |
| 21 | /steps/foundation/ | 代替ページ | 200 | - | 未設定 | noindex | ②noindex | 同上 |
| 22 | /steps/advanced/ | 代替ページ | 200 | - | 未設定 | noindex | ②noindex | 同上 |
| 23 | /steps/beginner/ | 代替ページ | 200 | - | 未設定 | noindex | ②noindex | 同上 |
| 24 | /tags/英語学習 | 代替ページ | 200 | - | 未確認 | noindex | ②noindex | 同上 |
| 25 | /tags/語彙 | 代替ページ | 200 | - | 未確認 | noindex | ②noindex | 同上 |
| 26 | /tags/Task%202 | 代替ページ | 200 | - | 未確認 | noindex | ②noindex | 同上 |
| 27 | /posts/n2cd779121111/ | 重複 | 200（index.html） | - | - | - | ④存在しない記事＋ソフト404 | 404 ページ返却、または 410 Gone |
| 28 | /rss.xml | クロール済み未登録 | 200 | - | - | - | ⑥rss のヘッダ/薄い内容 | Content-Type, X-Robots-Tag 確認、必要なら noindex 維持 |
| 29 | /skills/listening | クロール済み未登録 | 301→/skills/listening/ | - | 未設定 | noindex | ①＋② | noindex 解除、canonical 設定 |
| 30 | /tags/ielts/ | クロール済み未登録 | 200（index.html） | - | - | - | ③大文字小文字不一致 | 小文字→大文字 301 リダイレクト、または 404 |

**問題分類凡例**  
① 末尾/正規化ミスによる重複・代替ページ  
② canonical が別URLを指している / noindex によるインデックス阻害  
③ リダイレクトチェーン / 大文字小文字不一致  
④ 検索パラメータの正規化不足 / 存在しない記事  
⑤ OGP画像のパス/サイズ/ヘッダ不備  
⑥ noindex/X-Robots-Tag が付与されている / rss のヘッダ不備  
⑦ sitemap に正規URLが入っていない/混在  

---

## 4. 最小差分で直す実装方針（優先度付き）

### 優先度1（必須）

1. **存在しない記事の404/410対応**  
   - `/posts/n2cd779121111` と `/posts/n2cd779121111/` は Netlify fallback で index.html が返る。  
   - 静的エクスポートでは `notFound()` が 404 ページを生成するが、`generateStaticParams` に含まれない slug はビルド時に404ページが生成されない。  
   - **対応**: Netlify の `_redirects` で該当パスを 404 または 410 に明示リダイレクトするか、または 404 用 HTML を返すルールを追加。

2. **tags/skills/steps/search の noindex 解除**  
   - 現状: `robots: { index: false, follow: false }` により意図的にnoindex。  
   - **対応**: インデックスさせたい場合は `robots: { index: true, follow: true }` に変更。  
   - **検索ページ**: Google は検索結果ページの noindex を推奨する場合がある。インデックスさせる場合のリスク（薄いコンテンツ、重複URL）を検討し、noindex 維持の選択肢も残す。

3. **tags/skills/steps の canonical 設定**  
   - 現状: `generateMetadata` で canonical が設定されていない。  
   - **対応**: 各ページで `alternates.canonical` を正規URL（末尾スラッシュ付き）で設定。

### 優先度2（推奨）

4. **sitemap に tags/skills/steps/search を追加**  
   - 現状: `SITEMAP_EXCLUDE_PREFIXES` で除外。  
   - **対応**: noindex 解除と併せて、sitemap に正規URLを追加する。

5. **/tags/ielts/ の大文字小文字正規化**  
   - タグは `IELTS`（大文字）で生成されるが、`/tags/ielts/` でアクセスされると `out/tags/ielts/` が存在せず fallback で index.html が返る。  
   - **対応**: Netlify の `_redirects` で `/tags/ielts` → `/tags/IELTS` を 301 リダイレクト、または 404 を返す。

6. **rss.xml のヘッダー確認**  
   - Content-Type: `application/rss+xml`、必要に応じて X-Robots-Tag を設定。  
   - 現状: `netlify.toml` の `[[headers]]` は `/*` にのみ適用。`/rss.xml` 専用の Content-Type や X-Robots-Tag は未確認。  
   - **対応**: `_headers` または `netlify.toml` で `/rss.xml` に Content-Type と X-Robots-Tag を設定。RSS をインデックスさせない場合は `X-Robots-Tag: noindex` を付与。

### 優先度3（検討）

7. **末尾スラッシュの明示的リダイレクト**  
   - Netlify の Pretty URLs により既に `/path` → `/path/` のリダイレクトが行われている。  
   - 明示的な `_redirects` ルールを追加するかは、現状の挙動確認後に判断。

8. **検索パラメータ付きURLの canonical 正規化**  
   - `/search/?q=xxx` の canonical を `/search/` に統一するか、`?q=` を無視するか検討。  
   - 検索ページを noindex にする場合は、canonical 設定の優先度は下げる。

9. **OGP画像の絶対URL化の確認**  
   - 現状: `metadataBase` により相対パスは解決される想定。  
   - 検証ツール（Facebook Debugger、Twitter Card Validator）で確認し、問題があれば絶対URLに変更。

### 検索ページのリスクと代替案

- **リスク**: 検索結果ページは Google が noindex を推奨する場合がある（薄いコンテンツ、重複、パラメータの組み合わせ爆発）。  
- **代替案**:  
  - noindex を維持し、検索ページはインデックス対象外とする。  
  - インデックスさせる場合は、`/search/` のみを canonical とし、`?q=` 付きURLは canonical で `/search/` を指す。  
  - 現状の search ページは「検索機能を準備中」のため、内容が薄い。インデックスさせる場合の価値は低い可能性あり。

---

## 5. 変更が必要なファイルと修正内容の要約

| ファイル | 修正内容 |
|----------|----------|
| `app/tags/[tag]/page.tsx` | `robots: { index: true, follow: true }` に変更。`alternates.canonical` を正規URL（`${SITE_URL}/tags/${encodeURIComponent(tag)}/`）で設定。 |
| `app/tags/page.tsx` | `robots: { index: true, follow: true }` に変更。 |
| `app/skills/[skill]/page.tsx` | `robots: { index: true, follow: true }` に変更。`alternates.canonical` を `${SITE_URL}/skills/${skill}/` で設定。 |
| `app/steps/[step]/page.tsx` | `robots: { index: true, follow: true }` に変更。`alternates.canonical` を `${SITE_URL}/steps/${step}/` で設定。 |
| `app/search/layout.tsx` | インデックスさせる場合: `robots: { index: true, follow: true }` に変更。検索ページのリスクを考慮し、noindex 維持も選択肢。 |
| `scripts/generate-sitemap.ts` | `SITEMAP_EXCLUDE_PREFIXES` から `/tags`, `/search`, `/steps`, `/skills` を削除するか、条件を変更して sitemap に含める。 |
| `public/_redirects` | `/posts/n2cd779121111` と `/posts/n2cd779121111/` を 404 または 410 にリダイレクト。`/tags/ielts` と `/tags/ielts/` を `/tags/IELTS/` に 301 リダイレクト（タグ存在時）。 |
| `netlify.toml` または `public/_headers` | `/rss.xml` に `Content-Type: application/rss+xml` を設定。RSS をインデックスさせない場合は `X-Robots-Tag: noindex` を付与。 |
| `lib/tagging.ts`（検討） | タグの大文字小文字を統一（例: `ielts` → `IELTS`）し、URL の一貫性を保つ。 |

---

## 6. 追加確認事項（未確認）

- [ ] curl 等で各URLの実際の HTTP ステータスコード・リダイレクト先・レスポンスヘッダを確認（PowerShell での curl 実行に失敗したため、手動確認推奨）
- [ ] `/rss.xml` のレスポンスヘッダ（Content-Type, X-Robots-Tag 等）
- [ ] `og-image.png` の実サイズ（推奨: 1200×630）と Content-Type
- [ ] Netlify の Pretty URLs 設定が有効かどうか（ダッシュボードで確認）
- [ ] `/tags/ielts/` にアクセスした際の実際のレスポンス（index.html が返るか、404 か）

---

## 7. ルーティング・配信形態の整理

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 14 |
| ビルド | `output: 'export'`（静的エクスポート） |
| ホスティング | Netlify（`publish: "out"`） |
| ルーティング | App Router（`app/`） |
| trailingSlash | `true`（全URL末尾スラッシュ付き） |
| 動的ルート | `posts/[slug]`, `tags/[tag]`, `skills/[skill]`, `steps/[step]` |
| `dynamicParams` | すべて `false`（未定義パスは 404） |

---

*このレポートはコード変更を行わず、現状分析のみを実施したものです。実装は次のターンで行います。*
