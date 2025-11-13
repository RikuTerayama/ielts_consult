import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AdSlot } from "@/components/ad-slot";
import { NoteCTA } from "@/components/note-cta";
import { ReadingProgress } from "@/components/reading-progress";
import { GiscusComments } from "@/components/giscus-comments";
import { Tooltip } from "@/components/tooltip";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { ArticleSource } from "@/components/article-source";

// レスポンシブな文字数制限のヘルパー関数
function truncateTitle(title: string, isMobile: boolean = false): string {
  const maxLength = isMobile ? 15 : 25; // スマホ: 15文字、PC: 25文字
  return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
}

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
      description: "お探しの記事は見つかりませんでした",
    };
  }

  const fullUrl = `https://ieltsconsult.netlify.app/posts/${post.slug}/`;
  const imageUrl = post.hero 
    ? `https://ieltsconsult.netlify.app${post.hero}` 
    : "https://ieltsconsult.netlify.app/og-image.jpg";

  // descriptionを最適化（80-110文字以内）
  let optimizedDescription = post.description;
  
  // 110文字を超える場合は切り詰める
  if (optimizedDescription.length > 110) {
    optimizedDescription = optimizedDescription.substring(0, 110).replace(/\s+[^\s]*$/, '') + '...';
  }
  
  // 短すぎる場合（40文字未満）は補足を追加
  if (optimizedDescription.length < 40) {
    optimizedDescription = `${optimizedDescription}実践的なノウハウと具体例で学習をサポートします。`;
  }

  return {
    title: post.title,
    description: optimizedDescription,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: post.title,
      description: optimizedDescription,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.date,
      tags: post.tags,
      url: fullUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      siteName: "IELTS対策｜外資系コンサルの英語力底上げ",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: optimizedDescription,
      images: [imageUrl],
    },
    keywords: [...post.tags, "IELTS", "英語学習"],
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


  // note URLを取得（slugから推測、またはマッピングから取得）
  const noteUrl = `https://note.com/ielts_consult/n/${post.slug}`;

  // BlogPosting構造化データ（出典情報を含む）
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": post.hero ? `https://ieltsconsult.netlify.app${post.hero}` : undefined,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": "IELTS Consult"
    },
    "publisher": {
      "@type": "Organization",
      "name": "IELTS Consult",
      "url": "https://ieltsconsult.netlify.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ieltsconsult.netlify.app/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ieltsconsult.netlify.app/posts/${post.slug}/`
    },
    "keywords": post.tags.join(", "),
    "articleSection": post.categorySkill || "IELTS",
    "wordCount": post.content.split(/\s+/).length,
    "timeRequired": post.readingTime,
    "inLanguage": "ja-JP",
    // 出典情報を追加（AdSenseポリシー準拠）
    "isBasedOn": {
      "@type": "Article",
      "url": noteUrl,
      "name": post.title
    },
    "citation": noteUrl
  };

  return (
    <>
      {/* 読書進捗バー */}
      <ReadingProgress />
      
      <article className="container mx-auto px-4 py-12">
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blogPostingSchema),
          }}
        />
        
        <div className="max-w-4xl mx-auto">
        {/* パンくずナビゲーション */}
        <Breadcrumb
          items={[
            { label: "記事一覧", href: "/posts" },
            { label: post.title, href: `/posts/${post.slug}` }
          ]}
          className="mb-6"
        />

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

        {/* 出典表示（AdSenseポリシー準拠） */}
        <ArticleSource noteUrl={noteUrl} className="mb-6" />

        {/* 記事の要点（要約セクション - オリジナル価値を追加） */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 mb-8 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold mb-3 text-blue-900 dark:text-blue-100">
            📌 この記事の要点
          </h2>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>{post.description}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>実践的なノウハウと具体例を交えて解説しています</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
              <span>より詳しい内容や追加情報は元のnote記事をご覧ください</span>
            </li>
          </ul>
        </div>

        {/* 冒頭広告 */}
        <AdSlot className="mb-8" slot="article-top" format="horizontal" />

        {/* 記事本文 */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 記事末広告 */}
        <AdSlot className="mb-12" slot="article-bottom" format="horizontal" />

        {/* noteへのCTA */}
        <NoteCTA className="mb-12" />

        {/* シェアボタン */}
        <div className="flex items-center gap-4 mb-12 pb-12 border-b">
          <span className="text-sm font-medium text-muted-foreground">シェア:</span>
          <Button
            variant="outline"
            size="icon"
            asChild
            title="Twitterでシェア"
          >
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://ielts-consult.netlify.app/posts/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitterでシェア"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
            title="Facebookでシェア"
          >
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://ielts-consult.netlify.app/posts/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebookでシェア"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z"/>
              </svg>
            </a>
          </Button>
        </div>

        {/* 前後記事ナビゲーション */}
        <nav className="flex justify-between mb-12 gap-4">
          {prevPost ? (
            <div className="flex-1 max-w-[45%]">
              <Tooltip content={prevPost.title} side="top" delay={300}>
                <Link href={`/posts/${prevPost.slug}`} className="block">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left h-auto py-3 px-4"
                  >
                    <span className="truncate">
                      ← <span className="sm:hidden">{truncateTitle(prevPost.title, true)}</span>
                      <span className="hidden sm:inline">{truncateTitle(prevPost.title, false)}</span>
                    </span>
                  </Button>
                </Link>
              </Tooltip>
            </div>
          ) : (
            <div className="flex-1 max-w-[45%]" />
          )}
          {nextPost ? (
            <div className="flex-1 max-w-[45%]">
              <Tooltip content={nextPost.title} side="top" delay={300}>
                <Link href={`/posts/${nextPost.slug}`} className="block">
                  <Button 
                    variant="outline" 
                    className="w-full justify-end text-right h-auto py-3 px-4"
                  >
                    <span className="truncate">
                      <span className="sm:hidden">{truncateTitle(nextPost.title, true)}</span>
                      <span className="hidden sm:inline">{truncateTitle(nextPost.title, false)}</span> →
                    </span>
                  </Button>
                </Link>
              </Tooltip>
            </div>
          ) : (
            <div className="flex-1 max-w-[45%]" />
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

        {/* コメント機能 */}
        <GiscusComments 
          className="mt-12" 
          enabled={process.env.NEXT_PUBLIC_ENABLE_COMMENTS !== "false"}
        />
        </div>
      </article>
    </>
  );
}
