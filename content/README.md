# コンテンツディレクトリ

このディレクトリには、ブログ記事の MDX ファイルが格納されます。

## 📁 構造

```
content/
└── posts/          # 記事の MDX ファイル
    ├── post-1.mdx
    ├── post-2.mdx
    └── ...
```

## ✍️ 記事の追加

### 1. 新しい MDX ファイルを作成

`content/posts/` ディレクトリに `.mdx` ファイルを作成します。

### 2. Frontmatter を記述

```yaml
---
title: "記事のタイトル"
date: "2025-01-08"
description: "記事の説明文（200文字程度）"
tags: ["IELTS", "Writing", "英語学習"]
hero: "/assets/hero-image.png"
slug: "article-slug"
---
```

### 3. 本文を記述

Markdown または HTML で記事を記述できます。

```markdown
## 見出し2

段落のテキストです。

### 見出し3

- リスト項目1
- リスト項目2

画像の挿入:
![代替テキスト](/assets/image.png)
```

## 🖼️ 画像の使用

画像は `public/assets/` ディレクトリに配置し、記事内で以下のように参照します：

```markdown
![画像の説明](/assets/image-name.png)
```

または HTML:

```html
<img src="/assets/image-name.png" alt="画像の説明" />
```

## 🏷️ タグの推奨

よく使用されるタグ：

- **IELTS**: IELTS全般
- **Writing**: ライティング関連
- **Speaking**: スピーキング関連
- **Reading**: リーディング関連
- **Listening**: リスニング関連
- **Task 1**: Task 1関連
- **Task 2**: Task 2関連
- **外資系**: 外資系コンサル関連
- **英語学習**: 英語学習全般
- **ビジネス英語**: ビジネス英語
- **語彙**: 語彙・単語
- **文法**: 文法
- **表現**: 表現・フレーズ

## 🔄 記事のインポート

既存の HTML ファイルから記事をインポートする場合：

```bash
pnpm run import:note
```

このコマンドで `ielts_consult/*.html` が MDX 形式に変換され、このディレクトリに保存されます。

## 📝 記事の命名規則

- ファイル名: `slug.mdx`
- slug は英数字とハイフンのみ使用
- 例: `ielts-writing-tips.mdx`

## 🚀 記事の公開

1. MDX ファイルを `content/posts/` に保存
2. 画像を `public/assets/` に配置
3. `pnpm run dev` で確認
4. Git にコミット
5. Netlify に自動デプロイ

## 📋 チェックリスト

新しい記事を公開する前に：

- [ ] Frontmatter が正しく記述されている
- [ ] タイトルと説明文が適切
- [ ] タグが適切に設定されている
- [ ] 画像パスが正しい（`/assets/...`）
- [ ] 本文に誤字脱字がない
- [ ] ローカルで表示を確認した

## 🎨 記事のカスタマイズ

### Amazon 商品カードの挿入

```jsx
import { AmazonProductCard } from "@/components/amazon-product-card";

<AmazonProductCard
  title="商品名"
  asin="B08XXXXXX"
  price="¥2,980"
  description="商品の説明"
  imageUrl="/assets/product-image.png"
/>
```

### 広告スロットの挿入

```jsx
import { AdSlot } from "@/components/ad-slot";

<AdSlot slot="custom-ad" format="horizontal" />
```

## 📚 参考

- [Markdown ガイド](https://www.markdownguide.org/)
- [MDX ドキュメント](https://mdxjs.com/)
- [Frontmatter 仕様](https://jekyllrb.com/docs/front-matter/)

---

質問があれば、[お問い合わせ](/contact)からご連絡ください。
