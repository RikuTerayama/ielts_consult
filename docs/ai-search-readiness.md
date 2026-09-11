# IELTS CONSULT: AI search readiness audit and implementation

Audit date: 2026-09-11 (JST). This is a readiness assessment, not a promise of indexing, ranking, recommendations or AI citations.

## Before implementation

Start branch `codex/fix-search-console-indexing`; HEAD and freshly fetched `origin/main`: `003ecace081b187f4b9a37fdf43b40e35147ca25`. Tracked worktree clean. Existing untracked reports, source imports, cleanup files and scripts are excluded from this change. Local `main` was behind; it is fast-forwarded, not reset. No article import, media conversion, affiliate migration or new hosting site is part of this task.

Existing Netlify site `ieltsconsult`, ID `1aeccba1-fa57-4e93-8087-6bfddfc98e6f`; published deploy `6aa2ceda228fdf471efe256b` is ready at the same start commit. Public API does not expose repository build settings; repository remote, `netlify.toml`, prior deployment history and subsequent commit-matched production deployment are used to verify the workflow. Remote: `https://github.com/RikuTerayama/ielts_consult.git`.

### Architecture and inventory

Next.js 14.2 App Router, React 18, TypeScript, Tailwind, static export (`out`), trailing slash routes. Netlify builds with Node 20 and `pnpm run build`; pnpm 9.10. Prebuild generates external-link metadata, sitemap and RSS. Build currently skips TypeScript/lint, so both must run separately. No SSR-only article body or new runtime/API dependency is required.

`content/posts/*.html` is the 52-article registry. `lib/posts.ts` reads title/description/publication time/body, normalizes existing URLs, transforms affiliate cards and attaches existing audio by GUID/title. Original source canonical/OG references to note are provenance, not the final website metadata. `app/posts/[slug]/page.tsx` generates production metadata and JSON-LD. Tags are inferred using the existing rules; related articles use tags and a chronological neighbor. Images remain static public assets; no re-encoding. Audio stays controls/preload-none, never autoplay.

Fresh local production-output audit: 90 HTML outputs, 88 canonical pages, 75 indexable, 13 noindex (plus two 404 outputs); **52 indexable articles**, 13 tags, sitemap 75, RSS 52. No missing publication dates, canonical duplicates, double encoding, broken or redirecting internal links, orphan articles, sitemap omissions, noncanonical/noindex sitemap entries. No Article/BlogPosting duplication or article title/H1/description/OG/canonical conflict. All 52 have publication dates and JSON-LD, but **0 have a visible linked byline**. Existing dateModified always equals publication date, with no independent modification field. The parser has an unsafe unused mtime fallback. RSS has an unsafe invalid-date fallback. Both are to be removed without altering any known publication date.

Homepage, posts index, About, author, editorial, contact, cookies, disclaimer and affiliate-disclosure are present and indexable. Privacy, search, contact thanks, learning steps and skill landing pages retain their intentional noindex status. No terms page is added; the existing disclaimer is retained. Security headers, redirects, robots directives and Search Console verification stay unchanged. GA4 and AdSense each load once through RootLayout; no additional tracker is planned. Account dashboards and private Netlify environment-variable settings are not available through the current public API.

Baseline evidence: `ai-search-baseline.json` records every article/page, dates, source-body and affiliate/media fingerprints. It identifies 21 possible first-hand passages by regex, **not 21 independently verified experiences** (some are example sentences). Manually confirmed examples: `自己紹介と英語学習変遷` (six months / Overall 7.0 / learning alongside consulting work), the eight-book guide (materials used and section score progression), Writing article (Japanese planning), and practical-English articles (test-to-work gap). These remain self-reported, not independently certified. The eight-book guide reports Writing 6.5 while the later Writing article reports 7.0; test dates/supporting records are unavailable. Do not infer a new best score or combine scores from different sittings. Author overview will retain only already-published, consistent Overall 7.0 and TOEIC 900+ information.

