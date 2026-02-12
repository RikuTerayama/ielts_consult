# 【読む順】記事 一覧表示・遷移不具合 詳細監査レポート

**作成日**: 2026-02-12  
**前提**: 「まだ起きる」を前提に、「修正済みのはずなのに起きる」ケースを重点調査  
**目的**: 取りこぼし・別経路・export整合を疑い、再現手順・根拠・最小修正案まで含む

---

## A. 症状の再整理（表示されない/遷移しないを原因候補に分類）

| 症状 | 原因候補 | 該当性 |
|------|----------|--------|
| **一覧に表示されない** | getAllPosts に含まれていない | **否** — 検証で8件含まれることを確認 |
| | slice(0,5) で弾かれる（トップページで先頭5件のみ） | **可能性あり** — 日付順で【読む順】が6位以降ならトップで非表示 |
| | filter で除外 | **否** — 条件なし |
| | date 欠損でソート脱落 | **否** — 全件 date あり |
| **カードクリックで遷移しない** | href が生 slug（# 未エンコード） | **否** — 全箇所 `encodePostSlugForPath` 使用 |
| | 一部箇所で encode 取りこぼし | **否** — grep で取りこぼしなし |
| | out/ フォルダ名と href パス不一致 | **否** — 検証スクリプトで全件 OK |
| | Netlify キャッシュ・古いデプロイ | **推測** — コード上は解消済みの場合に疑う |
| | 静的ホストのデコード挙動差 | **推測** — Netlify がローカル serve と異なる場合 |

---

## B. 【読む順】記事一覧（ファイルパス/slug/title/date）

| # | ファイルパス | slug（想定） | title | date |
|---|--------------|--------------|-------|------|
| 1 | `content/posts/【読む順#1｜基礎語彙】IELTS英単語3500の使い方：4技能に効く最短ルーティン.html` | `【読む順#1｜基礎語彙】IELTS英単語3500の使い方：4技能に効く最短ルーティン` | 同上 | 2025-12-23 |
| 2 | `content/posts/【読む順#2｜テーマ語彙】分野別IELTS英単語の使い方：Task2-Part3で語彙を点に変える.html` | `【読む順#2｜テーマ語彙】...` | 同上 | 2025-12-24 |
| 3 | `content/posts/【読む順#3｜口が回る土台】瞬間英作文シャッフル：毎日10分でFluencyを底上げ.html` | `【読む順#3｜口が回る土台】...` | 同上 | 2025-12-25 |
| 4 | `content/posts/【読む順#4｜面接の型】IELTSスピーキング完全対策：Part1〜3をテンプレ化して7.0へ.html` | `【読む順#4｜面接の型】...` | 同上 | 2025-12-26 |
| 5 | `content/posts/【読む順#5｜独学ライティング】IELTSライティング徹底攻略：添削なしで6.5を狙う型と反復.html` | `【読む順#5｜独学ライティング】...` | 同上 | 2025-12-27 |
| 6 | `content/posts/【読む順#6｜模試の回し方】公認IELTS模試3回分：解きっぱなしを卒業する復習設計.html` | `【読む順#6｜模試の回し方】...` | 同上 | 2025-12-28 |
| 7 | `content/posts/【読む順#7｜実戦強化】Cambridge-IELTS-18：本番レベルで得点感覚を固める.html` | `【読む順#7｜実戦強化】...` | 同上 | 2025-12-30 |
| 8 | `content/posts/【読む順#8｜直前調整】Cambridge-IELTS-19：本番で取り切る最終チューニング.html` | `【読む順#8｜直前調整】...` | 同上 | 2025-12-31 |

**slug 生成**: `lib/posts.ts` L324-327 `getSlugFromFilename(filename)` = `filename.slice(0, -5)`

---

## C. データ取得パイプライン（getAllPosts→一覧）

### C.1 getAllPosts の流れ

| 処理 | ファイル | 行 | 内容 |
|------|----------|-----|------|
| ディレクトリ取得 | `lib/posts.ts` | 427 | `fs.readdirSync(POSTS_DIR)` |
| slug 抽出 | `lib/posts.ts` | 431, 395 | `getSlugFromFilename(file)` |
| パース | `lib/posts.ts` | 433-434 | `parseHtmlPost(filePath, slug)` |
| ソート | `lib/posts.ts` | 437-441 | `date` 降順 |
| フィルタ | なし | — | 全件返却 |

### C.2 検証結果（npx tsx scripts/debug-reading-series-posts.ts）

```
総件数: 24
【読む順】件数: 8
先頭5件に【読む順#8】を含む（5位）
先頭6件に【読む順#8】【読む順#7】を含む
```

**Q1 回答**: 【読む順】記事は getAllPosts の戻り値に**含まれている**。

---

## D. 一覧で落ちる条件の特定（根拠提示）

### D.1 トップページ（app/page.tsx）

