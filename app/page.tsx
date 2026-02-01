import { getAllPosts } from "@/lib/posts";
import { PostCardList } from "@/components/post-card-list";
import { HeroSection } from "@/components/hero-section";
import { Sidebar } from "@/components/sidebar";
import { AdSlot } from "@/components/ad-slot";
import { TrainingAppCTA } from "@/components/training-app-cta";
import { FadeInHeading } from "@/components/anim/fade-in-heading";
import { FadeInSection } from "@/components/anim/fade-in-section";

export default async function Home() {
  const allPosts = await getAllPosts();
  // 最新記事: 日付順で上位6件（既にgetAllPostsでソート済み）
  const latestPosts = allPosts.slice(0, 6);
  // 人気記事: 現時点では人気指標がないため、最新記事の上位3件にフォールバック
  // 将来的に人気指標（viewCount等）が追加されたら、それに基づいてソートする
  const popularPosts = allPosts.length > 0 ? allPosts.slice(0, 3) : [];

  // Organization構造化データ
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IELTS Consult",
    "url": "https://ieltsconsult.netlify.app",
    "logo": "https://ieltsconsult.netlify.app/logo.png",
    "description": "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを提供",
    "sameAs": [],
  };

  // WebSite構造化データ
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "IELTS対策｜外資系コンサルの英語力底上げ",
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
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
      <HeroSection />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* メインコンテンツ */}
          <div className="lg:col-span-8">
            <section className="mb-16">
              <FadeInHeading className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
                最新記事
              </FadeInHeading>
              {latestPosts.length > 0 ? (
                <PostCardList 
                  posts={latestPosts}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                />
              ) : (
                <FadeInSection>
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      記事を準備中です。しばらくお待ちください。
                    </p>
                  </div>
                </FadeInSection>
              )}
            </section>

            {/* IELTSトレーニングアプリCTA */}
            <FadeInSection delay={0.2}>
              <TrainingAppCTA className="mb-12" />
            </FadeInSection>

            {/* トップページ広告スロット */}
            <FadeInSection delay={0.2}>
              <AdSlot 
                className="mb-12" 
                slot="top-page-ad"
                format="horizontal"
              />
            </FadeInSection>

            <section>
              <FadeInHeading className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
                人気記事
              </FadeInHeading>
              {popularPosts.length > 0 ? (
                <PostCardList 
                  posts={popularPosts}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                />
              ) : (
                <FadeInSection>
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      記事を準備中です。しばらくお待ちください。
                    </p>
                  </div>
                </FadeInSection>
              )}
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

