import Link from "next/link";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { FadeInSection } from "@/components/anim/fade-in-section";
import { getAllPosts } from "@/lib/posts";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "IELTS対策から実践的なビジネス英語まで、外資系コンサル向けの記事を総合掲載。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/posts/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PostsPage() {
  const posts = await getAllPosts();

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "記事一覧",
    "description": "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための記事一覧",
    "url": "https://ieltsconsult.netlify.app/posts/",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />
      <div className="container mx-auto px-4 py-12">
        <FadeInSection>
          <Breadcrumb
            items={[{ label: "記事一覧", href: "/posts" }]}
            className="mb-6"
          />
        </FadeInSection>
        <FadeInSection>
          <h1 className="text-4xl font-bold mb-4">IELTS対策・ビジネス英語の記事一覧</h1>
          {posts.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
              <p className="text-muted-foreground">記事がありません。</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${encodeURIComponent(post.slug)}/`}
                    className="block p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    {post.date && (
                      <time
                        dateTime={post.date}
                        className="text-sm text-muted-foreground block mb-2"
                      >
                        {format(new Date(post.date), "yyyy年M月d日", { locale: ja })}
                      </time>
                    )}
                    {post.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {post.description}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </FadeInSection>
      </div>
    </>
  );
}
