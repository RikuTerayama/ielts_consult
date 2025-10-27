import { getAllPosts, getAllTags } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "タグ一覧",
  description: "Writing、Reading、Speaking、Listeningなど、IELTS対策をカテゴリで探せるタグ一覧。目的別に記事が選べます。",
};

export default async function TagsPage() {
  const tags = await getAllTags();
  const posts = await getAllPosts();

  // タグごとの記事数を計算
  const tagCounts = new Map<string, number>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">IELTS対策・英語学習のタグ一覧</h1>
      <p className="text-muted-foreground mb-8">
        Writing、Reading、Speaking、Listeningなど、IELTS対策をカテゴリで探せます。
      </p>
      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => (
          <Link key={tag} href={`/tags/${tag}`}>
            <Badge
              variant="outline"
              className="text-lg py-2 px-4 cursor-pointer hover:bg-accent"
            >
              {tag} ({tagCounts.get(tag) || 0})
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
