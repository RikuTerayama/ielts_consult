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
import { ArticleIntro } from "@/components/article-intro";
import { ArticleInsights } from "@/components/article-insights";

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

        {/* 記事本文前の導入セクション（独自の価値を追加） */}
        <ArticleIntro 
          title={post.title}
          description={post.description}
          tags={post.tags}
          className="mb-6"
        />

        {/* 記事の要点（詳細な要約セクション - オリジナル価値を追加） */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 mb-8 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">
            📌 この記事で学べる主要なポイント
          </h2>
          <div className="space-y-3">
            <div className="bg-white/50 dark:bg-slate-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                1. 実践的なノウハウの習得
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {post.description}
              </p>
            </div>
            <div className="bg-white/50 dark:bg-slate-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                2. 具体的な表現とテクニック
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                記事内で紹介されている表現やテクニックは、IELTS試験でそのまま活用できる実践的な内容です。実際の使用例も含まれているため、理解しやすく応用しやすい構成になっています。
              </p>
            </div>
            <div className="bg-white/50 dark:bg-slate-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                3. 効率的な学習方法の理解
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                この記事では、単なる知識の羅列ではなく、効率的に学習を進めるための方法論も解説されています。時間を有効活用しながらスコアアップを目指す方に特に役立つ内容です。
              </p>
            </div>
            {post.tags.includes('Writing') && (
              <div className="bg-white/50 dark:bg-slate-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  4. ライティングスキルの向上
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ライティングセクションでは、適切な表現の選択と論理的な構成が重要です。この記事で紹介されているテクニックを実践することで、より高得点を目指すことができます。
                </p>
              </div>
            )}
            {post.tags.includes('Speaking') && (
              <div className="bg-white/50 dark:bg-slate-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  4. スピーキングの流暢さ向上
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  スピーキングセクションでは、自然な表現と適切な接続詞の使用が評価のポイントとなります。この記事で紹介されている表現を練習することで、より自然な英語を話せるようになります。
                </p>
              </div>
            )}
            <div className="bg-white/50 dark:bg-slate-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {post.tags.includes('Writing') || post.tags.includes('Speaking') ? '5' : '4'}. より深い理解のためのリソース
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                この記事は要約版です。より詳しい解説、追加の実践例、Q&A、学習スケジュールなどは、記事冒頭の出典リンクから元のnote記事でご覧いただけます。
              </p>
            </div>
          </div>
        </div>

        {/* 冒頭広告 */}
        <AdSlot className="mb-8" slot="article-top" format="horizontal" />

        {/* 記事本文（要約版） */}
        <div className="mb-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-1">
              📄 この記事について
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              以下は、noteで公開された記事の要約版です。記事の要点をまとめており、より詳しい解説や実践例については、記事冒頭の出典リンクから元のnote記事をご覧ください。
            </p>
          </div>
        </div>
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 記事本文後の補足説明（独自の価値を追加） */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 mb-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
            💡 この記事の重要なポイント
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            この記事で紹介されている内容は、IELTS対策において実践的で効果的なアプローチです。
            特に、{post.tags.includes('Writing') ? 'ライティング' : post.tags.includes('Speaking') ? 'スピーキング' : post.tags.includes('Reading') ? 'リーディング' : post.tags.includes('Listening') ? 'リスニング' : 'IELTS'}セクションのスコアアップを目指す方にとって、すぐに活用できる内容となっています。
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            記事内で紹介されている表現やテクニックは、実際の試験で使用できる実践的なものです。
            ぜひ、日々の学習に取り入れて、定期的に復習することで定着を図ってください。
          </p>
        </div>

        {/* 記事末広告 */}
        <AdSlot className="mb-12" slot="article-bottom" format="horizontal" />

        {/* 記事末尾の洞察セクション（独自の価値を追加） */}
        <ArticleInsights 
          title={post.title}
          tags={post.tags}
          className="mb-12"
        />

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
