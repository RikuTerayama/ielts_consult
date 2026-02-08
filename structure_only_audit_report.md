# Structure-Only Transformation: Audit Report

**Summary**  
This report analyzes the ielts-consult-main repository so it can be turned into a **structure-only** site: all article/content payloads and ad-related code are to be removed, while keeping routing, layouts, navigation, styling, shared UI, build config, and deployment. No code changes are made here; the report is the deliverable for someone else to implement the cleanup safely.

---

## 1. Repo overview

### Framework and routing
- **Framework**: Next.js 14.2 (App Router only; no `pages/` directory).
- **Build**: Static export (`output: 'export'` in `next.config.mjs`). No server runtime; all routes are pre-rendered at build time.
- **Deploy**: Netlify. Build command in `netlify.toml`: `pnpm run import:note && pnpm run build`. Publish directory: `out`.

### Content system
- **Primary content**: HTML files at **repository root** named `n*.html` (e.g. `n019aaecea296.html`). Read from `process.cwd()` by `lib/posts.ts` and `lib/html-posts.ts`.
- **Secondary**: Optional MD/MDX in `content/posts/` (currently empty; `.gitkeep` only). `lib/posts.ts` checks `content/posts/[slug].mdx` or `.md` before falling back to root HTML.
- **Article “additions”**: `content/additions/[slug].mdx` (e.g. takeaways, practice, FAQ). Loaded by `getPostAddition()` in `lib/posts.ts`. Only `.template.mdx` and `README.md` exist under `content/additions/`; no per-article MDX in use.
- **Parsers/loaders**:  
  - Root HTML: `fs` + `JSDOM` + `sanitize-html` in `lib/posts.ts`; regex + optional JSDOM in `lib/html-posts.ts`.  
  - MD/MDX: `gray-matter`, `reading-time`; `next-mdx-remote` (RSC) in `components/post-addition.tsx`.
- **No CMS**: No external CMS or API for posts; no Contentlayer.

### Ad system
- **Provider**: Google AdSense.
- **Script**: In `app/layout.tsx`, conditional on `NEXT_PUBLIC_REVIEW_MODE !== "true"`:  
  `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4232725615106709`
- **Component**: `components/ad-slot.tsx` (`AdSlot`) — renders `<ins class="adsbygoogle">` and uses `window.adsbygoogle.push({})`. Shown when `NEXT_PUBLIC_REVIEW_MODE !== "true"` and `NEXT_PUBLIC_ENABLE_ADS !== "false"`.
- **Env vars**:  
  - `NEXT_PUBLIC_REVIEW_MODE` (review mode: hide ads).  
  - `NEXT_PUBLIC_ENABLE_ADS`.  
  - `NEXT_PUBLIC_ADSENSE_CLIENT` (default `ca-pub-4232725615106709`).  
  - `NEXT_PUBLIC_ADSENSE_SLOT` (optional).
- **Metadata**: `app/layout.tsx` exports `metadata.other["google-adsense"] = "ca-pub-4232725615106709"`.
- **Config**: `netlify.toml` sets `NEXT_PUBLIC_ENABLE_ADS`, `NEXT_PUBLIC_ADSENSE_CLIENT` (and commented `NEXT_PUBLIC_ADSENSE_SLOT`).
- **Policy pages**: `app/privacy/page.tsx`, `app/affiliate-disclosure/page.tsx`, `app/cookie-policy/page.tsx` mention AdSense/affiliate in copy only (no scripts).

---

## 2. Route map