| 条件 | ファイル | 行 | 影響 |
|------|----------|-----|------|
| `latestPosts = posts.slice(0, 5)` | `app/page.tsx` | 14 | 最新5件のみ表示。6位以降は非表示 |
| `popularPosts = posts.slice(0, 5)` | `app/page.tsx` | 15 | 同上 |
| `sidebarLatestPosts = posts.slice(0, 6)` | `app/page.tsx` | 20 | 最新6件のみ表示 |

**並び順**: `lib/posts.ts` L437-441 で `date` 降順。他記事の日付が新しければ【読む順】は下位に回る。

**現状**: 検証時点では【読む順#8】が5位、【読む順#7】が6位。トップ・サイドバーに表示される。

### D.2 記事一覧ページ（app/posts/page.tsx）

| 条件 | ファイル | 行 | 影響 |
|------|----------|-----|------|
| `posts.map(...)` | `app/posts/page.tsx` | 52-55 | 全件表示。フィルタなし |

**Q2 回答**: 一覧で落ちる条件は**slice による件数制限のみ**。`/posts` は全件表示。トップは最新5件のみなので、日付が古い【読む順】が後ろに回るとトップでは非表示になる。

### D.3 除外条件（該当なし）

| 観点 | 結果 | 根拠 |
|------|------|------|
| draft/hidden/paid | なし | 該当フラグ・条件なし |
| tags/category 絞り | なし | 全件表示 |
| date 欠損 | なし | 全件取得 |
| title/hero 空 | なし | レンダリング条件で落ちる仕様なし |

---

## E. クリック遷移が壊れる条件の特定（href/encode/構造/CSS）

### E.1 リンク生成箇所一覧（取りこぼし検索結果）

| 入口 | ファイル | 行 | 生成式 | encode 使用 |
|------|----------|-----|--------|-------------|
| 記事カード | `components/post-card.tsx` | 15 | `/posts/${encodePostSlugForPath(post.slug)}/` | ✅ |
| サイドバー | `components/sidebar.tsx` | 28 | `/posts/${encodePostSlugForPath(post.slug)}/` | ✅ |
| パンくず | `app/posts/[slug]/page.tsx` | 80 | `/posts/${encodePostSlugForPath(post.slug)}/` | ✅ |
| canonical/og:url | `app/posts/[slug]/page.tsx` | 24-25 | `encodePostSlugForPath(params.slug)` | ✅ |
| RSS | `scripts/generate-rss.ts` | 35 | `encodePostSlugForPath(post.slug)` | ✅ |
| サイトマップ | `scripts/generate-sitemap.ts` | 43 | `encodePostSlugForPath(post.slug)` | ✅ |

**生 slug 使用**: なし。`/posts/${post.slug}` や `/posts/${slug}` の形は見つかっていない。

### E.2 encodePostSlugForPath の実装

```6:8:lib/url.ts
export function encodePostSlugForPath(slug: string): string {
  return encodeURIComponent(slug).replace(/%23/g, "%2523");
}
```

- `#` → `%23`（encodeURIComponent）→ `%2523`（replace）
- 静的ホスト 1 回デコード後 `%23` となり、out フォルダ名と一致

### E.3 Link 構造・CSS

| 観点 | 結果 | 根拠 |
|------|------|------|
| next/link 使用 | ✅ | `components/post-card.tsx` で Link 使用 |
| クリック可能構造 | ✅ | カード全体が Link の子要素 |
| pointer-events | 問題なし | 指定なし |
| 透明要素の重なり | 問題なし | 該当なし |

**Q3 回答**: href 生成・encode・Link 構造・CSS に問題は見つからず。**UI 側のコードは適切**。

---

## F. out/ 生成物と href 整合（読む順8件を具体例で）

### F.1 out/posts の実ディレクトリ名

| slug（生） | out フォルダ名 |
|------------|----------------|
| `【読む順#1｜基礎語彙】...` | `【読む順%231｜基礎語彙】...` |
| `【読む順#8｜直前調整】...` | `【読む順%238｜直前調整】...` |

Next.js は slug 内の `#` のみ `%23` に置換してフォルダ名に使用。

### F.2 マッチングの流れ

```
[リンク] href = /posts/%E3%80%90...%25238.../
[静的ホスト 1 回デコード] %2523 → %23  → パス = /posts/【読む順%238｜...】/
[out フォルダ] out/posts/【読む順%238｜直前調整】.../index.html
→ 一致
```

### F.3 検証スクリプト結果（npx tsx scripts/verify-reading-series-paths.ts）

```
NG件数（decode1 で存在しない）: 0 件
existsByDecode1: 24 件
✅ 全記事の index.html が decode1 パスで out/posts 配下に存在します。
```

**Q4 回答**: 静的生成と out/ の生成物は、リンクのパスと**一致している**。

**Q5 回答**: slug 内の `#` は**全リンク生成箇所で encodePostSlugForPath により `%2523` にエンコード**されており、取りこぼしはなし。

---

## G. 原因トップ1〜3と、最小修正案

