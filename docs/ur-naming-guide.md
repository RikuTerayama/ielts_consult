# URL命名ガイド（Slug）

## 基本ルール

### 1. 短く意味が伝わる
- ✅ `/ielts-writing-tips/`
- ✅ `/business-english-essentials/`
- ❌ `/article-about-how-to-improve-your-ielts-writing-score-and-tips/`

### 2. ハイフン区切り
- ✅ `/harley-lambswool-knit/`
- ✅ `/rockmount-flannel-skirt/`
- ❌ `/harley_lambswool_knit/` (アンダースコアは非推奨)

### 3. キーワードの自然な配置
- 主要キーワードを左側に配置
- 関連語を含める（ただしスパム化しない）
- 例: `/ielts-writing-task-2/`, `/consulting-job-interview-prep/`

### 4. 既存URL変更時の対応

既存URLを変更する場合は、リダイレクト表を作成し、`.htaccess`（または Netlify の `_redirects`）に301リダイレクトを追加します。

**リダイレクト表の例:**

```
# 旧URL -> 新URL
/ielts/writing-tips -> /ielts-writing-tips 301
/ielts/reading-tips -> /ielts-reading-tips 301
```

**Netlify の `_redirects` に追加:**

```
/ielts/writing-tips /ielts-writing-tips 301
/ielts/reading-tips /ielts-reading-tips 301
```

## ページタイプ別の命名例

### 記事ページ
- `/ielts-writing-task-2-analysis/`
- `/consulting-interview-english-preparation/`
- `/business-email-etiquette-guide/`

### カテゴリページ
- `/ielts-writing/`
- `/ielts-reading/`
- `/business-english/`

### タグページ
- `/tags/ielts-writing/`
- `/tags/consulting/`

## 注意事項

- **英数字のみ使用**: 日本語や記号は避ける
- **小文字のみ**: 大文字は使用しない
- **末尾スラッシュ**: Next.js の設定（`trailingSlash: true`）により末尾にスラッシュが付く
- **3-5単語程度**: 長すぎると覚えにくい
- **意味のある省略**: `guide` -> `gd`, `preparation` -> `prep` など

## 実装例

### Next.js App Router の場合

```typescript
// app/posts/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug, // 例: "ielts-writing-task-2-analysis"
  }));
}
```

## 参考

- [Google SEO ガイドライン](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [URL命名規則](https://developers.google.com/search/docs/crawling-indexing/url-structure)

