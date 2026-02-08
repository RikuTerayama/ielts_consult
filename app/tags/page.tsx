import { Metadata } from "next";

export const metadata: Metadata = {
  title: "タグ一覧",
  description: "Writing、Reading、Speaking、Listeningなど、IELTS対策をカテゴリで探せるタグ一覧。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/tags/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TagsPage() {
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
        <div className="text-center py-12 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
          <p className="text-muted-foreground">タグ一覧を準備中です。しばらくお待ちください。</p>
        </div>
      </div>
    </>
  );
}
