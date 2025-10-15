import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { HeroSection } from "@/components/hero-section";
import { Sidebar } from "@/components/sidebar";
import { AdSlot } from "@/components/ad-slot";

export default async function Home() {
  const allPosts = await getAllPosts();
  const latestPosts = allPosts.slice(0, 6);
  const popularPosts = allPosts.slice(0, 3);

  // WebSite構造化データ
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "外資系コンサルの英語力底上げブログ",
    "description": "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログ",
    "url": "https://ieltsconsult.netlify.app",
    "publisher": {
      "@type": "Organization",
      "name": "IELTS Consult",
      "url": "https://ieltsconsult.netlify.app"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://ieltsconsult.netlify.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": allPosts.length,
      "itemListElement": latestPosts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "headline": post.title,
          "description": post.description,
          "url": `https://ieltsconsult.netlify.app/posts/${post.slug}/`,
          "datePublished": post.date,
          "author": {
            "@type": "Person",
            "name": "IELTS Consult"
          }
        }
      }))
    }
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
      <HeroSection />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-8">
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">最新記事</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>

            {/* トップページ広告スロット */}
            <AdSlot 
              className="mb-12" 
              slot="top-page-ad"
              format="horizontal"
            />

            <section>
              <h2 className="text-3xl font-bold mb-6">人気記事</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popularPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="lg:col-span-4">
            <Sidebar posts={allPosts} />
          </aside>
        </div>
      </div>
    </>
  );
}

