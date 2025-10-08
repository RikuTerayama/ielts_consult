import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Post } from "@/lib/posts";
import { AdSlot } from "@/components/ad-slot";

interface SidebarProps {
  posts: Post[];
}

export function Sidebar({ posts }: SidebarProps) {
  const recentPosts = posts.slice(0, 5);
  
  // タグの集計
  const tagCounts = new Map<string, number>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  const popularTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* 新着記事 */}
      <Card>
        <CardHeader>
          <CardTitle>新着記事</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-sm hover:text-primary transition-colors line-clamp-2"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* サイドバー広告 */}
      <AdSlot slot="sidebar-ad" format="vertical" />

      {/* 人気タグ */}
      <Card>
        <CardHeader>
          <CardTitle>人気タグ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(([tag, count]) => (
              <Link key={tag} href={`/tags/${tag}`}>
                <Badge variant="outline" className="hover:bg-accent cursor-pointer">
                  {tag} ({count})
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

