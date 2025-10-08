import { getAllTags, getPostsByTag } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface TagPageProps {
  params: {
    tag: string;
  };
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    tag: tag,
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  return {
    title: `タグ: ${decodeURIComponent(params.tag)}`,
    description: `${decodeURIComponent(params.tag)}に関する記事一覧`,
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
