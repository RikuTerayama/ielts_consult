# 音声プレイヤー配置・表示ブラッシュアップ 改修レポート

**目的**: 音声プレイヤーの「配置位置」をトップ画像の下に変更し、「表示内容（コピー・見せ方）」をブラッシュアップする  
**制約**: 静的 export（`output: "export"`）の範囲内で実装  
**調査日**: 2025-02-12

---

## A. 現状サマリ

| 項目 | 内容 |
|------|------|
| **記事ページの表示順序** | 1. Breadcrumb → 2. タイトル（h1）→ 3. 日付（time）→ 4. 本文（post.content）内: **[音声] → [トップ画像=先頭 figure] → [2枚目画像] → [段落...]** |
| **トップ画像の出どころ** | **本文（post.content）内**。`article .content` の HTML の先頭要素が `<figure><img...></figure>`。ページ側で hero を別描画していない |
| **音声の出どころ** | **post.content への埋め込み**。`lib/posts.ts` の `parseHtmlPost` 内で `contentHtml` の先頭に文字列連結で prepend。ページ側の React 描画ではない |
| **静的 export 制約** | 全記事が `generateStaticParams` + `getPostBySlug` でビルド時に解决。ランタイム API なし。既存の `dangerouslySetInnerHTML` 方式を維持する前提 |

**結論**: 現状は「音声 → トップ画像」の順。要望は「トップ画像 → 音声」への入れ替え。

---

## B. 該当箇所一覧（ファイルパス:行番号）

| ファイルパス | 行番号 | 内容要約 |
|-------------|--------|----------|
| `app/posts/[slug]/page.tsx` | 84–99 | 記事レイアウト。`header`（タイトル・日付）の直後に `div` で `post.content` を `dangerouslySetInnerHTML` 描画。hero や audio の個別描画なし |
| `app/posts/[slug]/page.tsx` | 36–37 | `post.hero` は OGP 用の `resolveHeroSrc(post.hero)` のみ。画面表示には未使用 |
| `lib/posts.ts` | 369–391 | `contentHtml` 抽出 → `replaceAffiliateLinksWithCards` → `audioSrc` 解決 → **audio ブロックを contentHtml 先頭に prepend** |
| `lib/posts.ts` | 382–383 | `hero` は `$("article img, .content img, body img").first().attr("src")` で取得。`content` 内の先頭 img の src |
| `lib/posts.ts` | 388–391 | 現在の挿入: `contentHtml = audioBlock + contentHtml`（prepend） |
| `lib/posts.ts` | 297–320 | `resolveAudioSrcForTitle` により `audioSrc` をビルド時に解決 |
| `app/globals.css` | 192–199 | `.post-audio` のスタイル（affiliate-card 寄せ） |
| `app/globals.css` | 125–191 | `.affiliate-card` 系スタイル（参照用） |
| `content/posts/『ポラリス・キャピタリズム』で学ぶ、日本型PEの価値創造.html` | 22 | `div.content` の先頭: `<figure><img...></figure><figure><img...></figure><p>...`。全記事とも先頭が figure の想定 |

---

## C. 改修案（2案比較）

### 案1: ページ側で audio UI を「トップ画像の下」に描画し、content への audio 埋め込みはやめる

**概要**:
- `lib/posts.ts`: content への audio 挿入を削除。`audioSrc` の解決のみ継続。
- `app/posts/[slug]/page.tsx`: `post.content` の直前に、`post.audioSrc` がある場合のみ audio ブロックを React で描画。
- ただし、トップ画像は **post.content 内** のため、「トップ画像の下」に audio を置くには、content を分割する必要がある。

**実装パス**:
1. `parseHtmlPost` で content の先頭 figure を抽出し、`heroBlock`（HTML 文字列）と `contentWithoutHero` に分割
2. ページで `heroBlock` → `audio (if audioSrc)` → `contentWithoutHero` の順で描画
3. 変更: `lib/posts.ts`（content 分割）、`app/posts/[slug]/page.tsx`（3ブロック描画）、`Post` 型（heroBlock?, content の意味変更）

**メリット**:
- ページ側で制御が明確。アクセシビリティや文言追加が React で扱いやすい

**デメリット**:
- content 分割により `Post` 型とパース処理の変更が大きい
- 全記事で「先頭が figure」かどうかの前提が必要
- 将来的に HTML 構造が変わると、分割ロジックの見直しが必要

**リスク**: 中〜高（content 分割の影響範囲が広い）

---

### 案2: content 内の最初の figure（トップ画像相当）の直後に audio を挿入

**概要**:
- `lib/posts.ts` のみ変更。prepend をやめ、cheerio で「最初の figure の直後」に audio ブロックを挿入。
- 先頭が figure でない記事は prepend にフォールバック（現状維持）。

**実装パス**:
1. `contentHtml = replaceAffiliateLinksWithCards(contentHtml)` の後
2. cheerio で `#__audio-root` に contentHtml をラップ
3. `$("#__audio-root figure").first()` を取得し、存在すれば `.after(audioBlock)`、なければ `$("#__audio-root").prepend(audioBlock)`
4. 挿入する `audioBlock` に見出し・補足文を追加（要望2対応）

