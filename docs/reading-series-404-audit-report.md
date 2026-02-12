# 【読む順】記事 一覧表示・遷移不具合 監査レポート

**作成日**: 2026-02-12  
**目的**: 「記事一覧ページから【読む順】の記事が表示されない／記事カードをクリックしても遷移しない」不具合の原因特定と最小改修のための監査  
**結論**: **修正は既に適用済み。** 現行コード・ビルドでは一覧表示・遷移ともに正常。不具合が継続する場合はデプロイ・キャッシュの要確認。

---

## 1. 現状整理（症状の分類）

| 症状 | 想定原因 | 調査結果 |
|------|----------|----------|
| 【読む順】記事が一覧に出てこない | データ取得・フィルタ・除外条件 | **データは取得済み**。`getAllPosts` にフィルタなし。全24件（【読む順】8件含む）取得。 |
| カードクリックで遷移しない | href 不正・404・encode 不備 | **修正済み**。`encodePostSlugForPath` で `#`→`%2523` に二重エンコード。検証スクリプトで全件 OK。 |
| 404 になる | 静的生成されていない・パス不一致 | **生成済み**。`out/posts/【読む順%231｜...】/` 等 8 件すべて存在。 |

**検証スクリプト結果（2026-02-12）:**

```
NG件数（decode1 で存在しない）: 0 件
existsByDecode1: 24 件
✅ 全記事の index.html が decode1 パスで out/posts 配下に存在します。
```

---

## 2. 【読む順】記事の実体一覧

### 2.1 ファイルパス・推定 slug・メタ

| # | ファイルパス | 推定 slug | 日付 |
|---|--------------|-----------|------|
| 1 | `content/posts/【読む順#1｜基礎語彙】IELTS英単語3500の使い方：4技能に効く最短ルーティン.html` | `【読む順#1｜基礎語彙】IELTS英単語3500の使い方：4技能に効く最短ルーティン` | 2025-12-23 |
| 2 | `content/posts/【読む順#2｜テーマ語彙】分野別IELTS英単語の使い方：Task2-Part3で語彙を点に変える.html` | `【読む順#2｜テーマ語彙】分野別IELTS英単語の使い方：Task2-Part3で語彙を点に変える` | - |
| 3 | `content/posts/【読む順#3｜口が回る土台】瞬間英作文シャッフル：毎日10分でFluencyを底上げ.html` | `【読む順#3｜口が回る土台】瞬間英作文シャッフル：毎日10分でFluencyを底上げ` | - |
| 4 | `content/posts/【読む順#4｜面接の型】IELTSスピーキング完全対策：Part1〜3をテンプレ化して7.0へ.html` | `【読む順#4｜面接の型】IELTSスピーキング完全対策：Part1〜3をテンプレ化して7.0へ` | - |
| 5 | `content/posts/【読む順#5｜独学ライティング】IELTSライティング徹底攻略：添削なしで6.5を狙う型と反復.html` | `【読む順#5｜独学ライティング】IELTSライティング徹底攻略：添削なしで6.5を狙う型と反復` | - |
| 6 | `content/posts/【読む順#6｜模試の回し方】公認IELTS模試3回分：解きっぱなしを卒業する復習設計.html` | `【読む順#6｜模試の回し方】公認IELTS模試3回分：解きっぱなしを卒業する復習設計` | - |
| 7 | `content/posts/【読む順#7｜実戦強化】Cambridge-IELTS-18：本番レベルで得点感覚を固める.html` | `【読む順#7｜実戦強化】Cambridge-IELTS-18：本番レベルで得点感覚を固める` | - |
| 8 | `content/posts/【読む順#8｜直前調整】Cambridge-IELTS-19：本番で取り切る最終チューニング.html` | `【読む順#8｜直前調整】Cambridge-IELTS-19：本番で取り切る最終チューニング` | - |

### 2.2 slug 生成の仕組み

| 箇所 | ファイル | 行 | 内容 |
|------|----------|-----|------|
| slug 抽出 | `lib/posts.ts` | 324-327 | `getSlugFromFilename(filename)` = `filename.slice(0, -5)`（.html 除去） |
| 呼び出し | `lib/posts.ts` | 396-399 | `getAllPosts()` 内で `fs.readdirSync` → 各ファイルに `getSlugFromFilename` 適用 |

