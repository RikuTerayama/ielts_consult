# Google AdSense 申請前サイト監査レポート

> **目的**: 現状リポジトリとデプロイ設定から追加で実施すべき事項を洗い出し、優先度付きの改善バックログにまとめる。
> **実施日**: 2026-02-12
> **対象**: ielts_consult-main リポジトリ（Next.js 14 / App Router / 静的 export）、Netlify デプロイ設定

---

## 1. 結論サマリー

### 申請可否の暫定判断

**追加対応後の申請を推奨**（今すぐ申請は非推奨、大幅改善後までは不要）

- 信頼性ページ（privacy, contact, about, affiliate-disclosure, cookie-policy, disclaimer, editorial-policy）は整備済み
- 記事数 24 件で AdSense 要件（10〜15 記事）を満たす
- ブロッカーを解消してから申請することを推奨

### ブロッカー上位 3 つ

1. **AdSense スクリプト未実装** — 審査時にサイト接続・広告表示の前提となる `adsbygoogle.js` が layout に含まれていない。app 配下で `adsbygoogle` を検索してもヒットしない。
2. **「準備中」プレースホルダー多発** — タグ一覧、検索、学習ステップ、スキル別ページが「準備中です」のまま。ヘッダー・フッター・サイドバーから到達可能で、サイトが未完成に見える。
3. **About ページの虚偽記述** — 「コメント機能による読者との交流」と記載があるが、コメント機能は未実装。虚偽表示の疑い。

---

## 2. 現状スナップショット