| Route | Definition (file path) | Main components / data | Content-dependent? |
|-------|------------------------|------------------------|--------------------|
| `/` | `app/page.tsx` | `HeroSection`, `Sidebar`, `PostCardList`, `AdSlot`, `TrainingAppCTA`, `FadeIn*` | Yes: `getAllPosts()`, latest/popular posts, ItemList schema |
| `/posts` | `app/posts/page.tsx` | `Breadcrumb`, `PostsPageClient` (wraps `PostCardList`) | Yes: `getAllPosts()`, CollectionPage schema |
| `/posts/[slug]` | `app/posts/[slug]/page.tsx` | `AdSlot`, `ReadingProgress`, `GiscusComments`, `Breadcrumb`, `PostAddition`, `AuthorBox`, `Tooltip`, `Button` | Yes: `getPostBySlug`, `getPostAddition`, post body HTML, prev/next, related |
| `/posts` (client) | `app/posts/page-client.tsx` | `PostCardList`, `FadeIn`, `FadeInHeading` | Yes: receives posts from server |
| `/tags` | `app/tags/page.tsx` | Badge, links | Yes: `getAllHtmlPosts()`, tag list/counts |
| `/tags/[tag]` | `app/tags/[tag]/page.tsx` | `PostCard` | Yes: `getPostsByTag()` (from posts), list by tag |
| `/steps` | `app/steps/page.tsx` | `Breadcrumb`, links | No (structure): `getAllSteps()` from config |
| `/steps/[step]` | `app/steps/[step]/page.tsx` | `PostCard` | Yes: `getPostsByStep()` (html-posts), list by step |
| `/skills/[skill]` | `app/skills/[skill]/page.tsx` | `PostCard` | Yes: `getPostsBySkill()`, skill mapping |
| `/search` | `app/search/page.tsx` + `layout.tsx` | `Input`, `PostCard` | Yes: fetches `/api/posts`, filters posts client-side |
| `/api/posts` | `app/api/posts/route.ts` | — | Yes: returns `getAllPosts()` JSON |
| `/about` | `app/about/page.tsx` | — | No (static copy) |
| `/about-author` | `app/about-author/page.tsx` | — | No (static copy) |
| `/editorial-policy` | `app/editorial-policy/page.tsx` | — | No (static copy) |
| `/cookie-policy` | `app/cookie-policy/page.tsx` | — | No (static copy) |
| `/contact` | `app/contact/page.tsx` | — | No (static copy) |
| `/privacy` | `app/privacy/page.tsx` | — | No (static copy) |
| `/disclaimer` | `app/disclaimer/page.tsx` | — | No (static copy) |
| `/affiliate-disclosure` | `app/affiliate-disclosure/page.tsx` | — | No (static copy) |
| 404 | `app/not-found.tsx` | `Button` | No |

**Dynamic params (static export)**  
- `app/posts/[slug]/page.tsx`: `generateStaticParams()` reads root `n*.html` filenames.  
- `app/tags/[tag]/page.tsx`: `generateStaticParams()` derives tags from root HTML.  
- `app/steps/[step]/page.tsx`: from `getAllSteps()`.  
- `app/skills/[skill]/page.tsx`: from `getAllSkills()`.

---

## 3. Content inventory (article-related)

### 3.1 Content sources

| Path / area | Format | Loader / usage | Recommendation | Justification |
|-------------|--------|----------------|----------------|---------------|
| **Root `n*.html`** (e.g. `n019aaecea296.html`) | HTML | `lib/posts.ts` (`getPostFromHtml`), `lib/html-posts.ts`; `generateStaticParams` in posts & tags | **REMOVE** | These are the main article payloads. Deleting them (or moving off-repo) is required for structure-only. |
| **`content/posts/`** | (empty; `.gitkeep`) | `lib/posts.ts` checks `content/posts/[slug].mdx` or `.md` before HTML | **KEEP (empty)** or REMOVE dir | No actual posts here. Keeping an empty dir (or `.gitkeep`) avoids code changes in `getPostBySlug` if you later stub. |
| **`content/additions/`** | `.template.mdx`, `README.md` | `getPostAddition()` in `lib/posts.ts` reads `content/additions/[slug].mdx` | **REMOVE** article additions; **KEEP** README/template only if you want to document the future format | Additions are article-specific; for structure-only, no per-slug MDX. |
| **`public/assets/`** (and root `assets/` if tracked) | PNG (article images) | HTML references `src="/assets/..."`; Next serves from `public/` | **REMOVE** article images | All current images are tied to article content. Structural images (e.g. logo, og-image) keep. |
| **`public/rss.xml`**, **`public/sitemap.xml`** | XML | Generated by prebuild scripts from posts | **REPURPOSE** | Scripts should output structure-only sitemap (no post URLs); RSS can be empty or removed. |

### 3.2 Loaders / parsers (content pipeline)

