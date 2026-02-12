import Link from "next/link";
import { Metadata } from "next";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "タグ一覧",
  description: "Writing、Reading、Speaking、Listeningなど、IELTS対策をカテゴリで探せるタグ一覧。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/tags/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TagsPage() {
  const allTags = await getAllTags();

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "IELTS対策・英語学習のタグ一覧",
    "description": "Writing、Reading、Speaking、Listeningなど、IELTS対策をカテゴリで探せるタグ一覧。",
    "url": "https://ieltsconsult.netlify.app/tags/",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">IELTS対策・英語学習のタグ一覧</h1>
        <p className="text-muted-foreground mb-8">
          Writing、Reading、Speaking、Listeningなど、IELTS対策をカテゴリで探せます。
        </p>
        {allTags.length > 0 ? (
          <ul className="flex flex-wrap gap-3">
            {allTags.map(({ tag, count }) => (
              <li key={tag}>
                <Link
                  href={`/tags/${encodeURIComponent(tag)}/`}
                  className="inline-block px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-muted/30 transition-colors text-muted-foreground hover:text-primary"
                >
                  {tag}
                  <span className="ml-2 text-sm opacity-70">({count})</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
            <p className="text-muted-foreground">タグがありません。</p>
          </div>
        )}
      </div>
    </>
  );
}
