# AdSense承認の障害特定・監査レポート

> **目的**: 現状のリポジトリと生成物から、AdSense承認に不足している点を特定し、実装すべき対応を優先度付きで整理する。
> **実施日**: 2026-02-12

---

## A. 結論（推定される不承認理由トップ3〜5）

1. **AdSenseスクリプトが未実装** — サイト接続・広告表示の前提となる `adsbygoogle.js` が layout に含まれていない。審査時に AdSense がサイトを認識できない可能性が高い。
2. **タグページの「準備中」表示** — `/tags` が「タグ一覧を準備中です」のプレースホルダーのみ。サイトが未完成に見える。
3. **About ページの誤った記述** — 「コメント機能による読者との交流」と記載しているが、Giscus は未実装（CSS のみ存在）。虚偽表示の疑い。
4. **OG 画像の欠落** — `/og-image.jpg` が public に存在しない。記事に hero 画像がない場合、OG 画像が 404 になる。
5. **過去の「有用性の低いコンテンツ」指摘が残存するリスク** — note 由来の記事、内部リンク0、説明文の冒頭重複など、コンテンツ面の改善余地あり。

---

## B. P0（承認をブロックする可能性が高い）

### P0-1. AdSenseスクリプトが layout に含まれていない

| 項目 | 内容 |
|------|------|
| **症状** | `app/layout.tsx` の `<head>` および `<body>` に AdSense の `adsbygoogle.js` が存在しない。サイト接続・広告表示の前提が満たされていない。 |
| **根拠** | `app/layout.tsx` L70-107: `<head>` 内は viewport のみ。`<body>` 内に `Script` や `adsbygoogle` の記述なし。`grep` で `adsbygoogle` / `googlesyndication` を検索しても `app/` 配下にヒットしない。 |
| **直し方** | `app/layout.tsx` の `<head>` 内に以下を追加：`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4232725615106709" crossorigin="anonymous"></script>`。ads.txt の `pub-4232725615106709` と一致させる。静的 export では `next/script` の `strategy="afterInteractive"` は効果が限定的なため、通常の `<script>` で十分。 |
| **検証** | `npm run build` 後、`out/index.html` の `<head>` 内に上記 script が含まれることを確認。本番 URL で DevTools の Network タブで `adsbygoogle.js` が読み込まれることを確認。 |

### P0-2. タグページが「準備中」のまま

| 項目 | 内容 |
|------|------|
| **症状** | `/tags` が「タグ一覧を準備中です。しばらくお待ちください。」のみ。サイトが未完成に見える。 |
| **根拠** | `app/tags/page.tsx` L36-38: `<div className="text-center py-12 ..."><p className="text-muted-foreground">タグ一覧を準備中です。しばらくお待ちください。</p></div>` |
| **直し方** | （A）タグ機能を実装する: `lib/posts.ts` の `getAllTags` / `getPostsByTag` を実装し、`app/tags/page.tsx` でタグ一覧を表示。（B）暫定: タグページへの導線をヘッダー/フッターから削除するか、一時的に noindex にする。 |
| **検証** | 本番の `/tags/` にアクセスし、準備中表示がなくなっているか、または導線が適切に変更されているかを確認。 |

### P0-3. About ページの誤った記述（コメント機能）

| 項目 | 内容 |
|------|------|
| **症状** | About ページに「コメント機能による読者との交流」と記載があるが、記事ページに Giscus 等のコメントコンポーネントは実装されていない。 |
| **根拠** | `app/about/page.tsx` L46: `<li><strong>コメント機能による読者との交流</strong>：読者同士で意見交換や質問ができる環境を提供</li>`。`app/posts/[slug]/page.tsx` には Giscus やコメント関連の import/コンポーネントなし。`app/globals.css` に `.giscus-container` のスタイルはあるが、該当コンポーネントは未使用。 |
| **直し方** | `app/about/page.tsx` から上記の「コメント機能」の箇条書きを削除するか、「コメント機能は準備中」等に修正する。 |
| **検証** | 本番の `/about/` で該当記述が削除/修正されていることを確認。 |

---

## C. P1（承認率を上げる）

### P1-1. og-image.jpg が存在しない

| 項目 | 内容 |
|------|------|
| **症状** | `app/layout.tsx` および `app/posts/[slug]/page.tsx` で `/og-image.jpg` を参照しているが、`public/og-image.jpg` が存在しない。hero 画像がない記事では OG 画像が 404 になる。 |
| **根拠** | `app/layout.tsx` L36, 47: `url: "/og-image.jpg"`。`app/posts/[slug]/page.tsx` L39: `post.hero` が無い場合のフォールバック。`ls public/` で `og-image.jpg` なし。 |
| **直し方** | 1200x630 の OG 用画像を `public/og-image.jpg` として配置する。または、 hero が無い記事では `post.hero` の代わりに第一記事の画像やデフォルト画像を指定するロジックを追加。 |
| **検証** | `https://ieltsconsult.netlify.app/og-image.jpg` が 200 で返ることを確認。 |

### P1-2. 記事 HTML ソースの canonical が note.com を指している（Next の metadata は上書き済み）