| File / dep | Role | Recommendation | Justification |
|------------|------|-----------------|---------------|
| **`lib/posts.ts`** | getAllPosts, getPostBySlug, getPostFromHtml (root HTML), getPostAddition, getPostsByTag, getAllTags; PAID/PUBLIC gates | **REMOVE or STUB** | Core article loader. For structure-only, either remove and replace callers with stubs, or gut and leave minimal stub (e.g. return empty array / null). |
| **`lib/html-posts.ts`** | getPostFromHtml (root HTML), getAllHtmlPosts, getAllValidTags; used by tags page, steps, sitemap, RSS | **REMOVE or STUB** | Same as above; duplicate pipeline for tags/steps/sitemap/RSS. |
| **`lib/categories.ts`** | getPostsByStep (html-posts), getPostsBySkill (posts + skill mapping), getAllSteps, getAllSkills | **KEEP** with changes | Keep `getAllSteps`, `getAllSkills`; remove or stub post-fetching (getPostsByStep, getPostsBySkill) so steps/skills pages don’t depend on articles. |
| **`lib/search.ts`** | FlexSearch index over posts | **REMOVE** | Not imported anywhere in app; search uses `/api/posts` + client filter. Safe to delete. |
| **`gray-matter`**, **`reading-time`**, **`next-mdx-remote`** | MD/MDX and reading time | **REMOVE** (or keep only if you keep a tiny MDX placeholder) | Only used for content/posts and additions. |
| **`jsdom`**, **`sanitize-html`** | HTML parsing/sanitization for root HTML | **REMOVE** when post pipeline is removed | Used only in posts/html-posts and scripts. |

### 3.3 Article-only components

| Component | Path | Used by | Recommendation | Justification |
|-----------|------|---------|----------------|---------------|
| **PostCard** | `components/post-card.tsx` | Home, posts list, tags/[tag], steps/[step], skills/[skill], search | **REMOVE** or replace with placeholder card | Renders a single post (title, description, tags, link). No use without posts. |
| **PostCardList** | `components/post-card-list.tsx` | Home, posts page (via client) | **REMOVE** or stub | Wraps list of PostCards. |
| **PostAddition** | `components/post-addition.tsx` | `app/posts/[slug]/page.tsx` | **REMOVE** | Renders article additions (takeaways, practice, FAQ, next steps); uses MDX. |
| **AuthorBox** | `components/author-box.tsx` | `app/posts/[slug]/page.tsx` | **KEEP-BUT-REPURPOSE** | Can stay as generic “author” block for placeholder or future content; not article-body specific. |
| **ReadingProgress** | `components/reading-progress.tsx` | `app/posts/[slug]/page.tsx` | **KEEP** | Generic scroll indicator; can be used on any long page. |
| **Breadcrumb** | `components/breadcrumb.tsx` | Posts list, steps list, post detail | **KEEP** | Structural nav. |
| **GiscusComments** | `components/giscus-comments.tsx` | `app/posts/[slug]/page.tsx` | **REMOVE** or optional | Comment widget for article; structure-only typically drops it unless you want a generic “comments” placeholder. |
| **ArticleSource** | `components/article-source.tsx` | (none in app) | **REMOVE** | Unused; note/attribution block. |
| **ArticleIntro** | `components/article-intro.tsx` | (none in app) | **REMOVE** | Unused. |
| **ArticleInsights** | `components/article-insights.tsx` | (none in app) | **REMOVE** | Unused. |
| **NoteCTA** | `components/note-cta.tsx` | (none in app) | **REMOVE** | Unused; note CTA. |
| **OptimizedImage** | `components/optimized-image.tsx` | (none; only self) | **REMOVE** | Unused. |
| **AmazonProductCard** | `components/amazon-product-card.tsx` | (only in docs) | **REMOVE** | Not used in app. |

### 3.4 Config that is content/article-specific

| File | Role | Recommendation | Justification |
|-------|------|----------------|---------------|
| **`config/content-gate.ts`** | PUBLIC_POST_SLUGS / PUBLIC_POST_SET | **REMOVE** | Only used to gate which articles are public; no articles ⇒ remove. |
| **`config/paid-articles.ts`** | PAID_POST_SLUGS / PAID_POST_SLUG_SET | **REMOVE** | Same; filters paid note articles. |
| **`config/skill-article-mapping.ts`** | Maps skill IDs to post slugs + order | **REMOVE** | Article slugs only. |
| **`config/step-article-mapping.ts`** | Maps step IDs to post slugs + order | **REMOVE** | Article slugs only. |
| **`config/tag-article-mapping.ts`** | (if exists) Tag ↔ slugs | **REMOVE** | Same. |
| **`config/categories.ts`** | LEARNING_STEPS, SKILLS, CATEGORY_KEYWORDS, inferLearningStep | **KEEP** | Structural nav/labels; remove or stub any usage that expects article data. |
| **`config/links.ts`** | TRAINING_APP_URL etc. | **KEEP** | Structural. |

