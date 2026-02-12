# 【読む順】シリーズ リンク遷移不具合 監査レポート

**作成日**: 2026-02-12  
**目的**: 【読む順#1〜#8】だけ、カード/ボタン/一覧/RSS/サイトマップから個別記事へ遷移できず 404 になる問題の機械的原因特定

---

## 1. 概要（何が起きているか）

- **現象**: 【読む順】シリーズ 8 件の記事カード（トップ／記事一覧）またはリンク（RSS／サイトマップ）をクリックしても、個別記事ページに遷移せず 404 になる。
- **対象**: `content/posts` に存在し、ファイル名（=slug）の先頭が「【読む順#」で始まる 8 件。
- **他記事**: 【読む順】以外（例: 『ポラリス・キャピタリズム』、自己紹介と英語学習変遷）は正常に遷移できる。

---

## 2. 再現手順（コマンド、観測したURL例）

### 2.1 実行したコマンド

```bash
# 依存導入（いずれか）
pnpm install && pnpm run build
# または
npm ci && npm run build

# 静的配信
npx serve out
```

※ `pnpm run build` または `npm run build` で `out/` を生成後、検証を実施。

### 2.2 観測したURL例

| 入口 | 生成されるURL（抜粋） | 根拠 |
|------|------------------------|------|
| RSS（【読む順#8】） | `https://ieltsconsult.netlify.app/posts/%E3%80%90%E8%AA%AD%E3%82%80%E9%A0%86%238%EF%BD%9C%E7%9B%B4%E5%89%8D%E8%AA%BF%E6%95%B4.../` | `public/rss.xml` L40 |
| サイトマップ（【読む順#8】） | `https://ieltsconsult.netlify.app/posts/%E3%80%90%E8%AA%AD%E3%82%80%E9%A0%86%238%EF%BD%9C.../` | `public/sitemap.xml` L131 |
| 非【読む順】（自己紹介…） | `https://ieltsconsult.netlify.app/posts/%E8%87%AA%E5%B7%B1%E7%B4%B9%E4%BB%8B%E3%81%A8%E8%8B%B1%E8%AA%9E%E5%AD%A6%E7%BF%92%E5%A4%89%E9%81%B7/` | RSS の link 要素 |

- **パス部分の特徴**: `#` は `%23` にエンコード（`%238` = `%23` + `8`）。全文字が UTF-8 エンコード済み。
- **静的ホストの想定挙動**: リクエストパスを 1 回デコード → `%23` → `#`。検索パスは `【読む順#8｜...` になる。

### 2.3 ローカル curl 検証結果（npx serve out）

```bash
# 静的配信起動
npx serve out -l 3333

# 非【読む順】記事（期待: 200）
# Windows: curl.exe -s -o NUL -w "%{http_code}" "http://localhost:3333/posts/%E8%87%AA%E5%B7%B1%E7%B4%B9%E4%BB%8B%E3%81%A8%E8%8B%B1%E8%AA%9E%E5%AD%A6%E7%BF%92%E5%A4%89%E9%81%B7/"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3333/posts/%E8%87%AA%E5%B7%B1%E7%B4%B9%E4%BB%8B%E3%81%A8%E8%8B%B1%E8%AA%9E%E5%AD%A6%E7%BF%92%E5%A4%89%E9%81%B7/"
# → 200

# 【読む順#1】現状リンク（%23、期待: 404）
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3333/posts/%E3%80%90%E8%AA%AD%E3%82%80%E9%A0%86%231%EF%BD%9C%E5%9F%BA%E7%A4%8E%E8%AA%9E%E5%BD%99%E3%80%91IELTS%E8%8B%B1%E5%8D%98%E8%AA%9E3500%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9%EF%BC%9A4%E6%8A%80%E8%83%BD%E3%81%AB%E5%8A%B9%E3%81%8F%E6%9C%80%E7%9F%AD%E3%83%AB%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3/"
# → 404（想定どおり）

# 【読む順#1】案1 想定（%2523、期待: 200）
curl.exe -s -o NUL -w "%{http_code}" "http://localhost:3333/posts/%E3%80%90%E8%AA%AD%E3%82%80%E9%A0%86%25231%EF%BD%9C%E5%9F%BA%E7%A4%8E%E8%AA%9E%E5%BD%99%E3%80%91IELTS%E8%8B%B1%E5%8D%98%E8%AA%9E3500%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9%EF%BC%9A4%E6%8A%80%E8%83%BD%E3%81%AB%E5%8A%B9%E3%81%8F%E6%9C%80%E7%9F%AD%E3%83%AB%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3/"
# → 200（案1 の前提が成立）
```

