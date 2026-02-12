import { HeroSection } from "@/components/hero-section";
import { Sidebar } from "@/components/sidebar";
import { TrainingAppCTA } from "@/components/training-app-cta";
import { PostCard } from "@/components/post-card";
import { FadeInHeading } from "@/components/anim/fade-in-heading";
import { FadeInSection } from "@/components/anim/fade-in-section";
import { getAllPosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getAllPosts();
  const latestPosts = posts.slice(0, 5);
  const popularPosts = posts.slice(0, 5);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IELTS Consult",
    "url": "https://ieltsconsult.netlify.app",
    "logo": "https://ieltsconsult.netlify.app/logo.png",
    "description": "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを提供",
    "sameAs": [],
  };

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
  };

  return (
    <>
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
          <div className="lg:col-span-8">
            <section className="mb-16">
              <FadeInHeading className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
                最新記事
              </FadeInHeading>
              <FadeInSection>
                {latestPosts.length === 0 ? (
                  <div className="text-center py-12 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
                    <p className="text-muted-foreground">記事がありません。</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {latestPosts.map((post) => (
                      <PostCard key={post.slug} post={post} />
                    ))}
                  </div>
                )}
              </FadeInSection>
            </section>

            <FadeInSection delay={0.2}>
              <TrainingAppCTA className="mb-12" />
            </FadeInSection>

            <section>
              <FadeInHeading className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
                人気記事
              </FadeInHeading>
              <FadeInSection>
                {popularPosts.length === 0 ? (
                  <div className="text-center py-12 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
                    <p className="text-muted-foreground">記事がありません。</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {popularPosts.map((post) => (
                      <PostCard key={post.slug} post={post} />
                    ))}
                  </div>
                )}
              </FadeInSection>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <Sidebar />
          </aside>
        </div>
      </div>
    </>
  );
}