### 原因1: デプロイ・キャッシュの不整合（推測）

| 項目 | 内容 |
|------|------|
| 根拠 | コード上は encode・パス・out 整合ともに問題なし。 |
| 想定 | 古いビルドのデプロイ、ブラウザ/CDN キャッシュ、Netlify のキャッシュ。 |
| 再現手順 | 1) 本番で【読む順】カードをクリックし 404 を確認 2) キャッシュ無効で再試行 3) 最新ビルドの再デプロイ後に再試行 |
| 最小修正 | コード変更不要。再ビルド・再デプロイ・キャッシュ purge を実施。 |

### 原因2: Netlify のパス解決・デコード挙動の差（推測）

| 項目 | 内容 |
|------|------|
| 根拠 | ローカル `npx serve out` では 200、Netlify 本番での挙動は未検証。 |
| 想定 | Netlify のパスデコードやファイル解決がローカルと異なる。 |
| 再現手順 | Netlify 本番で `/posts/%E3%80%90...%25238.../` に直接アクセスし、200/404 を確認。 |
| 最小修正 | Netlify の Redirects や Edge 設定で、該当パスを明示的に扱う（要 Netlify 側調査）。 |

### 原因3: トップページの slice で「表示されない」と感じる（コード起因）

| 項目 | 内容 |
|------|------|
| 根拠 | `app/page.tsx` L14-15 で `posts.slice(0, 5)`。日付順で【読む順】が6位以降ならトップに非表示。 |
| 想定 | 「一覧に出ない」をトップページのみ見て判断している可能性。 |
| 再現手順 | 他記事の日付を新しくしてビルドし、【読む順】が top5 から外れることを確認。 |
| 最小修正 | 仕様どおり。必要なら「読む順」専用セクションの追加等を検討。 |

---

## H. 追加の再発防止

### H.1 検証スクリプトの定期実行

| スクリプト | 用途 |
|------------|------|
| `npx tsx scripts/verify-reading-series-paths.ts` | out/ と href の整合性確認 |
| `npx tsx scripts/debug-reading-series-posts.ts` | getAllPosts に【読む順】が含まれるか確認 |

**推奨**: CI や prebuild で `verify-reading-series-paths.ts` を実行し、NG があればビルド失敗にする。

### H.2 リンク生成の単一化

| 現状 | 推奨 |
|------|------|
| `encodePostSlugForPath` を各箇所で呼び出し | 現状のまま。全箇所で統一されている。 |

### H.3 取りこぼしゼロ確認用 grep

```bash
# 生 slug の使用を検出（ヒットすべきでない）
rg '/posts/\$\{post\.slug' --type ts -l
rg '/posts/\$\{slug\}' --type ts -l
rg 'encodeURIComponent\(post\.slug\)' --type ts -l  # encodePostSlugForPath でない場合
```

**確認内容**: 上記でヒットしないこと。ヒットした場合は `encodePostSlugForPath` への置換を検討。

### H.4 本番確認チェックリスト

- [ ] `npm run build` 成功
- [ ] `npx tsx scripts/verify-reading-series-paths.ts` で全件 OK
- [ ] `npx serve out` で【読む順】カードクリック → 記事表示
- [ ] Netlify デプロイ後、同様に【読む順】カードクリック → 記事表示
- [ ] RSS/sitemap の【読む順】リンクから直接アクセス → 200

---

## 調査のゴール 回答まとめ

| Q | 回答 |
|---|------|
| **Q1** | 【読む順】記事は getAllPosts の戻り値に**含まれている** |
| **Q2** | 一覧で落ちる要因は **slice(0,5)/slice(0,6) による件数制限のみ**。`/posts` は全件表示 |
| **Q3** | クリック遷移は **href/encode/Link 構造/CSS に問題なし** |
| **Q4** | 静的生成と out/ の生成物はリンクのパスと**一致している** |
| **Q5** | slug 内の `#` は**全リンク生成箇所で `encodePostSlugForPath` によりエンコード**されており、取りこぼしなし |

---

## 付録: 関連ファイル一覧

| ファイル | 役割 |
|----------|------|
| `lib/posts.ts` | getAllPosts, getPostBySlug, getSlugFromFilename |
| `lib/url.ts` | encodePostSlugForPath |
| `components/post-card.tsx` | 記事カード・href 生成 |
| `components/sidebar.tsx` | サイドバー新着・href 生成 |
| `app/posts/[slug]/page.tsx` | 記事詳細・generateStaticParams・パンくず |
| `app/posts/page.tsx` | 記事一覧 |
| `app/page.tsx` | トップ・最新5件・人気5件 |
| `scripts/generate-rss.ts` | RSS リンク生成 |
| `scripts/generate-sitemap.ts` | サイトマップリンク生成 |
| `scripts/verify-reading-series-paths.ts` | パス整合性検証 |
| `scripts/debug-reading-series-posts.ts` | getAllPosts 検証 |