| 項目 | 内容 |
|------|------|
| **症状** | `content/posts/*.html` の `<link rel="canonical" href="https://note.com/...">` が note.com を指している。ただし、Next の `generateMetadata` で `alternates.canonical` を返しているため、**表示される HTML の head は自サイトで上書きされる**。現状は問題なし。 |
| **根拠** | `app/posts/[slug]/page.tsx` L44-46: `alternates: { canonical: canonicalUrl }`。静的 export では Next が生成する HTML の head にこれが出力される。元の content/posts の HTML は本文（.content）のみ使用され、head は使われない。 |
| **直し方** | 現状対応不要。将来的に content の canonical を修正したい場合は、`scripts/convert-single-item-to-html.ts` または一括置換で `content/posts/*.html` の canonical を自サイトに書き換える。 |
| **検証** | `out/posts/[slug]/index.html` の `<link rel="canonical" href="https://ieltsconsult.netlify.app/...">` を確認。 |

### P1-3. 内部リンクが 0（記事間の相互リンクなし）

| 項目 | 内容 |
|------|------|
| **症状** | 記事本文内に同一ドメインへのリンクが 0 件。サイト構造が弱く、質の低いサイトに見えるリスク。 |
| **根拠** | docs/seo-audit-report.md の記事別監査: `internal_links` が全記事で 0。 |
| **直し方** | 関連記事セクション、次に読む記事、カテゴリ導線などを記事ページに追加する。`lib/posts.ts` の `getPostAddition` や `nextSteps` を活用する案。 |
| **検証** | 本番の記事ページで、同一ドメインへのリンクが表示されていることを確認。 |

---

## D. P2（中長期で効く）

### P2-1. About ページの h2 重複

| 項目 | 内容 |
|------|------|
| **症状** | 「コンテンツについて」が h2 で 2 回出現。見出し構造が不自然。 |
| **根拠** | `app/about/page.tsx` L26, L38: 両方とも `<h2>コンテンツについて</h2>` |
| **直し方** | 一方を「提供する価値」など別の見出しに変更する。 |
| **検証** | 目視で見出しの重複が解消されていることを確認。 |

### P2-2. 問い合わせが Twitter のみ

| 項目 | 内容 |
|------|------|
| **症状** | Contact ページが Twitter（X）のみ。メールフォーム等がないと「連絡先が不明」と判断される可能性。 |
| **根拠** | `app/contact/page.tsx` L26-28: `Twitter（X）: <a href="https://twitter.com/ielts_consult" ...>@ielts_consult</a>` |
| **直し方** | 運用方針に応じて、メールアドレスやフォームを追加する。 |
| **検証** | 問い合わせ導線が明確であることを確認。 |

### P2-3. コンテンツのオリジナリティ・有用性

| 項目 | 内容 |
|------|------|
| **症状** | 過去の AdSense 審査で「有用性の低いコンテンツ」を指摘された経緯がある。note 由来の記事、説明文の冒頭重複など。 |
| **根拠** | `AdSense審査結果分析レポート.md` 参照。 |
| **直し方** | 各記事に独自の分析・解説を追加する。説明文の重複を減らす。記事の文字数・深さを増やす。 |
| **検証** | コンテンツの質が向上していることを人手で確認。 |

---

## E. その他の確認結果（問題なし）

| 項目 | 状態 |
|------|------|
| robots.txt | `Allow: /`、`Sitemap: https://ieltsconsult.netlify.app/sitemap.xml` ✅ |
| sitemap.xml | 記事 URL を含む（24件 + 静的ページ）✅ |
| rss.xml | 記事 item を含む ✅ |
| 記事 canonical / OG / Twitter | generateMetadata で自サイトを指定 ✅ |
| ads.txt | `public/ads.txt` に `google.com, pub-4232725615106709, DIRECT, f08c47fec0942fa0` ✅ |
| Privacy / Cookie / Disclaimer / Affiliate disclosure | 存在し、フッターからリンク可能 ✅ |
| About / Contact | 存在し、本文あり ✅ |
| output: 'export' / trailingSlash | next.config.mjs で設定済み ✅ |

---

## F. 変更が必要なファイル一覧

| 種別 | パス |
|------|------|
| 修正 | `app/layout.tsx`（AdSense スクリプト追加） |
| 修正 | `app/about/page.tsx`（コメント機能の記述削除/修正、h2 重複解消） |
| 修正 | `app/tags/page.tsx`（準備中表示の解消、または導線変更） |
| 新規 | `public/og-image.jpg`（OG 用デフォルト画像） |
| 修正（任意） | `app/contact/page.tsx`（連絡先の充実） |
| 修正（任意） | 記事ページに関連記事・内部リンクを追加（コンポーネント・lib の拡張） |

---

## G. すぐ実装できる ToDo 順（上からやる順番）

1. **AdSense スクリプトを layout に追加** — `app/layout.tsx` の `<head>` に script タグを追加。5 分。
2. **About 页面の誤記述を修正** — コメント機能の記述を削除。h2 重複を解消。5 分。
3. **og-image.jpg を配置** — 1200x630 の画像を public に配置。10 分。
4. **タグページの対応** — 準備中表示を解消するか、タグ導線を一時的に削除/noindex。30 分〜。
5. **内部リンクの追加** — 関連記事セクション等の実装。1 時間〜。

---

## H. 付録：AdSense スクリプト追加案（実装時用）

```tsx
// app/layout.tsx の <head> 内に追加
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4232725615106709"
  crossOrigin="anonymous"
/>
```

- `client=` の値は `public/ads.txt` および AdSense 管理画面のパブリッシャー ID と一致させること。
- 環境変数 `NEXT_PUBLIC_ADSENSE_CLIENT` で管理する場合は、`?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}` のように読み込む。
