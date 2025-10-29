import { getAllValidTags, getAllHtmlPosts } from "@/lib/html-posts";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "タグ一覧",
  description: "Writing、Reading、Speaking、Listeningなど、IELTS対策をカテゴリで探せるタグ一覧。目的別に記事が選べます。",
};

export default async function TagsPage() {
  // 実際のHTMLファイルから抽出されたタグを取得
  const posts = await getAllHtmlPosts();
  const allTags = new Set<string>();
  
  posts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag));
  });
  
  const tags = Array.from(allTags).sort();

  // タグごとの記事数を計算
  const tagCounts = new Map<string, number>();
  tags.forEach((tag) => {
    const count = posts.filter(post => post.tags.includes(tag)).length;
    tagCounts.set(tag, count);
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