### サイト構成概要

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 14.2.0（App Router） |
| ビルド出力 | 静的 export（next.config.mjs L3: output: 'export'） |
| デプロイ先 | Netlify（netlify.toml L9: publish = "out"） |
| 本番 URL | https://ieltsconsult.netlify.app |
| 記事数 | 24 件（content/posts/*.html） |
| 総ページ数（概算） | 51 ページ（npm run build ログより） |

主要セクション:
- トップページ（/）
- 記事一覧（/posts/）
- 記事詳細（/posts/[slug]/）
- タグ一覧（/tags/）／タグ別（/tags/[tag]/）※準備中
- 検索（/search/）※準備中、入力欄 disabled
- 学習ステップ（/steps/、/steps/[step]/）※準備中
- スキル別（/skills/[skill]/）※準備中
- 信頼性ページ（privacy, contact, about, about-author, affiliate-disclosure, cookie-policy, disclaimer, editorial-policy）

### 重要設定の有無

| 設定 | 状態 | 根拠 |
|------|------|------|
| robots.txt | あり | public/robots.txt（Allow: /、Sitemap 指定） |
| sitemap.xml | あり | prebuild で scripts/generate-sitemap.ts により生成、記事 URL 含む |
| robots meta | index, follow | out/index.html の head 内に meta name="robots" |
| canonical | 各ページで設定 | out/index.html に link rel="canonical" href="https://ieltsconsult.netlify.app/" |
| OGP | あり | out/index.html に og:title, og:description, og:image 等 |
| Twitter Card | あり | twitter:card, twitter:title, twitter:image 等 |
| ads.txt | あり | public/ads.txt（google.com, pub-4232725615106709, DIRECT） |
| AdSense スクリプト | なし | out/index.html の head 内に adsbygoogle.js なし。rg "adsbygoogle" app でヒットなし |
| GA4 | なし | rg "gtag" app でヒットなし |
| Cache-Control | 未指定 | netlify.toml の [[headers]] に Cache-Control なし |

---

## 3. 指摘事項一覧（優先度付きバックログ）

| Priority | Category | Finding | Evidence | Impact | Recommendation | Fix scope |
|----------|----------|---------|----------|--------|----------------|-----------|
| Blocker | G | AdSense スクリプトが layout に含まれていない | app/layout.tsx の head/body に adsbygoogle.js なし。rg "adsbygoogle" app でヒットなし。out/index.html の head 内にも adsbygoogle なし | 審査時に AdSense がサイトを認識できない。サイト接続・広告表示の前提が満たされていない | head 内に adsbygoogle.js の script タグを追加。ads.txt の pub-4232725615106709 と一致させる。環境変数 NEXT_PUBLIC_ADSENSE_CLIENT で管理する場合は ?client= に読み込む | app/layout.tsx（5 分） |
| Blocker | B | タグ一覧が「準備中」のまま | app/tags/page.tsx L38: 「タグ一覧を準備中です。しばらくお待ちください。」。ヘッダー・フッターから /tags への導線あり | サイトが未完成に見える。審査時に質の低いサイトと判断される可能性 | タグ機能を実装するか、導線を削除するか、noindex にする | app/tags/page.tsx, lib/posts.ts, components/header.tsx, components/footer.tsx（30 分〜） |
| Blocker | B | 検索ページが「準備中」、入力欄 disabled | app/search/page.tsx L36: disabled。L42: 「検索機能を準備中です。」。ヘッダー・フッターから /search への導線あり | 同上 | 検索機能を実装するか、導線を削除するか、noindex にする | app/search/page.tsx, components/header.tsx, components/footer.tsx |
| Blocker | B | 学習ステップ・スキル別ページが「準備中」 | app/steps/[step]/page.tsx L57: 「この学習ステップの記事は準備中です。」。app/skills/[skill]/page.tsx L65: 「このスキルの記事は準備中です。」。lib/categories.ts の getPostsByStep は空配列を返す | 同上 | 記事とステップ/スキルの紐付けを実装するか、noindex にする | lib/categories.ts, app/steps/[step]/page.tsx, app/skills/[skill]/page.tsx |
| Blocker | A | About ページの虚偽記述（コメント機能） | app/about/page.tsx L46: 「コメント機能による読者との交流：読者同士で意見交換や質問ができる環境を提供」。app/posts/[slug]/page.tsx に Giscus 等のコメントコンポーネントなし | 虚偽表示の疑い。AdSense ポリシー違反のリスク | 該当箇条書きを削除するか「準備中」に修正 | app/about/page.tsx（5 分） |
| High | A | About ページの h2 重複 | app/about/page.tsx L26, L38: 両方とも「コンテンツについて」 | 見出し構造が不自然。軽微だが品質イメージに影響 | 一方を「提供する価値」など別の見出しに変更 | app/about/page.tsx（2 分） |
| High | A | 問い合わせが Twitter のみ | app/contact/page.tsx L26-28: Twitter（X）のみ。メールフォーム・メールアドレスなし | 連絡先が不明と判断される可能性。一部審査では不十分とされる場合あり | 運用方針に応じて、メールアドレスやフォームを追加 | app/contact/page.tsx |
| High | B | 記事 1 件が途中で切り捨て | content/posts/IELTS7.0を取った後、実際にビジネスで使える英語力に変える方法.html L22: 「ステップ2：業界特有の専門用語を習得</h3></div>」で終わり、以降の本文なし | 途中で終わった記事は薄いコンテンツとして評価されるリスク | 元ソースから欠落部分を補完し、記事を完成させる | content/posts/IELTS7.0を取った後、実際にビジネスで使える英語力に変える方法.html |
| High | B | 記事間の内部リンクがほぼ 0 | rg "ieltsconsult.netlify.app|/posts/" content/posts でヒットなし。app/posts/[slug]/page.tsx に関連記事セクションなし。Breadcrumb のみ（記事一覧へのリンク） | サイト構造が弱く、質の低いサイトに見えるリスク。リンクジュースが流れにくい | 関連記事セクション、次に読む記事、カテゴリ導線などを記事ページに追加 | app/posts/[slug]/page.tsx, lib/posts.ts（1 時間〜） |
| Medium | C | sitemap に未完成ページが含まれる | public/sitemap.xml: /tags/, /search/, /steps/*, /skills/* が含まれる。これらは「準備中」表示 | クローラーが未完成ページを発見する。サイト品質の誤解を招く可能性 | 未完成ページを sitemap から除外するか、noindex にした上で sitemap から除外した方が一貫 | scripts/generate-sitemap.ts |
| Medium | C | sitemap の URL エンコード（# 含む slug） | public/sitemap.xml L131 等: 「%25238」等の二重エンコード（【読む順#8】等）。lib/url.ts の encodePostSlugForPath で意図的に %23→%2523 | 静的パスとの整合性は要確認。404 になる可能性は低いが検証推奨（推定） | 本番で該当 URL にアクセスし、200 で表示されることを確認 | 検証のみ（修正不要の可能性あり） |
| Medium | D | 画像最適化が無効 | next.config.mjs L4-6: images: { unoptimized: true } | Core Web Vitals（LCP 等）に悪影響。転送量増 | 可能であれば unoptimized: false にし、Next/Image を使用。静的 export の制約を確認 | next.config.mjs, 画像参照箇所 |
| Medium | D | TypeScript/ESLint エラーをビルドで無視 | next.config.mjs L12-19: ignoreBuildErrors: true、ignoreDuringBuilds: true | 潜在的なバグを見逃す。品質管理上良くない | 型エラー・Lint エラーを解消し、無視設定を外す | next.config.mjs, 該当する ts/tsx ファイル |
| Medium | G | GA4 未実装 | rg "gtag" app でヒットなし。README では環境変数と layout への追加が必要と記載 | 申請後の PV 計測・トラフィック分析ができない。運用上不便。申請必須とは断定しない | 環境変数 NEXT_PUBLIC_GA_ID を設定し、layout に GA4 スクリプトを追加 | app/layout.tsx, Netlify 環境変数 |
| Low | F | Netlify に Cache-Control 未指定 | netlify.toml L17-23: [[headers]] に X-Frame-Options 等のみ。Cache-Control なし | キャッシュ効率が最適化されていない可能性 | 静的アセットに Cache-Control を追加するルールを検討 | netlify.toml |
| Low | E | 誤クリック誘導のリスク確認 | アフィリエイト表記ページ（app/affiliate-disclosure/page.tsx）で「誤クリックを誘導しないデザイン」と明記。該当文言は未検出（推定） | 現状問題なし。将来の運用で注意 | 広告周りの文言・配置を定期的に確認 | 運用ガイド |

---

## 4. 追加で実施すべき作業の提案（実装タスク化）

### すぐできる順（上から実施）

1. **AdSense スクリプトを layout に追加**
   - 完了条件: out/index.html の head 内に adsbygoogle.js の script が含まれる。本番 URL で DevTools の Network タブで adsbygoogle.js が読み込まれることを確認
   - 実装プロンプト例: 「app/layout.tsx の head 内に、環境変数 NEXT_PUBLIC_ADSENSE_CLIENT を使った AdSense スクリプト（adsbygoogle.js）を追加してください。未設定時はスクリプトを読み込まないようにしてください。」

2. **About 页面の誤記述を修正**
   - 完了条件: コメント機能の記述を削除。h2「コンテンツについて」の重複を解消
   - 実装プロンプト例: 「app/about/page.tsx から『コメント機能による読者との交流』の箇条書きを削除し、『コンテンツについて』が 2 回ある h2 のうち 2 つ目を『提供する価値』に変更してください。」

3. **タグページの暫定対応**
   - 完了条件: タグページを noindex にするか、ヘッダー/フッターからタグリンクを削除する
   - 実装プロンプト例: 「app/tags/page.tsx の metadata に robots: { index: false, follow: false } を追加してください。」または「ヘッダーとフッターからタグ一覧へのリンクを削除してください。」

4. **検索ページの暫定対応**
   - 完了条件: 検索ページを noindex にするか、検索導線を削除する
   - 実装プロンプト例: 「app/search/page.tsx に robots: { index: false, follow: false } を追加してください。」

5. **学習ステップ・スキル別ページの暫定対応**
   - 完了条件: 該当ページを noindex にするか、sitemap から除外する
   - 実装プロンプト例: 「app/steps/[step]/page.tsx と app/skills/[skill]/page.tsx に noindex を設定し、scripts/generate-sitemap.ts でこれらの URL を sitemap に含めないようにしてください。」

6. **IELTS7.0 記事の補完**
   - 完了条件: 「ステップ2：業界特有の専門用語を習得」以降の本文を追加し、記事が途中で切れていない状態になる
   - 実装プロンプト例: 「content/posts/IELTS7.0を取った後、実際にビジネスで使える英語力に変える方法.html の記事が『ステップ2：業界特有の専門用語を習得』の h3 で終わっています。元の note 記事または適切な補足文を追加して、記事を完成させてください。」

7. **GA4 タグの追加（オプション）**
   - 完了条件: NEXT_PUBLIC_GA_ID 設定時のみ layout に GA4 スクリプトが出力される
   - 実装プロンプト例: 「app/layout.tsx に、NEXT_PUBLIC_GA_ID が設定されている場合のみ Google Analytics 4 の gtag スクリプトを読み込むようにしてください。」

8. **内部リンクの追加**
   - 完了条件: 記事詳細ページに同一ドメインへのリンク（関連記事など）が表示される
   - 実装プロンプト例: 「app/posts/[slug]/page.tsx に、カテゴリやタグが近い記事へのリンクを表示する『関連記事』セクションを追加してください。」

---

## 5. 付録

### 検出した主要ページ一覧（URL と対応ファイル）

| URL | 対応ファイル |
|-----|--------------|
| / | app/page.tsx |
| /posts/ | app/posts/page.tsx |
| /posts/[slug]/ | app/posts/[slug]/page.tsx |
| /tags/ | app/tags/page.tsx |
| /tags/[tag]/ | app/tags/[tag]/page.tsx |
| /search/ | app/search/page.tsx |
| /about/ | app/about/page.tsx |
| /about-author/ | app/about-author/page.tsx |
| /contact/ | app/contact/page.tsx |
| /privacy/ | app/privacy/page.tsx |
| /cookie-policy/ | app/cookie-policy/page.tsx |
| /disclaimer/ | app/disclaimer/page.tsx |
| /editorial-policy/ | app/editorial-policy/page.tsx |
| /affiliate-disclosure/ | app/affiliate-disclosure/page.tsx |
| /steps/ | app/steps/page.tsx |
| /steps/[step]/ | app/steps/[step]/page.tsx |
| /skills/[skill]/ | app/skills/[skill]/page.tsx |

記事一覧（24 件）は content/posts/ の .html ファイルから生成。

### 実行したコマンドと要点

| コマンド | 結果 | 要点 |
|----------|------|------|
| npm run build | 成功（exit 0） | 51 ページ生成。prebuild で sitemap・RSS 生成実行 |
| npm run lint | 成功（exit 0） | 警告 2 件: post-card.tsx の img 要素、tooltip.tsx の useEffect 依存 |
| node -e "..." (記事数) | 24 | content/posts の .html ファイル数 |
| rg "準備中" app | 6 件 | tags, tags/[tag], search, steps/[step], skills/[skill]、および index ページのサイドバー（新着記事・人気タグ） |
| rg "adsbygoogle" app | 0 件 | AdSense スクリプト未実装 |
| rg "gtag" app | 0 件 | GA4 未実装 |

### 本番 URL 特定方法と根拠

- config/site.ts L6: SITE_URL = "https://ieltsconsult.netlify.app"
- public/robots.txt L3: Sitemap: https://ieltsconsult.netlify.app/sitemap.xml
- netlify.toml L8-9: build command, publish = "out"
- public/_redirects: ieltsconsult.netlify.app をドメインとして使用
- README.md には「ielts-consult.netlify.app」と記載ありが、config は「ieltsconsult」（ハイフンなし）。Netlify のサブドメインはプロジェクト名に依存するため、ダッシュボードで確認が必要（推定）