---

## 3. データ取得パイプライン（どこで落ちているか）

### 3.1 記事一覧のデータソース

| ページ | ファイル | 行 | 取得方法 |
|--------|----------|-----|----------|
| トップ | `app/page.tsx` | 12-14 | `getAllPosts()` → `posts.slice(0, 5)`（最新5件） |
| 記事一覧 | `app/posts/page.tsx` | 19-20 | `getAllPosts()` → 全件表示 |
| サイドバー | `app/page.tsx` | 19-20 | `getAllPosts()` → `posts.slice(0, 6)`（最新6件） |

### 3.2 getAllPosts の実装

| 処理 | ファイル | 行 | 挙動 |
|------|----------|-----|------|
| ディレクトリ取得 | `lib/posts.ts` | 295-297 | `fs.readdirSync(POSTS_DIR)` |
| slug 抽出 | `lib/posts.ts` | 395-396 | `getSlugFromFilename(file)` |
| パース | `lib/posts.ts` | 398-399 | `parseHtmlPost(filePath, slug)` |
| ソート | `lib/posts.ts` | 403-407 | `date` 降順 |

**除外条件**: なし。draft / hidden / paid などのフィルタは存在しない。

**結論**: 【読む順】8件は `getAllPosts` の返却に含まれる。一覧表示ロジックで落ちる要因はない。

---

## 4. 一覧表示ロジックの除外条件チェック

| 観点 | 結果 | 根拠 |
|------|------|------|
| draft / hidden / paid 等 | なし | `lib/posts.ts` に該当フラグ・条件なし |
| date が無い / Invalid Date | なし | `parseHtmlPost` で `article:published_time` または `stat.mtime` から取得。欠損時は `stat.mtime` 使用 |
| tags / category で絞り込み | なし | `app/posts/page.tsx` は全件表示。トップ・サイドバーは `slice` のみ |
| title が空で落ちる | なし | `parseHtmlPost` で `slug` をフォールバックに使用 |
| 先頭【】で正規化から外れる | なし | 正規化処理は存在しない |

---

## 5. リンク/遷移の実装チェック（href / trailingSlash / encode / CSS）

### 5.1 リンク生成箇所一覧

| 入口 | ファイル | 行 | 生成式 | 備考 |
|------|----------|-----|--------|------|
| 記事カード | `components/post-card.tsx` | 14-15 | `/posts/${encodePostSlugForPath(post.slug)}/` | ✅ |
| サイドバー新着 | `components/sidebar.tsx` | 27-28 | `/posts/${encodePostSlugForPath(post.slug)}/` | ✅ |
| パンくず | `app/posts/[slug]/page.tsx` | 79 | `/posts/${encodePostSlugForPath(post.slug)}/` | ✅ |
| canonical / og:url | `app/posts/[slug]/page.tsx` | 23-24 | `${SITE_URL}/posts/${encodePostSlugForPath(params.slug)}/` | ✅ |
| RSS | `scripts/generate-rss.ts` | 35 | `${SITE_URL}/posts/${encodePostSlugForPath(post.slug)}/` | ✅ |
| サイトマップ | `scripts/generate-sitemap.ts` | 43 | `${SITE_URL}/posts/${encodePostSlugForPath(post.slug)}/` | ✅ |

### 5.2 encodePostSlugForPath の実装

```6:8:lib/url.ts
export function encodePostSlugForPath(slug: string): string {
  return encodeURIComponent(slug).replace(/%23/g, "%2523");
}
```

- `#` → `encodeURIComponent` で `%23` → `.replace(/%23/g, "%2523")` で `%2523`
- 静的ホストが 1 回デコードすると `%2523` → `%23` となり、out フォルダ名（`【読む順%231｜...】`）と一致

### 5.3 trailingSlash

| 設定 | ファイル | 行 |
|------|----------|-----|
| `trailingSlash: true` | `next.config.mjs` | 7 |

全リンク末尾に `/` 付与済み。

### 5.4 CSS（pointer-events 等）

- `components/post-card.tsx`: `Link` でラップ、`pointer-events` 指定なし
- カード全体がクリック可能

---

## 6. 静的生成の網羅性（generateStaticParams）

### 6.1 実装

