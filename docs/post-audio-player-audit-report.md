# 記事本文先頭への音声プレイヤー表示 設計・改修レポート

**目的**: 各記事ページの本文先頭に、対応する音声ファイル（M4A等）の HTML5 audio プレイヤーを表示する  
**制約**: 静的 export（`output: "export"`）の下で実現  
**対象**: Next.js リポジトリ（ielts_consult-main）

---

## 重要な前提（今回の仕様）

- 音声ファイル格納先: `public/audio/posts/`
- 音声ファイル名は「記事のタイトル」と一致
  - 例: 記事タイトル「『ポラリス・キャピタリズム』で学ぶ、日本型PEの価値創造」
  - 音声ファイル `public/audio/posts/『ポラリス・キャピタリズム』で学ぶ、日本型PEの価値創造.m4a`
- タイトル → 音声ファイルの自動紐付け（JSON マッピングは極力避ける）
- 拡張子は .M4A / .m4a 混在の可能性あり

---

## A. 現状サマリ

| 項目 | 内容 |
|------|------|
| **記事レンダリング方式** | `post.content`（HTML文字列）を `dangerouslySetInnerHTML` で描画。`prose` クラス付き `div` 内に挿入 |
| **post.content 生成箇所** | `lib/posts.ts` の `parseHtmlPost` 内。`content/posts/*.html` の `article .content` から HTML を抽出し、`replaceAffiliateLinksWithCards` で加工 |
| **既存 HTML 加工処理** | `replaceAffiliateLinksWithCards`（242–260行）: `p.link` 内の URL 単体行を Amazon/Note カード HTML に置換。cheerio で DOM 操作 |
| **記事タイトルの取得元/保持フィールド** | `content/posts/*.html` の `<title>` または `article h1` または `h1` から `.text().trim()` で取得。フォールバックは slug。`post.title` に保持 |

---

## B. 該当箇所一覧（ファイルパス:行番号）

| ファイルパス | 行番号 | 内容要約 |
|-------------|--------|----------|
| `lib/posts.ts` | 265–277 | `Post` インターフェース定義。`content` に HTML 文字列を格納。`audioSrc` は未定義 |
| `lib/posts.ts` | 304–371 | `parseHtmlPost`: HTML を cheerio でパースし、title・content・tags 等を抽出。`contentHtml` に `replaceAffiliateLinksWithCards` を適用 |
| `lib/posts.ts` | 333–345 | `contentHtml` 抽出ロジック。`article .content` があればその `html()`、なければ `article.html()` または `body.html()` |
| `lib/posts.ts` | 349 | `replaceAffiliateLinksWithCards(contentHtml)` の呼び出し。これが既存の HTML 加工パイプライン |
| `lib/posts.ts` | 308–312 | タイトル取得: `$("title").first().text().trim()` → `$("article h1")` → `$("h1")` → slug |
| `lib/posts.ts` | 279–285 | `resolveHeroSrc`: ビルド時に `fs.existsSync` で `public` 配下の存在確認を実施（参考パターン） |
| `lib/posts.ts` | 242–260 | `replaceAffiliateLinksWithCards`: `p.link` を対象とした cheerio 置換 |
| `app/posts/[slug]/page.tsx` | 96–98 | `dangerouslySetInnerHTML={{ __html: post.content }}` で本文描画 |
| `app/posts/[slug]/page.tsx` | 17–19 | `generateStaticParams`: `getAllPosts` で全記事を取得し静的ページ生成 |
| `next.config.mjs` | 2–4 | `output: "export"` により静的 export。ランタイムで fs は使えない |
| `app/globals.css` | 125–191 | `.affiliate-card` 等の既存カードデザイン。音声 UI の参照用 |
| `content/posts/『ポラリス・キャピタリズム』で学ぶ、日本型PEの価値創造.html` | 6, 19 | `<title>` と `<h1>` に同一タイトル。`div.content` の先頭は `<figure>` |
| `public/audio/posts/` | — | 現状 1 ファイル: `『ポラリス・キャピタリズム』で学ぶ、日本型PEの価値創造.m4a`（小文字 .m4a） |

---

## C. 実装案（最小 / 標準 / 拡張）

### 最小案