**メリット**:
- 変更は `lib/posts.ts` に限定
- ページ側・`Post` 型・`dangerouslySetInnerHTML` はそのまま
- 既存の HTML 加工パイプライン（`replaceAffiliateLinksWithCards`）と同じ cheerio パターンで一貫

**デメリット**:
- 先頭が figure でない記事では prepend のまま（画像なし記事では「トップ画像の下」の概念がなく、現状の挙動で妥当）

**リスク**: 低（影響範囲が小さい）

---

## D. 推奨案

**推奨**: **案2（content 内の最初の figure の直後に挿入）**

**理由**:
1. 変更が `lib/posts.ts` に限定され、最小変更で実現できる
2. トップ画像が content 内にあるため、「最初の figure の直後」が「トップ画像の下」に相当する
3. 記事詳細ページは一切変更不要で、静的 export の制約にもそのまま適合
4. 案1のような content 分割は、将来の HTML 構造変更の影響を受けやすく、今回の目的に対して過剰

**実装の最小ステップ**:

1. **lib/posts.ts**（387–391行付近）の変更  
   - 現状: `contentHtml = audioBlock + contentHtml`  
   - 変更: cheerio で `#__audio-root` にラップし、`$("#__audio-root figure").first()` の直後に audio を挿入。figure がなければ prepend。

2. **audioBlock の拡張**（要望2対応）  
   - 見出し（例: 「音声解説はこちら」）と補足文（例: 「通勤中や作業中にも聴けます」）を追加  
   - HTML 例:  
     ```html
     <div class="post-audio" role="region" aria-label="音声">
       <p class="post-audio__label">音声解説はこちら</p>
       <p class="post-audio__hint">通勤中や作業中にも聴けます</p>
       <audio controls preload="none" src="..."></audio>
     </div>
     ```

3. **app/globals.css**  
   - `.post-audio__label`、`.post-audio__hint` のスタイルを追加（既存 `.post-audio` に合わせて控えめに）

**期待する最終の表示順序**:
1. Breadcrumb  
2. タイトル  
3. 日付  
4. 本文内: **[トップ画像（先頭 figure）] → [音声ブロック（見出し+補足+プレイヤー）] → [2枚目画像] → [段落...]**

---

## E. UI 文言案（日本語で 3 パターン）

### 短い見出し文

| トーン | 案 |
|--------|-----|
| フラット | 音声解説はこちら |
| 少しカジュアル | 聴いて学ぶならこちら |
| よりプロ寄り | 本記事の音声解説 |

### 補足文

| トーン | 案 |
|--------|-----|
| フラット | 通勤中や作業中にも聴けます |
| 少しカジュアル | 移動中やながら聴きにどうぞ |
| よりプロ寄り | スキマ時間での学習にご活用ください |

**推奨組み合わせ（フラット）**: 見出し「音声解説はこちら」＋ 補足「通勤中や作業中にも聴けます」

---

## F. テスト観点

| 観点 | 確認方法 |
|------|----------|
| 音声ファイルがある記事で「トップ画像の下」に出ること | 該当記事（例: 『ポラリス・キャピタリズム』...）で、先頭 figure の直後に音声ブロックが表示されること |
| 音声が無い記事で出ないこと | 音声ファイルのない記事で、音声ブロックが表示されないこと |
| 二重表示が起きないこと | 音声ブロックが 1 回だけ表示されること（prepend 削除により、既存の prepend 由来の二重表示は解消） |
| src の URL エンコードが正しいこと | Network タブで音声リクエストが 200 で返ること |
| 既存のリンクカードや本文レンダリングが壊れていないこと | affiliate-card、外部リンクカード、本文の figure/p が従来通り表示されること |
| 先頭が figure でない記事でのフォールバック | 該当記事があれば、音声が先頭に prepend されることを確認（現状の挙動） |

---

## 付録: 案2 の実装コード例（挿入ロジック）

```ts
// lib/posts.ts 387–391 行付近の変更

const audioSrc = resolveAudioSrcForTitle(title);
if (audioSrc) {
  const audioBlock = `<div class="post-audio" role="region" aria-label="音声"><p class="post-audio__label">音声解説はこちら</p><p class="post-audio__hint">通勤中や作業中にも聴けます</p><audio controls preload="none" src="${audioSrc}"></audio></div>`;
  const wrapped = `<div id="__audio-root">${contentHtml}</div>`;
  const $aud = load(wrapped);
  const firstFigure = $aud("#__audio-root figure").first();
  if (firstFigure.length) {
    firstFigure.after(audioBlock);
  } else {
    $aud("#__audio-root").prepend(audioBlock);
  }
  contentHtml = $aud("#__audio-root").html() ?? contentHtml;
}
```

**注意**: `replaceAffiliateLinksWithCards` の戻り値に対して実行するため、cheerio の `load` を再度使用する。既存の `$` は `parseHtmlPost` 冒頭で raw HTML 用に作成されているため、処理済みの contentHtml 用に別の `load` でパースする。

---

*レポート作成日: 2025-02-12*
