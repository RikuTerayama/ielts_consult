import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Post } from "@/lib/posts";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`} className="block h-full group">
      <Card className="h-full transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1">
        {/* ヒーロー画像 */}
        {post.hero && (
          <div className="aspect-[16/9] w-full overflow-hidden bg-muted rounded-t-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={post.hero} 
              alt={post.title}
              width={640}
              height={360}
              loading="lazy"
              className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 group-hover:saturate-110"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle className="line-clamp-2 text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-3 text-sm leading-relaxed">
            {post.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(post.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{post.readingTime}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

