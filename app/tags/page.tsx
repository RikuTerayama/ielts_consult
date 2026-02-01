import { getAllValidTags, getAllHtmlPosts } from "@/lib/html-posts";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "タグ一覧",
  description: "Writing、Reading、Speaking、Listeningなど、IELTS対策をカテゴリで探せるタグ一覧。目的別に記事が選べます。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/tags/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TagsPage() {
  // 実際のHTMLファイルから抽出されたタグを取得
  const posts = await getAllHtmlPosts();
  const allTags = new Set<string>();
  
  posts.forEach(post => {
    post.tags.forEach(tag => allTags.add(tag));
  });
  
  const tags = Array.from(allTags).sort();

  // タグごとの記事数を計算
  const tagCounts = new Map<string, number>();
  tags.forEach((tag) => {
    const count = posts.filter(post => post.tags.includes(tag)).length;
    tagCounts.set(tag, count);
  });

  // CollectionPage構造化データ
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "IELTS対策・英語学習のタグ一覧",
    "description": "Writing、Reading、Speaking、Listeningなど、IELTS対策をカテゴリで探せるタグ一覧。目的別に記事が選べます。",
    "url": "https://ieltsconsult.netlify.app/tags/",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": tags.length,
      "itemListElement": tags.map((tag, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": tag,
        "url": `https://ieltsconsult.netlify.app/tags/${encodeURIComponent(tag)}/`,
        "description": `${tag}に関する記事が${tagCounts.get(tag) || 0}件あります。`
      }))
    }
  };

  return (
    <>
      {/* 構造化データ */}
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
          各タグをクリックすると、そのタグに関連する記事一覧が表示されます。
        </p>
        <div className="flex flex-wrap gap-4">
          {tags.map((tag) => (
            <Link key={tag} href={`/tags/${tag}`}>
              <Badge
                variant="outline"
                className="text-lg py-2 px-4 cursor-pointer hover:bg-accent"
              >
                {tag} ({tagCounts.get(tag) || 0})
              </Badge>
            </Link>
          ))}
        </div>
        <div className="mt-12 prose prose-lg dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">タグについて</h2>
          <p className="text-muted-foreground mb-4">
            このページでは、IELTS対策や英語学習に関する記事をタグ別に分類しています。
            各タグには関連する記事数が表示されており、興味のあるトピックを簡単に見つけることができます。
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>IELTS</strong>: IELTS全般に関する記事</li>
            <li><strong>Writing</strong>: ライティング対策に関する記事</li>
            <li><strong>Speaking</strong>: スピーキング対策に関する記事</li>
            <li><strong>Reading</strong>: リーディング対策に関する記事</li>
            <li><strong>Listening</strong>: リスニング対策に関する記事</li>
            <li><strong>表現</strong>: 英語表現やフレーズに関する記事</li>
            <li><strong>語彙</strong>: 語彙力向上に関する記事</li>
            <li><strong>対策</strong>: IELTS対策全般に関する記事</li>
            <li><strong>ガイド</strong>: 学習ガイドやロードマップに関する記事</li>
          </ul>
        </div>
      </div>
    </>
  );
}