- **結論**: 非【読む順】は現状 URL で 200。【読む順】は現状 URL（%23）で 404。案1 想定 URL（%2523）は **200** となり、リンク側を修正すれば遷移可能。Netlify 本番でも同様のデコード挙動になるかは要確認。

---

## 3. 事実（ログ、生成物 out/、ファイル:行番号）

### 3.0 前提の確認

| 項目 | 根拠 |
|------|------|
| `output: 'export'` | `next.config.mjs` L3 |
| `trailingSlash: true` | `next.config.mjs` L7 |

### 3.1 リンク生成・デコードの完全列挙

#### encodeURIComponent 使用箇所（リンク生成）

| 入口種別 | ファイル | 行 | 生成式 | 生成される URL 形式 |
|----------|----------|-----|--------|---------------------|
| 記事カード | `components/post-card.tsx` | 14 | `/posts/${encodeURIComponent(post.slug)}/` | `/posts/%E3%80%90%E8%AA%AD...%238.../` |
| パンくず | `app/posts/[slug]/page.tsx` | 76 | `/posts/${encodeURIComponent(post.slug)}/` | 同上 |
| canonical / og:url | `app/posts/[slug]/page.tsx` | 23-24 | `${SITE_URL}/posts/${encodeURIComponent(params.slug)}/` | 同上 |
| RSS | `scripts/generate-rss.ts` | 34 | `${SITE_URL}/posts/${encodeURIComponent(post.slug)}/` | 同上 |
| サイトマップ | `scripts/generate-sitemap.ts` | 38 | `${SITE_URL}/posts/${encodeURIComponent(post.slug)}/` | 同上 |

**結論**: 全入口で `encodeURIComponent(post.slug)` を使用。`#` は `%23` にエンコードされる。

#### decodeURIComponent 使用箇所（slug 解決）

| 用途 | ファイル | 行 | 内容 |
|------|----------|-----|------|
| 記事取得 | `lib/posts.ts` | 217 | `decodeURIComponent(slug)` — params から渡された slug をデコードし、`content/posts/${decodedSlug}.html` を検索 |
| タグページ | `app/tags/[tag]/page.tsx` | 17, 25 | `decodeURIComponent(params.tag)` — 記事 slug とは無関係 |

**補足**: `getPostBySlug` は **content フォルダ**のファイル名で検索する。out のディレクトリ名は Next.js の `generateStaticParams` に依存し、`lib/posts.ts` とは直接関係しない。

### 3.2 slug の生成元

| 箇所 | ファイル | 行 | 内容 |
|------|----------|-----|------|
| slug 抽出 | `lib/posts.ts` | 119-123 | `getSlugFromFilename(filename)` = `filename.slice(0, -5)`（.html 除去） |
| ファイル名一覧 | `lib/posts.ts` | 195-201 | `getAllPosts()` で `fs.readdirSync` し、各ファイルから `getSlugFromFilename` で slug 取得 |

**【読む順】8件の slug（# を含む）**（`content/posts/` のファイル名から）:

- `【読む順#1｜基礎語彙】IELTS英単語3500の使い方：4技能に効く最短ルーティン`
- `【読む順#2｜テーマ語彙】分野別IELTS英単語の使い方：Task2-Part3で語彙を点に変える`
- …（同様に #3〜#8）

### 3.2.5 全記事 slug の文字種スキャン（再発防止観点）

`scripts/verify-reading-series-paths.ts` の `scanSlugChars` で集計。根拠: 同上スクリプト実行結果。

| 文字 | 件数 | 該当 slug 例 |
|------|------|--------------|
| `#` | 8 件 | 【読む順#1｜…】〜【読む順#8｜…】 |
| `?`（半角） | 0 件 | — |
| `？`（全角） | 2 件 | あなたはいつまでTOEICを受けるのか？… |
| `%` | 0 件 | — |
| `/` | 0 件 | — |
| `:`（半角） | 0 件 | — |

- **結論**: 今回の 404 の直接トリガは **`#` のみ**。全角 `？` を含む 2 件は非【読む順】であり、out フォルダ名は slug と同一で、現状リンク（`encodeURIComponent`）でも正常に遷移している。

### 3.3 out/posts の実ディレクトリ名

#### 【読む順】8 件（slug と out フォルダ名の対応）

