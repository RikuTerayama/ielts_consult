import { getAllPosts, getPostsByTag } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";

interface TagPageProps {
  params: {
    tag: string;
  };
}

export async function generateStaticParams() {
  try {
    // 公開記事から抽出されたタグを取得
    const posts = await getAllPosts();
    const allTags = new Set<string>();
    
    posts.forEach(post => {
      post.tags.forEach(tag => allTags.add(tag));
    });
    
    const tags = Array.from(allTags);
    
    return tags.map((tag) => ({
      tag: encodeURIComponent(tag),
    }));
  } catch (error) {
    console.error('Error generating static params for tags:', error);
    return [];
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(tag);
  
  // 記事が1件のみの場合はnoindex
  const shouldIndex = posts.length > 1;
  
  return {
    title: `タグ: ${tag}`,
    description: `${tag}の記事${posts.length}件。IELTS対策や英語学習に役立つ実践的な内容をご覧ください。`,
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* パンくずナビゲーション */}
      <Breadcrumb
        items={[
          { label: "タグ一覧", href: "/tags" },
          { label: tag, href: `/tags/${tag}` }
        ]}
        className="mb-6"
      />
      <h1 className="text-4xl font-bold mb-2">タグ: {tag}</h1>
      <p className="text-muted-foreground mb-4">
        {posts.length}件の記事
      </p>
      {posts.length === 1 && (
        <p className="text-sm text-muted-foreground mb-8">
          このタグには1件の記事があります。関連する他のタグもご覧ください。
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
