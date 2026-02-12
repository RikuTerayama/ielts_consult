import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { resolveHeroSrc } from "@/lib/posts";
import type { Post } from "@/lib/posts";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const heroSrc = resolveHeroSrc(post.hero);
  const href = `/posts/${encodeURIComponent(post.slug)}/`;

  return (
    <Link
      href={href}
      aria-label={post.title}
      className="block rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-muted/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      <Card className="h-full overflow-hidden border-0 bg-transparent shadow-none">
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
          <img
            src={heroSrc}
            alt={post.title}
            width={1200}
            height={675}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <CardHeader className="p-4 pb-0">
          <h2 className="text-lg font-semibold line-clamp-2 leading-tight">
            {post.title}
          </h2>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {post.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {post.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {post.date && (
              <time dateTime={post.date}>
                {format(new Date(post.date), "yyyy年M月d日", { locale: ja })}
              </time>
            )}
            {post.readingTime && (
              <span>・{post.readingTime}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