- タイトルと完全一致するファイル名（`.m4a` のみ）を前提に、`audioSrc` を付与
- `contentHtml` の先頭に `<div class="post-audio">...</div>` を文字列連結で挿入
- 拡張子は `.m4a` 固定。大文字 `.M4A` は未対応

### 標準案（推奨）

- ビルド時に `public/audio/posts` を `fs.readdirSync` で走査
- タイトル（正規化: trim・複数空白→単一・全角スペース置換）と、拡張子除いたファイル名を大文字小文字無視で比較
- 一致した場合は **実ファイル名** を採用し、`/audio/posts/${encodeURIComponent(actualFilename)}` を `audioSrc` に付与
- 本文先頭への挿入は `replaceAffiliateLinksWithCards` の **後** に実施（カード化と干渉しない）

### 拡張案

- 音声メタ（説明文・章立て等）を JSON やフロントマターで持たせる。今回は必須ではないため対象外

---

## D. 推奨案

**推奨**: 標準案（ビルド時 fs 走査 + 実ファイル名採用 + 本文先頭への prepend）

**理由**:

1. **静的 export の制約**: ランタイムで `fs` は使えないため、存在確認はビルド時必須
2. **拡張子の混在**: 現状 `.m4a` だが、将来 `.M4A` が混在する可能性を考慮し、大文字小文字無視のマッチを行う
3. **URL の安全さ**: `encodeURIComponent` で実ファイル名をエンコードすれば、日本語・記号を含んでもブラウザで正しく解釈される
4. **既存パターンとの整合**: `resolveHeroSrc` と同様に、ビルド時に `public` 配下の存在を確認する方針と一致
5. **404 を避ける**: 存在しない音声は表示しないため、壊れた UI や 404 を防げる

**想定リスクと回避策**:

| リスク | 回避策 |
|--------|--------|
| タイトル表記揺れ | 正規化関数で trim・複数空白→単一・全角スペース→半角を適用。完全一致でなければ表示しない |
| URL エンコード | `encodeURIComponent(actualFilename)` で src を生成。ブラウザ・Netlify でも期待通り動作 |
| 拡張子大文字 | ファイル走査時に `.m4a` / `.M4A` を大文字小文字無視で判定。実ファイル名をそのまま使用 |
| ファイル名とタイトルの微妙な差異 | 正規化しても一致しない場合は表示しない。将来的にマッピングテーブルを導入する余地を残す |

---

## E. 改修ポイント（具体）

### 1. `Post` インターフェース拡張

**ファイル**: `lib/posts.ts`（265行付近）

```ts
export interface Post {
  // ... 既存フィールド
  audioSrc?: string;  // 追加: ビルド時に存在する場合のみ付与
}
```

### 2. 音声ファイル解決関数の追加

**ファイル**: `lib/posts.ts`（`parseHtmlPost` の直前付近）

```ts
const AUDIO_POSTS_DIR = path.join(process.cwd(), "public", "audio", "posts");

/** タイトルから対応する音声ファイルを探し、存在する場合は src を返す（ビルド時・Node のみ） */
function resolveAudioSrcForTitle(title: string): string | undefined {
  if (!title || typeof title !== "string") return undefined;
  try {
    if (!fs.existsSync(AUDIO_POSTS_DIR)) return undefined;
    const files = fs.readdirSync(AUDIO_POSTS_DIR);
    const normalizedTitle = title.trim().replace(/\s+/g, " ").replace(/\u3000/g, " ");
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext !== ".m4a") continue;
      const base = file.slice(0, file.length - ext.length);
      const normalizedBase = base.trim().replace(/\s+/g, " ").replace(/\u3000/g, " ");
      if (normalizedTitle === normalizedBase) {
        return `/audio/posts/${encodeURIComponent(file)}`;
      }
    }
  } catch {
    // フォールバック: 何も返さない
  }
  return undefined;
}
```

### 3. `parseHtmlPost` 内での audioSrc 付与と本文への挿入

**ファイル**: `lib/posts.ts`（349行付近）

**変更前**:

```ts
contentHtml = replaceAffiliateLinksWithCards(contentHtml);
// ...
return { slug, title, date, ..., content: contentHtml, ... };
```

**変更後**:

```ts
contentHtml = replaceAffiliateLinksWithCards(contentHtml);

const audioSrc = resolveAudioSrcForTitle(title);
if (audioSrc) {
  const audioBlock = `<div class="post-audio" role="region" aria-label="音声"><audio controls preload="none" src="${audioSrc}"></audio></div>`;
  contentHtml = audioBlock + contentHtml;
}

// ...
return { slug, title, date, ..., content: contentHtml, audioSrc, ... };
```

※ `audioSrc` を return に含めるかは、将来の用途（例: OGP 等）次第。現状は content への挿入のみで十分なら省略可。

### 4. 挿入する HTML 例

```html
<div class="post-audio" role="region" aria-label="音声">
  <audio controls preload="none" src="/audio/posts/%E3%80%8E%E3%83%9D%E3%83%A9%E3%83%AA%E3%82%B9%E3%83%BB%E3%82%AD%E3%83%A3%E3%83%94%E3%82%BF%E3%83%AA%E3%82%BA%E3%83%A0%E3%80%8F%E3%81%A7%E5%AD%A6%E3%81%B6%E3%80%81%E6%97%A5%E6%9C%AC%E5%9E%8BPE%E3%81%AE%E4%BE%A1%E5%80%A4%E5%89%B5%E9%80%A0.m4a"></audio>
</div>
```

### 5. 追加 CSS 候補（最小）

**ファイル**: `app/globals.css`（`.affiliate-card` の後あたり）

```css
/* 記事本文先頭の音声プレイヤー */
.prose .post-audio {
  @apply my-6 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/80 p-4;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04);
}
.prose .post-audio audio {
  @apply w-full max-w-md;
}
```

### 6. 処理順序の確認

- **推奨**: `replaceAffiliateLinksWithCards` の **後** に audio 挿入
- 理由: カード化は `p.link` 内の URL を置換するだけなので、先頭への prepend とは独立。順序を逆にしても結果は同じだが、将来の DOM 操作を考えると「本文の加工 → 先頭へのメタ情報追加」の方がわかりやすい。

### 7. Netlify での MIME / 配信確認ポイント

- **標準**: M4A は `audio/mp4` で配信するのが適切（`audio/m4a` は非標準で互換性に問題あり）
- **Netlify**: デフォルトでは拡張子に基づいて MIME を推定。`.m4a` が `audio/mp4` として扱われるかは環境依存の可能性あり

**確認方法**:
1. デプロイ後、該当音声 URL に直接アクセスし、レスポンスヘッダの `Content-Type` を確認
2. ブラウザ devtools の Network タブで、音声リクエストの Content-Type を確認
3. 再生できない場合は `public/_headers` で明示指定する

**`public/_headers` による明示指定（必要な場合）**:

```
/audio/posts/*
  Content-Type: audio/mp4
```

**拡張子の統一**: 運用として `.m4a`（小文字）に統一することを推奨。大文字 `.M4A` でも `resolveAudioSrcForTitle` では実ファイル名をそのまま使うため動作するが、MIME 判定の一貫性のため小文字統一が望ましい。

---

## F. 追加で確認したい事項

| 不明点 | 確認方法 |
|--------|----------|
| タイトルに改行や不可視文字が含まれる可能性 | `content/posts/*.html` の `<title>` / `<h1>` を複数確認。改行や `\u00A0` 等があれば正規化に追加 |
| 音声ファイルの命名規則（将来の追加方針） | 運用ドキュメントで「ファイル名＝記事タイトル（拡張子除く）」を明文化するか検討 |
| `audioSrc` を Post に持たせる必要性 | 本文以外（例: OGP、RSS）で音声 URL を参照する予定があれば保持。なければ content への挿入のみで十分 |
| 既存の `public/_headers` の有無 | リポジトリ内に `_headers` なし（`public/_headers` を確認済み）。新規作成で MIME を明示可能 |

---

## 改修の影響範囲まとめ

| 対象 | 変更内容 |
|------|----------|
| `lib/posts.ts` | `resolveAudioSrcForTitle` 追加、`parseHtmlPost` 内で audio 挿入、`Post` に `audioSrc?` 追加（任意） |
| `app/globals.css` | `.post-audio` のスタイル追加（最小） |
| その他 | なし（既存の描画・パース経路を利用） |

---

*レポート作成日: 2025-02-12*
