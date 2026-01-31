import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostsByTag } from "@/lib/posts";
import { PostCard } from "@/components/post-card";

type TagPageProps = {
  params: { tag: string };
};

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ tag: string }>> {
  try {
    const posts = await getAllPosts();
    const tagSet = new Set<string>();

    for (const post of posts) {
      for (const t of post.tags ?? []) tagSet.add(t);
    }

    return Array.from(tagSet).map((t) => ({ tag: encodeURIComponent(t) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `Tag: ${tag}`,
    description: `Posts tagged with ${tag}`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(tag);

  if (!posts || posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">{tag}</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