Monetization baseline: Amazon cards 303, distinct affiliate URLs 170, product images 0 / fallbacks 303; article A8 sidebar 52, inline 71, pre-footer 22, maximum desktop 4/mobile 3. Homepage 3 desktop/2 mobile. Audio players 41 across 52 articles, body images 410. Existing restoration manifest: 28 articles, 250 images, 27 audio files. No media reconstruction. No IndexNow implementation/key file or local environment setting found.

### Priority 1 selection (before editing)

No account traffic/query data is accessible. Select five existing IELTS pillars by reader intent and evidenced gaps, not imaginary search-volume/citation metrics. No dedicated new Reading/Listening doorway pages.

| Existing article | Reason / diagnosed gap | Planned bounded change |
|---|---|---|
| 【完全保存版】独学でIELTS7.0を目指す人へ。おすすめ教材8選と使い方ガイド | Core independent-study/materials hub; genuine six-month learning account; answer buried below questions; overly universal outcomes and obsolete “latest” framing | Clear starting choice and personal scope, retain actual account and affiliate links, link to practical follow-ups; correct impossible 3500-word arithmetic |
| IELTS Writingで7.0を取る人の共通点：日本語での「型」の使い方 | Writing Task 2 / planning pillar; first-hand method but score guarantee and unattributed “instructor” claim | Answer-first, distinguish author's planning suggestion from official criteria, correct 40-minute guidance and schedule contradiction, add official source and two follow-ups |
| 【読む順-4｜面接の型】IELTSスピーキング完全対策：Part1〜3をテンプレ化して7.0へ | Speaking pillar; actionable recording cycle, but template equated with score and outcomes presented as measured | Bring practice goal forward, identify proposed routine/outcomes, cite official four criteria, retain all examples and link adjacent practice |
| 【読む順-6｜模試の回し方】公認IELTS模試3回分：解きっぱなしを卒業する復習設計 | Reading/Listening diagnosis pillar; useful error taxonomy but no official-vs-author boundary | Clear diagnostic answer, BC source for book status, distinguish three-week plan from verified result, contextual related links |
| 【読む順-8｜直前調整】Cambridge-IELTS-19：本番で取り切る最終チューニング | Time-management/last-weeks pillar; actionable routine but timing could be read as official | Clarify existing-book use and personal plan, cite Academic 60-minute Reading rule, not a required 20/20/20 split; contextual prior-step links |

All other article bodies remain untouched. Use ordinary prose and existing headings, not repeated AI-summary boxes. Set modification dates only on these five meaningful edits. No blanket freshness bump.

## Official references checked at execution time