---

## 4. Ads inventory

| Location | What | How included | Removal step |
|----------|------|--------------|--------------|
| **`app/layout.tsx`** | AdSense script | Conditional `<Script src="https://pagead2.googlesyndication.com/...">` when `NEXT_PUBLIC_REVIEW_MODE !== "true"` | Remove the entire `{ process.env.NEXT_PUBLIC_REVIEW_MODE !== "true" && ( <Script ... /> ) }` block. |
| **`app/layout.tsx`** | AdSense meta | `metadata.other["google-adsense"] = "ca-pub-4232725615106709"` | Remove the `other["google-adsense"]` entry from exported `metadata`. |
| **`components/ad-slot.tsx`** | AdSlot component | Renders `<ins class="adsbygoogle">` and `window.adsbygoogle.push({})`; used in layout-like and list/detail pages | Delete file. Remove all imports and usages (see below). |
| **`components/sidebar.tsx`** | AdSlot | `import { AdSlot } from "@/components/ad-slot";` and `<AdSlot slot="sidebar-ad" format="vertical" />` | Remove import and `<AdSlot ... />` (and optionally the whole sidebar ad block). |
| **`app/page.tsx`** | AdSlot | Import and `<AdSlot ... />` in main content | Remove import and component usage. |
| **`app/posts/[slug]/page.tsx`** | AdSlot (×2) | Article top and article bottom slots | Remove both imports and both `<AdSlot ... />` instances. |
| **`netlify.toml`** | Env vars | `NEXT_PUBLIC_ENABLE_ADS`, `NEXT_PUBLIC_ADSENSE_CLIENT`, commented `NEXT_PUBLIC_ADSENSE_SLOT` | Remove or comment out these so no AdSense client is injected. |
| **`app/privacy/page.tsx`** | Copy only | Text about AdSense/Cookie | **Optional**: shorten or remove AdSense sentence; no script. |
| **`app/affiliate-disclosure/page.tsx`** | Copy only | Lists “Google AdSense” as program | **Optional**: remove or generalize; no script. |
| **`app/cookie-policy/page.tsx`** | Copy only | Mentions Google AdSense | **Optional**: same as above. |

**Ads-related logic inside content pipeline**  
- **`lib/posts.ts`**: Regex removal of `ad-container`, `adsbygoogle`, `ad-slot` from HTML body. Becomes irrelevant once HTML posts are removed; remove with the rest of the post-processing or leave harmless.

**No GTM or other ad tags** were found beyond AdSense.

---

## 5. Dependency map and safe deletion order

### 5.1 Who imports what (content/ads)

- **`lib/posts`** (getAllPosts, getPostBySlug, getPostAddition):  
  - `app/page.tsx`, `app/posts/page.tsx`, `app/posts/[slug]/page.tsx`, `app/api/posts/route.ts`, `lib/categories.ts`.
- **`lib/html-posts`** (getAllHtmlPosts, getAllValidTags, getPostFromHtml, getPostsByStep):  
  - `app/tags/page.tsx`, `app/steps/[step]/page.tsx`, `lib/categories.ts`, `scripts/generate-sitemap.ts`, `scripts/generate-rss.ts`.
- **`lib/categories`** (getPostsByStep, getPostsBySkill, getAllSteps, getAllSkills):  
  - `app/steps/page.tsx`, `app/steps/[step]/page.tsx`, `app/skills/[skill]/page.tsx`, `scripts/generate-sitemap.ts`.
- **`AdSlot`**:  
  - `app/page.tsx`, `app/posts/[slug]/page.tsx`, `components/sidebar.tsx`.
- **`PostCard`**:  
  - `app/posts/page-client.tsx` (via PostCardList), `app/tags/[tag]/page.tsx`, `app/steps/[step]/page.tsx`, `app/skills/[skill]/page.tsx`, `app/search/page.tsx`.
- **`PostCardList`**:  
  - `app/page.tsx`, `app/posts/page-client.tsx`.
