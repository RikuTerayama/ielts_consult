import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Post } from "@/lib/posts";
import { AdSlot } from "@/components/ad-slot";
import { NoteCTA } from "@/components/note-cta";
import { LEARNING_STEPS, SKILLS } from "@/config/categories";

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
      {/* noteへのCTA */}
      <NoteCTA variant="sidebar" />

      {/* 学習ステップ */}
      <Card>
        <CardHeader>
          <CardTitle>学習ステップ</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {LEARNING_STEPS.map((step) => (
              <li key={step.id}>
                <Link
                  href={`/steps/${step.id}`}
                  className="text-sm hover:text-primary transition-colors block"
                >
                  <span className="font-medium">{step.label}</span>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 技能別 */}
      <Card>
        <CardHeader>
          <CardTitle>技能別</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {SKILLS.map((skill) => (
              <Link
                key={skill.id}
                href={`/skills/${skill.id}`}
                className="flex flex-col items-center p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <span className="text-2xl mb-1">{skill.icon}</span>
                <span className="text-sm font-medium">{skill.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

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