| # | slug（生） | out 上のフォルダ名（実体） | 差分 |
|---|------------|----------------------------|------|
| 1 | `【読む順#1｜基礎語彙】...` | `【読む順%231｜基礎語彙】...` | `#` → `%23` のみ |
| 2 | `【読む順#2｜テーマ語彙】...` | `【読む順%232｜テーマ語彙】...` | 同上 |
| 3 | `【読む順#3｜口が回る土台】...` | `【読む順%233｜口が回る土台】...` | 同上 |
| 4 | `【読む順#4｜面接の型】...` | `【読む順%234｜面接の型】...` | 同上 |
| 5 | `【読む順#5｜独学ライティング】...` | `【読む順%235｜独学ライティング】...` | 同上 |
| 6 | `【読む順#6｜模試の回し方】...` | `【読む順%236｜模試の回し方】...` | 同上 |
| 7 | `【読む順#7｜実戦強化】...` | `【読む順%237｜実戦強化】...` | 同上 |
| 8 | `【読む順#8｜直前調整】...` | `【読む順%238｜直前調整】...` | 同上 |

→ **Next.js 静的 export の観測結果**: `#` のみ `%23` に置換。日本語・全角記号（`｜`、`：`）はそのまま。

#### 非【読む順】サンプル（比較用）

| slug（生） | out 上のフォルダ名（実体） | 差分 |
|------------|----------------------------|------|
| `自己紹介と英語学習変遷` | `自己紹介と英語学習変遷` | なし（同一） |
| `『ポラリス・キャピタリズム』で学ぶ、日本型PEの価値創造` | `『ポラリス・キャピタリズム』で学ぶ、日本型PEの価値創造` | なし（同一） |
| `あなたはいつまでTOEICを受けるのか？` | `あなたはいつまでTOEICを受けるのか？` | なし（同一） |

→ **規則**: 日本語・全角 `？`・全角 `：` 等はそのまま。**【読む順】のみ** `#` が `%23` に置換される。

### 3.4 検証スクリプトの集計結果

```bash
npx tsx scripts/verify-reading-series-paths.ts
```

**出力（抜粋）:**

```
凡例:
  - hrefCandidate: encodeURIComponent(slug) = リンク生成パス
  - decode1Candidate: 1回デコード後 = 静的ホストがリクエストをデコードした後のパス
  - nextJsStyleCandidate: slug.replace(/#/g,'%23') = Next.js 出力フォルダ名

サマリー:
  総数: 24 件
  NG件数（decode1 で存在しない）: 8 件
  existsByHref: 0 件
  existsByDecode1: 16 件
  existsByNextJsStyle: 24 件

NG slug一覧（decode1 で 404）:
  - 【読む順#8｜直前調整】Cambridge-IELTS-19：本番で取り切る最終チューニング
  - 【読む順#7｜実戦強化】Cambridge-IELTS-18：本番レベルで得点感覚を固める
  - 【読む順#6｜模試の回し方】公認IELTS模試3回分：解きっぱなしを卒業する復習設計
  - 【読む順#5｜独学ライティング】IELTSライティング徹底攻略：添削なしで6.5を狙う型と反復
  - 【読む順#4｜面接の型】IELTSスピーキング完全対策：Part1〜3をテンプレ化して7.0へ
  - 【読む順#3｜口が回る土台】瞬間英作文シャッフル：毎日10分でFluencyを底上げ
  - 【読む順#2｜テーマ語彙】分野別IELTS英単語の使い方：Task2-Part3で語彙を点に変える
  - 【読む順#1｜基礎語彙】IELTS英単語3500の使い方：4技能に効く最短ルーティン

代表例（【読む順】NG vs 非【読む順】OK）:
  [NG] 【読む順】
    slug: 【読む順#8｜直前調整】Cambridge-IELTS-19：本番で取り切る最終チューニング
    hrefCandidate: %E3%80%90%E8%AA%AD%E3%82%80%E9%A0%86%238%EF%BD%9C%E7%9B%B4%E...
    decode1Candidate: 【読む順#8｜直前調整】Cambridge-IELTS-19：本番で取り切る最終チューニング...
    nextJsStyleCandidate: 【読む順%238｜直前調整】Cambridge-IELTS-19：本番で取り切る最終チューニング...
    out実フォルダ: 【読む順%238｜直前調整】Cambridge-IELTS-19：本番で取り切る最終チューニング...
    existsByHref: false, existsByDecode1: false, existsByNextJsStyle: true

  [OK] 非【読む順】
    slug: 『ポラリス・キャピタリズム』で学ぶ、日本型PEの価値創造
    decode1Candidate: 『ポラリス・キャピタリズム』で学ぶ、日本型PEの価値創造...
    out実フォルダ: 『ポラリス・キャピタリズム』で学ぶ、日本型PEの価値創造...
    existsByDecode1: true
```