- **`PostAddition`**:  
  - `app/posts/[slug]/page.tsx`.
- **`AuthorBox`**, **`ReadingProgress`**, **`GiscusComments`**, **`Breadcrumb`**, **`Tooltip`**:  
  - Used in `app/posts/[slug]/page.tsx` (and Breadcrumb in posts + steps).

### 5.2 Safe deletion order (topological)

1. **Remove ad usage and script**  
   - Remove AdSense script and `google-adsense` meta in `app/layout.tsx`.  
   - Remove `AdSlot` import and usage from `app/page.tsx`, `app/posts/[slug]/page.tsx`, `components/sidebar.tsx`.  
   - Delete `components/ad-slot.tsx`.  
   - Adjust `netlify.toml` env (remove/comment ad vars).

2. **Stub or replace content-dependent routes (no article data)**  
   - **`app/page.tsx`**: Stop calling `getAllPosts()`; pass empty array or stub data to `PostCardList`/Sidebar; remove or keep AdSlot removal from step 1.  
   - **`app/posts/page.tsx`** + **`app/posts/page-client.tsx`**: Stub posts to `[]` so `PostCardList` renders empty or a “Coming soon” message.  
   - **`app/posts/[slug]/page.tsx`**: For structure-only, either return `notFound()` for all slugs or render a minimal placeholder (e.g. “Coming soon”) without calling `getPostBySlug`/`getPostAddition`; remove AdSlot, PostAddition, GiscusComments, and optionally AuthorBox/ReadingProgress or keep for placeholder.  
   - **`app/tags/page.tsx`**: Stop using `getAllHtmlPosts()`; use empty tag list or static list.  
   - **`app/tags/[tag]/page.tsx`**: Stub `getPostsByTag` to `[]` or render “Coming soon”.  
   - **`app/steps/[step]/page.tsx`**: Stub `getPostsByStep` to `[]` (or keep step label/description from config).  
   - **`app/skills/[skill]/page.tsx`**: Stub `getPostsBySkill` to `[]`.  
   - **`app/search/page.tsx`**: Don’t fetch `/api/posts` or return empty array; show “Coming soon” or empty state.  
   - **`app/api/posts/route.ts`**: Return `[]` or remove route (if removed, search page must not call it).

3. **Remove or stub content loaders**  
   - Remove or gut `lib/posts.ts` (e.g. export `getAllPosts() => []`, `getPostBySlug() => null`, `getPostAddition() => null`).  
   - Remove or gut `lib/html-posts.ts` (e.g. `getAllHtmlPosts() => []`, `getAllValidTags() => []`, `getPostsByStep` can stay in categories or return []).  
   - In `lib/categories.ts`, keep `getAllSteps`, `getAllSkills`; make `getPostsByStep` and `getPostsBySkill` return `[]` (and remove dependency on config slug lists if those are deleted).

4. **Delete article-only components**  
   - Delete: `components/post-card.tsx`, `components/post-card-list.tsx`, `components/post-addition.tsx`, `components/article-source.tsx`, `components/article-intro.tsx`, `components/article-insights.tsx`, `components/note-cta.tsx`, `components/optimized-image.tsx`, `components/amazon-product-card.tsx`.  
   - Optionally remove `components/giscus-comments.tsx` (or keep for future use).  
   - Update any remaining imports (e.g. placeholder pages that still import PostCard) to use a simple placeholder component or remove the list.

5. **Remove content config and content files**  
   - Delete or empty: `config/content-gate.ts`, `config/paid-articles.ts`, `config/skill-article-mapping.ts`, `config/step-article-mapping.ts` (and `config/tag-article-mapping.ts` if present).  
   - Fix `lib/categories.ts`: remove imports of these and `getArticlesForSkill`; implement `getPostsBySkill` as “return []”.  
   - Delete all root `n*.html` files.  
   - Remove article images from `public/assets/` (and root `assets/` if tracked); keep structural assets (logo, og-image, etc.).  
   - Optionally remove `content/additions/*.mdx` (keep README/template if desired).

