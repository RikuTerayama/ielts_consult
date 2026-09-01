import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { PostCard } from "@/components/post-card";
import { SITE_URL } from "@/config/site";
import { getPostBySlug, getAllPosts, getRelatedPosts, resolveHeroSrc } from "@/lib/posts";
import { encodePostSlugForPath } from "@/lib/url";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface PostPageProps {
  params: { slug: string };
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "記事 | IELTS対策",
      description: "お探しの記事は見つかりませんでした。",
    };
  }

  const encodedSlug = encodePostSlugForPath(post.slug);
  const canonicalUrl = `${SITE_URL}/posts/${encodedSlug}/`;
  const title = post.title;
  const description = post.description || undefined;

  const heroPath = resolveHeroSrc(post.hero);
  const ogImage = `${SITE_URL}${heroPath}`;
  const ogImageDimensions =
    heroPath === post.hero && post.heroWidth && post.heroHeight
      ? { width: post.heroWidth, height: post.heroHeight }
      : { width: 1200, height: 630 };

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title,
      description,
      publishedTime: post.date || undefined,
      modifiedTime: post.date || undefined,
      authors: [`${SITE_URL}/about-author/`],
      images: [
        {
          url: ogImage,
          ...ogImageDimensions,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const relatedPosts = getRelatedPosts(post.slug, allPosts, 4);
  const canonicalUrl = `${SITE_URL}/posts/${encodePostSlugForPath(post.slug)}/`;
  const heroUrl = `${SITE_URL}${resolveHeroSrc(post.hero)}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || post.title,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    image: [heroUrl],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: "IELTS Consult",
      url: `${SITE_URL}/about-author/`,
    },
    publisher: {
      "@type": "Organization",
      name: "IELTS Consult",
      url: SITE_URL,
    },
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumb
        items={[
          { label: "記事一覧", href: "/posts" },
          { label: post.title, href: `/posts/${encodePostSlugForPath(post.slug)}/` },
        ]}
        className="mb-6"
      />
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          {post.date && (
            <time
              dateTime={post.date}
              className="text-muted-foreground text-sm block"
            >
              {format(new Date(post.date), "yyyy年M月d日", { locale: ja })}
            </time>
          )}
        </header>
        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-img:rounded-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-12 border-t" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl font-semibold mb-6">
            関連記事
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {relatedPosts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