- **existsByHref**: 0 件（全記事） — リンクは `/posts/` + encodeURIComponent 形式だが、out にはその形式のフォルダがない。
- **existsByDecode1**: 16 件（非【読む順】のみ） — 【読む順】8 件は **false**。
- **existsByNextJsStyle**: 24 件（全記事） — Next.js 出力フォルダ名（`#`→`%23`）と完全一致。

---

## 4. 根本原因（1行結論＋図解）

### 4.1 1行結論

**リンクのエンコード方式（`encodeURIComponent` で `#`→`%23`）と、Next.js が out に吐くディレクトリ名（`#` のみ `%23` に置換）、そして静的ホストがパスを 1 回デコードして `%23`→`#` にする挙動の 3 つが噛み合わず、デコード後の検索パス（`#`）と実フォルダ名（`%23`）が一致しないため 404 になる。**

### 4.2 図解

```
[リンク側]
  slug: 【読む順#8｜直前調整】...
  encodeURIComponent → href: /posts/%E3%80%90%E8%AA%AD%E3%82%80%E9%A0%86%238%EF%BD%9C.../
                        （# → %23）

[静的ホスト]
  リクエスト受信: /posts/%E3%80%90...%238.../
  1回デコード:     /posts/【読む順#8｜直前調整】.../  （%23 → #）
  ファイル検索:   out/posts/【読む順#8｜...】/index.html を探す

[Next.js 出力]
  フォルダ名:     out/posts/【読む順%238｜直前調整】.../index.html
                 （# のみ %23 に置換）

[不一致]
  検索パス: 【読む順#8｜...】  （#）
  実フォルダ: 【読む順%238｜...】 （%23）
  → 一致せず 404
```

---

## 5. 修正案（最低3案：変更箇所/メリデメ/影響/検証手順）

### 案1: リンク側のエンコード方式を out の実ディレクトリ名に寄せる

| 項目 | 内容 |
|------|------|
| **変更箇所** | `components/post-card.tsx` L14, `app/posts/[slug]/page.tsx` L23-24, L76, `scripts/generate-rss.ts` L34, `scripts/generate-sitemap.ts` L38 |
| **変更内容** | `encodeURIComponent(slug).replace(/%23/g, '%2523')` で `#` のエンコード結果 `%23` を `%2523` に置換。静的ホストの 1 回デコード後に `%23` となり、out フォルダ名（`%23`）と一致させる。根拠: out の実フォルダ名は `#` のみ `%23` に置換された形式（§3.3）。 |
| **メリット** | 変更範囲が小さい。既存フォルダ構造を変えず、out の再生成不要。 |
| **デメリット** | URL 表記が `%2523` を含む形に変わる。ブラウザの送信時のエンコード挙動で期待通りにならない可能性あり。 |
| **既存 URL 互換性** | 新 URL に変わるため、既存インデックスは新 URL へ移行。301 リダイレクトは別途検討。 |
| **SEO 影響** | canonical / sitemap / RSS を同様に変更すれば整合。 |
| **検証手順** | 1) 修正後ビルド 2) `npx serve out` で `/posts/...%25231.../` に curl → 200 を確認 3) カードクリックで遷移確認 4) Netlify 本番で同様に確認 |

### 案2: generateStaticParams 側の出力を調整し、生成物ディレクトリ名とリンクを一致させる

| 項目 | 内容 |
|------|------|
| **変更箇所** | `app/posts/[slug]/page.tsx` の `generateStaticParams`（L16-18） |
| **変更内容** | `return posts.map((p) => ({ slug: encodeURIComponent(p.slug) }))` とし、Next.js がフォルダ名を完全エンコード形式で出力するようにする。 |
| **メリット** | リンクは既に `encodeURIComponent` を使用しており、フォルダ名と一致する可能性がある。 |
| **デメリット** | **Next.js が `encodeURIComponent` 後の slug をそのままフォルダ名に使うか未検証。内部挙動に依存する。** 検証観点: ビルド後に `out/posts/` の【読む順】フォルダ名が `%E3%80%90...%231...` 形式になっているか確認必須。 |
| **既存 URL 互換性** | リンク形式は変わらず。フォルダ名が変わるため、既存デプロイ済み out との整合はとれない（再ビルド前提）。 |
| **SEO 影響** | フォルダ名＝URL パスが変わる。 canonical / sitemap / RSS はリンク側がそのままであれば整合。 |
| **検証手順** | 1) 変更後ビルド 2) `out/posts/` のフォルダ名が `%E3%80%90...%231...` 形式か確認（**必須**） 3) リンクで遷移確認 4) Netlify で本番確認 |