6. **Scripts and prebuild**  
   - **`scripts/generate-sitemap.ts`**: Stop using `getAllHtmlPosts()` (and post URLs); generate sitemap with static + steps + skills only (no /posts/, no /tags/[tag]).  
   - **`scripts/generate-rss.ts`**: Generate empty RSS or remove script; if removed, remove from `package.json` prebuild (e.g. `prebuild`: only sitemap or none).  
   - **`package.json`**: Update `prebuild` so it doesn’t depend on post data (e.g. `tsx scripts/generate-sitemap.ts` only, with updated script).  
   - **Netlify**: If `import:note` is only for importing posts, remove it from build command (`pnpm run build` only).

7. **generateStaticParams**  
   - **`app/posts/[slug]/page.tsx`**: Return `[]` so no post pages are generated (or keep one static slug for a single “Coming soon” page if desired).  
   - **`app/tags/[tag]/page.tsx`**: Return `[]` or a small fixed list of tag slugs for placeholder pages.  
   - **`app/steps/[step]/page.tsx`** and **`app/skills/[skill]/page.tsx`**: Keep as-is (driven by config, no article content).

8. **Optional cleanup**  
   - Delete `lib/search.ts`.  
   - Remove unused deps: e.g. `gray-matter`, `reading-time`, `next-mdx-remote`, `jsdom`, `sanitize-html` (after pipeline removal).  
   - Remove or repurpose content-only scripts: `analyze-note-cta-articles.ts`, `remove-note-cta.ts`, `remove-note-cta-articles.ts`, `list-note-links.ts`, `audit-adsense-readiness.ts`, `debug-title-duplication.ts`, `import-note-posts.ts`, `fix-*.ts`, `truncate-articles.ts`, etc., or keep for reference.

---

## 6. Keep list (structure skeleton)

**Keep (no or minimal change)**  
- **Layout**: `app/layout.tsx` (minus AdSense script and meta), `app/globals.css`.  
- **Nav**: `components/header.tsx`, `components/footer.tsx`.  
- **Theme**: `components/theme-provider.tsx`, `components/theme-toggle.tsx`.  
- **Generic UI**: `components/ui/*` (badge, button, card, input).  
- **Structural**: `components/breadcrumb.tsx`, `components/sidebar.tsx` (without AdSlot and without post-dependent “recent posts” / “popular tags” if desired; or simplify to steps/links only), `components/hero-section.tsx`, `components/training-app-cta.tsx`, `components/tooltip.tsx`.  
- **Anim**: `components/anim/fade-in.tsx`, `components/anim/fade-in-heading.tsx`, `components/anim/fade-in-section.tsx`.  
- **Utilities**: `lib/utils.ts`.  
- **Config**: `config/categories.ts` (LEARNING_STEPS, SKILLS; no article slugs), `config/links.ts`.  
- **Static pages**: `app/about/page.tsx`, `app/about-author/page.tsx`, `app/contact/page.tsx`, `app/editorial-policy/page.tsx`, `app/cookie-policy/page.tsx`, `app/privacy/page.tsx`, `app/disclaimer/page.tsx`, `app/affiliate-disclosure/page.tsx`.  
- **404**: `app/not-found.tsx`.  
- **Build/deploy**: `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.*`, `.eslintrc.json`, `.gitignore`, `netlify.toml` (with ad env removed).  
- **Structural assets**: e.g. `public/robots.txt`, `public/ads.txt` (optional), `public/_redirects`, logo/og-image if not article-specific.

**Keep but adjust**  
- **`components/reading-progress.tsx`**: Keep; use only if you have a long placeholder or future page.  
- **`components/author-box.tsx`**: Keep as generic block; use on placeholder or remove from post page.  
- **Steps/skills routes**: Keep routes; content becomes “0 articles” or “Coming soon” (no PostCard list or empty list).  
- **`app/search/page.tsx`** + **`app/search/layout.tsx`**: Keep route; page shows empty or “Coming soon” without calling `/api/posts` or with empty data.

**Placeholders to specify (do not implement in this audit)**  
- **`/`**: Shell with HeroSection, Sidebar (no posts), optional “Coming soon” where post list was.  
- **`/posts`**: “Coming soon” or empty list message.  
- **`/posts/[slug]`**: Either 404 for all or a single generic “Coming soon” / “Article” placeholder.  
- **`/tags`**: Empty tag list or “Coming soon”.  
- **`/tags/[tag]`**: “Coming soon” or “No posts”.  
- **`/steps/[step]`**: Step title + description + “0 articles” or “Coming soon”.  
- **`/skills/[skill]`**: Skill title + “Coming soon” or “0 articles”.  
- **`/search`**: Search box + “Coming soon” or empty results.

