import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { getPostsByTag, getAllTags } from "@/lib/posts";

type TagPageProps = {
  params: { tag: string };
};

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ tag: string }>> {
  const allTags = await getAllTags();
  if (allTags.length === 0) {
    return [{ tag: "_" }];
  }
  return allTags.map(({ tag }) => ({
    tag: encodeURIComponent(tag),
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `Tag: ${tag}`,
    description: `タグ「${tag}」の記事一覧`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(params.tag);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">タグ: {tag}</h1>
      <p className="text-muted-foreground mb-8">
        「{tag}」の記事一覧（{posts.length}件）
      </p>
      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 mb-12">
          <p className="text-muted-foreground mb-6">このタグの記事はありません。</p>
        </div>
      )}
      <Button asChild variant="outline">
        <Link href="/tags/">タグ一覧へ</Link>
      </Button>
    </div>
  );
}
