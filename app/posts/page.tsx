import { getAllPosts } from "@/lib/posts";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { PostsPageClient } from "./page-client";
import { FadeInSection } from "@/components/anim/fade-in-section";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "IELTS対策から実践的なビジネス英語まで、外資系コンサル向けの記事を総合掲載。書き方のコツや語彙力アップの方法が分かります。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/posts/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PostsPage() {
  const posts = await getAllPosts();

  // Article構造化データ
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "記事一覧",
    "description": "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための記事一覧",
    "url": "https://ieltsconsult.netlify.app/posts/",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": posts.length,
      "itemListElement": posts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "headline": post.title,
          "description": post.description,
          "url": `https://ieltsconsult.netlify.app/posts/${post.slug}/`,
          "datePublished": post.date,
          "author": {
            "@type": "Person",
            "name": "IELTS Consult"
          },
          "keywords": post.tags.join(", ")
        }
      }))
    }
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <div className="container mx-auto px-4 py-12">
        {/* パンくずナビゲーション */}
        <FadeInSection>
          <Breadcrumb
            items={[
              { label: "記事一覧", href: "/posts" }
            ]}
            className="mb-6"
          />
        </FadeInSection>
        <PostsPageClient posts={posts} />
      </div>
    </>
  );
}