---

## 7. High-level implementation plan

1. **Ads removal**  
   - In `app/layout.tsx`, remove AdSense Script block and `metadata.other["google-adsense"]`.  
   - Remove all `AdSlot` imports and usages; delete `components/ad-slot.tsx`.  
   - In `netlify.toml`, remove or comment ad-related env vars.

2. **Stub data and routes**  
   - Ensure no route calls `getAllPosts()`, `getPostBySlug()`, `getPostAddition()`, `getAllHtmlPosts()`, `getPostsByTag()`, `getPostsByStep()`, `getPostsBySkill()` with real data: either return empty arrays / null from libs or replace calls in pages with empty/stub data.  
   - Update home, posts list, tags (list + [tag]), steps [step], skills [skill], search, and API route so no article payload is rendered.  
   - For post detail: either always `notFound()` or render a single placeholder layout (no post body, no additions, no ads).

3. **Placeholders**  
   - Where post lists or tag lists were: show “Coming soon” or “No articles yet” (text or minimal component).  
   - Do not add new routes; only replace content of existing routes.

4. **Remove content pipeline and config**  
   - Gut or remove `lib/posts.ts`, `lib/html-posts.ts`; stub `lib/categories.ts` post-fetchers to `[]`.  
   - Remove `config/content-gate.ts`, `config/paid-articles.ts`, `config/skill-article-mapping.ts`, `config/step-article-mapping.ts` (and tag mapping if any); fix `lib/categories.ts` imports.

5. **Delete files**  
   - Root `n*.html`.  
   - Article-only components (see Section 3.3 and 5.2).  
   - `lib/search.ts`.  
   - Optional: `content/additions/*.mdx` (except template/README if kept).  
   - Article images in `public/assets/` (and root `assets/` if in repo); keep structural images.

6. **Scripts and build**  
   - Change `scripts/generate-sitemap.ts` to output only static + steps + skills URLs (no posts/tags).  
   - Change or remove `scripts/generate-rss.ts`; update `package.json` prebuild.  
   - Remove `import:note` from Netlify build command if it only imports posts.

7. **generateStaticParams**  
   - Posts: return `[]` (or one slug for a placeholder).  
   - Tags: return `[]` or a few static tag slugs for placeholder pages.  
   - Steps/skills: leave as-is.

8. **Dependencies**  
   - Remove unused: e.g. `gray-matter`, `reading-time`, `next-mdx-remote`, `jsdom`, `sanitize-html` (after pipeline removal). Run install and build to confirm.

9. **Validation**  
   - Run install, build, lint, typecheck (Section 8).  
   - Manually open key routes; confirm no article content and no AdSense script in HTML.

---

## 8. Validation checklist

### Commands (use repo package manager)

- **Install**: `pnpm install` (or `npm ci` / `npm install`).  
- **Lint**: `pnpm run lint` (or `npm run lint`).  
- **Typecheck**: If present, `pnpm run type-check` or `npx tsc --noEmit`.  
- **Build**: `pnpm run build` (or `npm run build`).  
  - Prebuild runs `generate-sitemap.ts` (and optionally RSS); ensure they don’t require post data or that stubbed scripts run successfully.

### Manual checks

- **Routes**: Open `/`, `/posts`, `/posts/any-slug`, `/tags`, `/tags/SomeTag`, `/steps`, `/steps/beginner`, `/skills/writing`, `/search`, `/about`, `/contact`.  
  - Expect: no article body, no post lists (or empty/“Coming soon”), no 500s.  
- **Ads**: View page source (or DevTools Network) on any route.  
  - Expect: no `googlesyndication.com`, no `adsbygoogle.js`, no `<ins class="adsbygoogle">`.  
- **Layout**: Header, footer, theme toggle, and nav links render; no runtime errors in console.

### SEO / performance sanity

- **Layout**: Meta tags and basic JSON-LD (e.g. WebPage in layout) still render.  
- **Sitemap**: `public/sitemap.xml` (or output of prebuild) contains only static + steps + skills URLs, no post URLs.  
- **RSS**: If kept, empty or no post items; if removed, no broken links from the site.

---

*End of report. No code was modified; this document is the sole deliverable for the structure-only transformation.*
