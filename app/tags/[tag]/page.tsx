import { getAllHtmlPosts, getPostsByTag } from "@/lib/html-posts";
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
  // 実際のHTMLファイルから抽出されたタグを取得
  const posts = await getAllHtmlPosts();
  const allTags = new Set<string>();
  
  posts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag));
  });
  
  const tags = Array.from(allTags);
  
  return tags.map((tag) => ({
    tag: tag,
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(tag);
  
  return {
    title: `タグ: ${tag}`,
    description: `${tag}の記事${posts.length}件。IELTS対策や英語学習に役立つ実践的な内容をご覧ください。`,
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
      <p className="text-muted-foreground mb-8">{posts.length}件の記事</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
