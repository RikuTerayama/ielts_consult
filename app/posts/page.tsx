import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "IELTS対策から実践的なビジネス英語まで、外資系コンサル向けの記事を総合掲載。書き方のコツや語彙力アップの方法が分かります。",
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
    <div className="container mx-auto px-4 py-12">
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      {/* パンくずナビゲーション */}
      <Breadcrumb
        items={[
          { label: "記事一覧", href: "/posts" }
        ]}
        className="mb-6"
      />
      <h1 className="text-4xl font-bold mb-4">IELTS対策・ビジネス英語の記事一覧</h1>
      <p className="text-muted-foreground mb-8">
        {posts.length > 0 ? `${posts.length}件の記事から、IELTS対策、ビジネス英語、外資系コンサルで役立つ内容をピックアップしています。` : '記事を読み込んでいます...'}
      </p>
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            まだ記事がインポートされていません。
          </p>
          <p className="text-sm text-muted-foreground">
            ローカル環境で `pnpm run import:note` を実行してください。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