```17:20:app/posts/[slug]/page.tsx
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

- `getAllPosts` の全 slug が params に含まれる
- 【読む順】8件も含まれる

### 6.2 out/posts の実ディレクトリ名（【読む順】）

| slug（生） | out フォルダ名 |
|------------|----------------|
| `【読む順#1｜基礎語彙】...` | `【読む順%231｜基礎語彙】...` |
| `【読む順#2｜テーマ語彙】...` | `【読む順%232｜テーマ語彙】...` |
| … | … |
| `【読む順#8｜直前調整】...` | `【読む順%238｜直前調整】...` |

Next.js は slug 内の `#` のみ `%23` に置換してフォルダ名に使用。日本語・全角記号はそのまま。

### 6.3 マッチングの流れ

```
[リンク側]
  href = /posts/%E3%80%90...%25231.../  （encodePostSlugForPath）

[静的ホスト 1 回デコード]
  %2523 → %23  → パス = /posts/【読む順%231｜...】/

[out フォルダ]
  out/posts/【読む順%231｜...】/index.html

→ 一致 → 200
```

---

## 7. 原因トップ3と推奨修正（最小差分）

### 現状

**修正は既に適用済み。** `lib/url.ts` の `encodePostSlugForPath`、および全リンク生成箇所での利用が完了している。

### 過去の原因（修正前の想定）

| 順位 | 原因 | 根拠（該当箇所） | 再現手順 | 修正内容 |
|------|------|------------------|----------|----------|
| 1 | `#` のエンコードずれ | リンク: `encodeURIComponent` → `%23`。out フォルダ: `#`→`%23`。静的ホスト 1 回デコードで `%23`→`#`。検索パス `#` とフォルダ名 `%23` が不一致 | `npx serve out` で `/posts/%E3%80%90...%238.../` にアクセス → 404 | `encodePostSlugForPath` で `%23`→`%2523` に二重エンコード（**実施済み**） |
| 2 | リンク生成の不統一 | RSS・sitemap が `encodeURIComponent` のみ使用 | RSS の link をクリック → 404 | 全リンクで `encodePostSlugForPath` 使用（**実施済み**） |
| 3 | generateStaticParams 漏れ | （該当なし）全 slug が params に含まれる | - | 対応不要 |

### 不具合が続く場合の確認ポイント

1. **デプロイの古さ**: `out/` を含む最新ビルドがデプロイされているか
2. **キャッシュ**: ブラウザ・CDN・Netlify のキャッシュをクリアして再アクセス
3. **環境差**: 本番（Netlify）でも `%2523` が正しくデコードされるか、該当 URL に直接アクセスして 200 か確認

---

## 8. 追加テスト観点（ビルド・E2E・リンク切れ検出）

### 8.1 ビルド時

```bash
npm run build
npx tsx scripts/verify-reading-series-paths.ts
```

期待: `NG件数（decode1 で存在しない）: 0 件`、`✅ 全記事の index.html が decode1 パスで out/posts 配下に存在します。`

### 8.2 ローカル静的配信

```bash
npx serve out -l 3333
```

- 【読む順】カードをクリック → 記事表示
- 非【読む順】カードをクリック → 記事表示

### 8.3 リンク切れ検出

```bash
# 【読む順】記事の decode1 パスに直接アクセス
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3333/posts/%E3%80%90%E8%AA%AD%E3%82%80%E9%A0%86%25231%EF%BD%9C%E5%9F%BA%E7%A4%8E%E8%AA%9E%E5%BD%99%E3%80%91IELTS%E8%8B%B1%E5%8D%98%E8%AA%9E3500%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9%EF%BC%9A4%E6%8A%80%E8%83%BD%E3%81%AB%E5%8A%B9%E3%81%8F%E6%9C%80%E7%9F%AD%E3%83%AB%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3/"
# 期待: 200
```

### 8.4 本番（Netlify）

- トップ・記事一覧の【読む順】カードをクリック → 記事表示
- RSS / サイトマップの【読む順】リンク → 記事表示

---

## 付録: 関連ドキュメント

- `docs/reading-series-link-audit.md` - 過去の詳細分析（修正前の状態を記載）
- `scripts/verify-reading-series-paths.ts` - パス整合性検証スクリプト
