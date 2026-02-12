import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainingAppCTA } from "@/components/training-app-cta";
import type { Post } from "@/lib/posts";
import type { TagWithCount } from "@/lib/posts";
import { encodePostSlugForPath } from "@/lib/url";

interface SidebarProps {
  latestPosts?: Post[];
  popularTags?: TagWithCount[];
}

export function Sidebar({ latestPosts = [], popularTags = [] }: SidebarProps) {
  return (
    <div className="space-y-6">
      <TrainingAppCTA variant="sidebar" />

      <Card>
        <CardHeader>
          <CardTitle>新着記事</CardTitle>
        </CardHeader>
        <CardContent>
          {latestPosts.length > 0 ? (
            <ul className="space-y-2">
              {latestPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${encodePostSlugForPath(post.slug)}/`}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline line-clamp-2 block transition-colors"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              記事がありません。
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>人気タグ</CardTitle>
        </CardHeader>
        <CardContent>
          {popularTags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {popularTags.map(({ tag, count }) => (
                <li key={tag}>
                  <Link
                    href={`/tags/${encodeURIComponent(tag)}/`}
                    className="inline-block text-sm px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                  >
                    {tag}
                    <span className="ml-1 text-xs opacity-70">({count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              タグがありません。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