### 案3: slug を URL 安全な形式に正規化（表示名と slug を分離）

| 項目 | 内容 |
|------|------|
| **変更箇所** | `content/posts/` のファイル名、`lib/posts.ts`、frontmatter または slug マッピング |
| **変更内容** | 【読む順】を `reading-order-1` 等の ASCII 形式にし、表示名と slug を分離。slugify 等で `#`、`?`、`%`、`:` 等を排除。 |
| **メリット** | 特殊文字起因の不具合を根本的に解消。`#` 以外の `?`、`%`、`:` 等も回避可能。再発防止に最も有効。 |
| **デメリット** | ファイル名変更・リダイレクト・リンク更新の手間が大きい。工数大。 |
| **既存 URL 互換性** | URL が大きく変わる。301 リダイレクト設計が必須。 |
| **SEO 影響** | canonical / sitemap / RSS の更新が必要。旧 URL からの 301 でリンクジュースを維持。 |
| **検証手順** | 1) slugify 実装 2) ファイル名変更 3) 301 リダイレクト設定 4) 全リンク・RSS・sitemap の更新 5) 検証スクリプトで全記事 OK を確認 |

---

## 6. 推奨案（実装はしない。推奨根拠と前提条件）

**推奨: 案1（リンク側のエンコードを out に寄せる）**

### 6.1 推奨根拠

- この環境（静的 export + Netlify）で変更範囲が最小。
- out の再生成やフォルダ構造の変更が不要。
- 案2 は Next.js の内部挙動に依存し不確実。案3 は工数が大きい。

### 6.2 前提条件

- 案1 の `%2523` が、静的ホストの 1 回デコード後に `%23` となり、フォルダ名と一致することを前提とする。
- ブラウザが `%` を再エンコードする場合、期待通りにならない可能性がある。
- **観測**: ローカル検証（`npx serve out` + curl）では、案1 想定 URL（%2523）は **200** であった（§2.3）。Netlify 本番でも同様のデコード挙動になるかは要確認。

### 6.3 追加検証で確度を上げる方法

1. **案1 の事前検証**
   - `npx serve out` で `http://localhost:3333/posts/%E3%80%90%E8%AA%AD%E3%82%80%E9%A0%86%25231.../` に直接アクセスして記事が表示されるか確認。
   - **本レポート執筆時の検証で 200 を確認済み**（§2.3）。案1 の前提が成立する。

2. **案2 の事前検証**
   - `generateStaticParams` を `encodeURIComponent` に変更してビルドし、`out/posts/` の【読む順】フォルダ名が `%E3%80%90...%231...` 形式になっているか確認。
   - フォルダ名が期待通りなら、案2 の前提が成立する。

3. **Netlify のデコード挙動**
   - 本番環境で、案1 の想定 URL に直接アクセスして 200 が返るか確認。Netlify のファイル解決がローカル `serve` と異なる場合のフォールバックを検討。

---

## 7. 検証チェックリスト（修正前/修正後で何を見るか）

### 7.1 修正前

- [ ] `pnpm run build` または `npm run build` が成功する
- [ ] `node ./node_modules/tsx/dist/cli.mjs scripts/verify-reading-series-paths.ts` で【読む順】8 件が NG、他が OK であることを確認
- [ ] `npx serve out` で静的配信し、【読む順】カードをクリックしたとき 404 になることを確認
- [ ] 非【読む順】カードをクリックしたとき記事が表示されることを確認
- [ ] Network タブでリクエストパスとレスポンスコードを記録

### 7.2 修正後

- [ ] 検証スクリプトで全記事が OK になることを確認
- [ ] `npx serve out` で【読む順】カードをクリックして記事が表示されることを確認
- [ ] Netlify デプロイ後、トップの【読む順】カードをクリックして個別記事に遷移するか確認
- [ ] 記事一覧の【読む順】カードをクリックして個別記事に遷移するか確認
- [ ] 【読む順】以外の記事が引き続き正常に遷移するか確認
- [ ] RSS / サイトマップのリンクから【読む順】記事にアクセスできるか確認
