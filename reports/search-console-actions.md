# Google Search Console対応手順

更新日: 2026-09-10

## 結論

sitemapを再送信し、リダイレクトエラーとcanonical重複に関係する項目は「修正を検証」する。記事は正規化後のcanonical URLだけをURL検査へ投入する。削除済みのnote ID形式3記事、`privacy`、空の技能・学習ステップページ、検索準備中ページ、XML sitemapは無理にインデックスさせない。

正規URLルールは次のとおり。

- HTTPS / non-www
- NFC正規化
- パス内の英字は小文字
- ページURLは末尾スラッシュあり
- canonical・内部リンク・sitemap・RSSは同じURLのみを参照
- 非正規の大文字/末尾スラッシュなしURLはNetlify Pretty URLsにより最大1回の301で正規URLへ到達
- 代替記事が確定できない削除URLは404を維持し、404 HTMLは`noindex, follow`かつcanonicalなし

## Search Console対象URLのBefore / After

Beforeは2026-09-10の修正前productionへ実リクエストした結果。AfterはNetlify production deploy `6aa2ace1ced89b000848d7bf`（commit `08ccb0df7e801286dd856fa6219df89a6fe89017`）公開後の実測値。同一監査で公開HTML 88ページ、内部URL 561件、sitemap 75 URLを検証し、失敗0を確認した。

| URL | Before status | After status | Final URL | Canonical / indexable | Sitemap | Internal links | Action |
|---|---:|---:|---|---|---|---|---|
| `/posts/n15d8a98fb855` | 404、home canonical、`index` | 404 | 同URL | canonicalなし / noindex | No | 0 | 代替不明の削除済み旧記事。404維持 |
| `/posts/n15d8a98fb855/` | 404、home canonical、`index` | 404 | 同URL | canonicalなし / noindex | No | 0 | 同上 |
| `/posts/n2d360aa73005/` | 404、home canonical、`index` | 404 | 同URL | canonicalなし / noindex | No | 0 | 代替不明の削除済み旧記事。404維持 |
| `/posts/n17e52d8f3cbe` | 404、home canonical、`index` | 404 | 同URL | canonicalなし / noindex | No | 0 | 代替不明の削除済み旧記事。404維持 |
| `/posts/n17e52d8f3cbe/` | 404、home canonical、`index` | 404 | 同URL | canonicalなし / noindex | No | 0 | 同上 |
| `/tags/表現/` | 200、自己canonical | 200 | `/tags/表現/` | 自己canonical / index | Yes | Yes | 過去のredirect errorは現在再現せず。デプロイ後「修正を検証」 |
| `/skills/speaking/` | 200、`index`、記事0件 | 200 | 同URL | 自己canonical / noindex | No | 0 | タグと同一ではないが空の薄いハブ。本文を水増しせず非index化 |
| `/posts/【完全保存版】独学でielts7.0を目指す人へ。おすすめ教材8選と使い方ガイド/` | 200、canonicalだけ`IELTS`大文字 | 200 | 英字小文字の同URL | 自己canonical / index | Yes | Yes | デプロイ後にcanonical URLをURL検査・登録リクエスト |
| `/editorial-policy/` | 200 | 200 | 同URL | 自己canonical / index | Yes | Yes | 信頼性ページとしてindex維持。必要ならPriority BでURL検査 |
| `/posts/「英語で考えろ」は本当に正しい？純ジャパがIELTSで論理的に話すための秘訣/` | 301→小文字URL、canonicalは大文字 | 301→200 | `IELTS`を`ielts`にした末尾スラッシュURL | 最終URLへ自己canonical / index | Yes（最終URL） | Yes（最終URL） | 最終canonical URLだけURL検査 |
| `/privacy/` | 200、`index`、sitemap掲載 | 200 | 同URL | 自己canonical / noindex | No | Yes | 法務ページ。非indexで問題なし、登録リクエスト不要 |
| `/sitemap.xml` | 200 | 200 | 同URL | XML / 検索結果へのindex不要 | sitemap本体 | robotsから1リンク | Search Consoleで再送信 |
| `/tags/Speaking` | 301→`/tags/speaking/`、最終canonicalは大文字 | 301→200 | `/tags/speaking/` | 最終URLへ自己canonical / index | Yes（最終URL） | 0（旧URL） | 正規URLへ統一。「修正を検証」 |
| `/tags/speaking/` | 200、canonicalは`/tags/Speaking/` | 200 | 同URL | 自己canonical / index | Yes | Yes | 正規タグURL。必要ならURL検査 |
| `/posts/` | 200 | 200 | 同URL | 自己canonical / index | Yes | Yes | 52記事を掲載する一覧。index維持 |

## 1. sitemap.xmlの再送信

必要。修正後のsitemapは75 URL（記事52、タグ13、その他index対象10）で、重複0、3xx/4xx/noindex混入0。全記事と全タグに実際の公開日を基にした`lastmod`を付与し、ビルド日時で全URLを書き換えない。