- [OpenAI crawlers](https://developers.openai.com/api/docs/bots): OAI-SearchBot is search; GPTBot training control is independent; ChatGPT-User is user-initiated. Current wildcard allows them; preserve GPTBot policy. Official IP endpoint `https://openai.com/searchbot.json`; do not pin volatile IPs or weaken WAF globally.
- [OpenAI publisher FAQ](https://help.openai.com/en/articles/12627856): ChatGPT referrals include `utm_source=chatgpt.com`. Retain query parameters. User explicitly requests this official FAQ (outside the Docs skill's usual API domains).
- [Google 2026 AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Search Essentials](https://developers.google.com/search/docs/essentials), [people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [spam policies](https://developers.google.com/search/docs/essentials/spam-policies): normal crawl/index/content quality; no guaranteed visibility, no unnecessary llms.txt, chunking or engineered mentions. No AI-only pages/files/schema.
- [Generative AI report announcement](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports), [report help](https://support.google.com/webmasters/answer/16984139), [Search generative AI control](https://support.google.com/webmasters/answer/16908024): official 2026 pages confirm the new reports and inclusion control; rollout note says worldwide as of August 31, 2026. These supersede older guidance describing only combined Web performance. This site's actual account setting/data remains unverified.
- [Article](https://developers.google.com/search/docs/appearance/structured-data/article), [ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [dates](https://developers.google.com/search/docs/appearance/publication-dates), [canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [robots metadata](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), [title](https://developers.google.com/search/docs/appearance/title-link), [snippets](https://developers.google.com/search/docs/appearance/snippet): visible attribution, standard relationships, honest dates and canonical alignment.
- [Bing guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) and [Bing AI Performance](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview): technical SEO supports grounding; citations/grounding query samples are not rankings or proof of importance.
- [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers): PerplexityBot search vs Perplexity-User user-initiated access, not foundation-model training; current IP feeds are `https://www.perplexity.com/perplexitybot.json` and `https://www.perplexity.com/perplexity-user.json`.
- [IndexNow protocol](https://www.indexnow.org/documentation): explicit changed same-host URLs, ownership text file, response 200 means received and 202 pending key validation, neither guarantees indexing. Lightweight CLI is suitable; no build hook, periodic bulk submission or new dependency. No live submission until a real key is provisioned and production verified.

## Account follow-up checklist (not claimed completed)

1. Search Console: select/verify URL-prefix property `https://ieltsconsult.netlify.app/`; Sitemaps → submit/inspect `sitemap.xml`; URL Inspection → inspect the five Priority 1 canonical URLs, check selected canonical/rendered HTML and request indexing individually if needed.
2. Search Console → Settings → Search generative AI: check “Include my site's links and content…” or the effective inherited value. This is separate from Google-Extended training preferences. Do not change account settings silently.
3. Open Generative AI performance report (Search); compare dates, impressions, pages, countries and devices. Check the related Discover report only where data exists. Missing report/low impressions are not proof of broken implementation. Save a dated baseline before comparing later data.
4. Bing Webmaster Tools: verify/import the same site; Sitemaps → submit existing sitemap; URL Inspection → the same five URLs; IndexNow → inspect accepted submissions only after explicit submission. AI Performance → date range, Total Citations, cited pages and grounding query samples; group intents/topics only when shown. Do not infer rank from citations.
5. GA4 → Reports → Acquisition → Traffic acquisition, Session source/medium; inspect `chatgpt.com`, `perplexity.ai` and recognizable Bing/Copilot referrals. Explore landing page plus query string for `utm_source=chatgpt.com`; compare engagement/conversions over time with existing tracking only. Not all AI use sends a referrer; ordinary Bing traffic cannot all be labeled Copilot. No account measurements were read or settings changed here.

## Validation and deployment

Local validation completed before commit (2026-09-11):

| Command / check | Observed result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS; three pre-existing warnings (hero/post-card img, tooltip effect dependency) |
| `npm run build` | PASS; 92 Next route-generation tasks / 90 HTML outputs; process-only AdSense setting copied from the current public production HTML, without changing the environment mechanism |
| `npm run audit:ai` | PASS: 52 visible bylines, 52 preserved publication dates, 5 meaningful body modifications, 41 audio / 410 body images; source affiliate/media fingerprints and per-page advertising slots unchanged; schema, RSS metadata/dates and indexable sitemap coverage consistent |
| `npm run audit:indexing` | PASS: 52 articles, 13 tags, 75 sitemap URLs, RSS 52; broken/noncanonical internal links, canonical duplication/double encoding, orphan articles, sitemap violations all zero |
| `npm run audit:static` | PASS: 4,318 internal references; restoration manifest 28 articles / 250 images / 27 audio unchanged |
| `node scripts/audit-ad-density.mjs` | PASS: Amazon 303 cards/170 unique URLs; desktop/mobile max 4/3; sidebar 52, inline 71, pre-footer 22, unchanged |
| `npm run test:indexnow` | PASS: 6 tests, network mocked. Initial sandbox invocation failed with child-process EPERM; rerun outside that restriction passed |
| `node scripts/indexnow.mjs --dry-run <the five Priority 1 canonical URLs>` | PASS: keyReady=false, requestsSent=0 |
| `git diff --check` | PASS |
| Browser, local final static export | All five Priority 1 pages at 1440px: article 800px/sidebar ad 336px, no horizontal overflow or broken loaded images. 390px: same five pages readable, byline/update date shown; homepage also checked both widths; author and IELTS tag pages accessible. Audio controls on Writing article played to 12.46 seconds and paused, duration 1060.13 seconds |

No custom Google/Bing rich-result validation service was run: schema PASS means valid JSON-LD plus local semantic/identity/image/date checks, not a guarantee of a rich result. No new dependencies or lockfile changes. Browser population of third-party ad creatives remains dependent on the ad provider; URLs/creatives/pixels were not changed or clicked. No automated XML re-import/audio reconstruction is needed or performed.

An early artifact audit was started before build completion and inspected stale output; it is not used as final evidence. All artifact audit PASS results above were rerun after build exit 0. A line-ending-only fingerprint difference after fast-forwarding local main was accounted for without changing protected code.

Production verification runs **after** the commit has actually deployed: `npm run audit:production` (all pages/internal resources) and `node scripts/audit-ai-production.mjs --write-evidence` (52 articles plus homepage/author/editorial, live-vs-local semantic equality, robots/sitemap/RSS/ads.txt, 24 bot-UA requests). The latter writes ignored local evidence to `out/ai-production-audit.json`. The final delivery reports the actual new commit, Netlify deploy ID and observed results, not a predicted deployment status. Existing published deploy before this release is recorded above.

### Date/identity implementation details and remaining content limits

Only the five Priority 1 source documents gain `article:modified_time=2026-09-11` (date precision, no invented time-of-day). This drives visible update date, OG, BlogPosting and article sitemap lastmod. Other article dates and all RSS item publication dates stay intact. Source publication-date uncertainty: none missing, but no claim of independently verifying all historical note timestamps. Source note canonical/OG metadata stays intact as import provenance; output metadata is generated for this website.

Person `.../about-author/#person`, publisher Organization `.../#organization`, WebSite `.../#website`, article `<canonical>#article` are stable and distinct. Existing public site writing name `IELTS Consult` is retained. Existing note profile association is reused in sameAs; the note profile now displays Ateryn, but no new private identity, employer, client or account is inferred. The remaining Writing-score discrepancy described above needs the author's dated score evidence before any harmonization. We have not invented a new best score or new testimonial.

Citation readiness here means readable answers, attributable sources and crawlable stable pages—not a citation benchmark. Existing unedited articles can still contain broad claims, old product terms or unsupported statistics (for example the Writing-continuity article's percentage); those are content-review opportunities, not silently certified facts. No new AI-only pages, llms.txt, ai.txt, fake AI files or special schema were added. Existing GPTBot policy, security headers, training-app removal, query-string handling and GA/AdSense implementations are preserved.

Final schema review additionally found the existing homepage Organization referenced `/logo.png`, which does not exist. Removed this optional invalid property instead of inventing/replacing the site's logo; added recursive JSON-LD image-path checks. Baseline article metadata conflict count remains zero, but this is one **homepage schema media violation corrected**. RSS channel lastBuildDate now follows the latest real publication/modification date; all item pubDates remain original.

## IndexNow operation

`npm run indexnow -- "https://ieltsconsult.netlify.app/<changed-canonical-path>/"` is a dry run (zero requests). Supply only URLs materially changed in the release. Empty lists, foreign hosts, query/hash variants, duplicate URLs, missing output, mismatching canonical and noindex are rejected. No sitemap-wide default. This is deliberately not in prebuild/build/deploy hooks.

No existing key was found in root public text files or local environment; private Netlify variables were not accessible. Before enabling: check the existing Netlify environment for `INDEXNOW_KEY` and any externally managed ownership file; reuse it if present, never rotate silently. If none exists, generate one random 32-character hexadecimal key once (`node -e "console.log(require('node:crypto').randomBytes(16).toString('hex'))"`), create `public/<key>.txt` containing only that key in UTF-8, and deploy through the existing main workflow. That ownership file is intentionally public; it is not an API secret. Do not print private environment values in logs/reports.

After production deploy, run the dry command on the exact changed URLs. Only then append `--submit`. The tool checks the production key file and each URL (HTTP 200 with no redirect, canonical, HTML/header noindex) before one POST to IndexNow. It reports 200 as received, 202 as key validation pending; errors are not retried automatically. No live submission or new key is part of this release. This readiness limitation does not block normal sitemap discovery. Tests inject network responses and send no real requests.
