import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための記事一覧",
};

export default async function PostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">記事一覧</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