Search Consoleの「サイトマップ」から次を再送信する。

`https://ieltsconsult.netlify.app/sitemap.xml`

robots.txtから同URLへの参照は維持されている。

## 2. 「修正を検証」を押す項目

1. 「リダイレクト エラー」: `/tags/表現/`と英字タグの正規化をproductionで確認後に実行。
2. 「重複：ユーザーにより正規ページとして選択されていません」: `/skills/speaking/`はnoindex・sitemap除外へ方針変更し、再クロール後の収束を確認。
3. 「クロール済み - インデックス未登録」: 技術要件が揃った記事canonicalと`/posts/`について検証。Googleの選択結果であり、全URLの即時登録を保証する項目ではない。
4. 「見つかりませんでした（404）」: 3記事は削除済みで代替不明のため404が正解。「修正済みURL」へ変える目的の検証は行わず、404 HTMLのnoindex反映をURL検査で一度確認するだけでよい。

## 3. URL検査 → インデックス登録をリクエスト

優先順位と全28 URLは[`google-indexing-submit-urls.md`](./google-indexing-submit-urls.md)を参照。大文字を含む旧URLやnote ID URLではなく、レポート記載の小文字canonical URLのみを投入する。

追加候補:

- Priority B: `https://ieltsconsult.netlify.app/posts/`
- Priority B: `https://ieltsconsult.netlify.app/editorial-policy/`
- Priority B: `https://ieltsconsult.netlify.app/tags/speaking/`
- Priority B: `https://ieltsconsult.netlify.app/tags/%E8%A1%A8%E7%8F%BE/`

## 4. 放置して問題ない404

- `/posts/n15d8a98fb855`（末尾スラッシュ有無とも）
- `/posts/n2d360aa73005/`
- `/posts/n17e52d8f3cbe`（末尾スラッシュ有無とも）
- 既存設定の`/posts/n2cd779121111`（末尾スラッシュ有無とも）

Git履歴ではいずれも過去に存在したnote ID形式の記事だが、現在の52記事に同一記事と断定できる代替URLがない。タイトルが似ているだけの記事へ301すると誤った統合になるため、404を維持する。緊急の検索結果削除が必要な場合を除き、Search Consoleの一時的な削除ツールは不要。

## 5. redirectで解消する旧URL

- `/tags/Speaking`、`/tags/Speaking/`、`/tags/speaking` → `/tags/speaking/`
- `/tags/IELTS`等の英字大文字/末尾スラッシュなしURL → `/tags/ielts/`
- 英字大文字を含む記事slug → 英字小文字・末尾スラッシュありの同一slug
- HTTPまたはwww → `https://ieltsconsult.netlify.app/...`
- `index.html`付きURL → 対応する末尾スラッシュURL

いずれも最終200まで最大1回の301とし、内部リンク・sitemapには転送元を掲載しない。

## 6. noindexまたは非indexで問題ないページ

- `/privacy/`: 法務ページ。`noindex, follow`、sitemap除外
- `/search/`: 機能準備中。`noindex, follow`、sitemap除外
- `/skills/*/`: 現在記事0件。`noindex, follow`、sitemap除外
- `/steps/`と`/steps/*/`: 現在分類記事0件。`noindex`、sitemap除外
- `/contact/thanks/`: 送信完了ページ。既存の`noindex`
- `/sitemap.xml`、`/rss.xml`: 検索結果へのindex対象ではない
- 正しい404ページ: `noindex, follow`

`/editorial-policy/`、`/posts/`、実体のあるタグ、全52記事はindex対象を維持する。

## 7. 1〜2週間後の再確認

1. 送信済みsitemapが「成功しました」となり、検出URL数が75前後か。
2. `/tags/表現/`のリダイレクトエラーが解消したか。
3. `/tags/Speaking`のGoogle選択canonicalが`/tags/speaking/`へ収束したか。
4. `/skills/speaking/`が「noindex タグによって除外されました」等の意図した状態か。
5. Priority A記事のURL検査で「Googleに登録されています」が増えているか。
6. 旧note ID URLが404として残っていても、新規内部リンクやsitemapから発見され続けていないか。
7. sitemapの3xx/4xx/noindex、canonical重複、クロール済み未登録の件数推移。

「クロール済み - インデックス未登録」は技術エラーとは限らないため、本文の水増しや無関係な大量リンクは行わない。Google公式でも非登録URLが必ずしもエラーではなく、後から登録される場合があると説明されている。

参考: [Google: ページのインデックス登録レポート](https://support.google.com/webmasters/answer/7440203)、[Google: 重複URLのcanonical統合](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)、[Google: リダイレクト](https://developers.google.com/search/docs/crawling-indexing/301-redirects)、[Google: サイトマップ](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
