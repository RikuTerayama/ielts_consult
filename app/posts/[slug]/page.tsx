import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AdSlot } from "@/components/ad-slot";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "記事が見つかりません",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === params.slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  // 関連記事（同じタグを持つ記事）
  const relatedPosts = allPosts
    .filter((p) => p.slug !== params.slug && p.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3);

  return (
    <article className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime}</span>
            </div>
          </div>
        </header>

        {/* 冒頭広告 */}
        <AdSlot className="mb-8" slot="article-top" format="horizontal" />

        {/* 記事本文 */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 記事末広告 */}
        <AdSlot className="mb-12" slot="article-bottom" format="horizontal" />

        {/* シェアボタン */}
        <div className="flex gap-4 mb-12 pb-12 border-b">
          <span className="text-sm font-medium">シェア:</span>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://ielts-consult.netlify.app/posts/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://ielts-consult.netlify.app/posts/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </Button>
        </div>

        {/* 前後記事ナビゲーション */}
        <nav className="flex justify-between mb-12">
          {prevPost ? (
            <Link href={`/posts/${prevPost.slug}`}>
              <Button variant="outline">
                ← {prevPost.title}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link href={`/posts/${nextPost.slug}`}>
              <Button variant="outline">
                {nextPost.title} →
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </nav>

        {/* 関連記事 */}
        {relatedPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">関連記事</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/posts/${relatedPost.slug}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <h3 className="font-semibold mb-2 line-clamp-2">{relatedPost.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {relatedPost.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
