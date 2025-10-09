import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            外資系コンサルの英語力を<br />底上げする
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            IELTS対策からビジネス英語まで、実践的なノウハウを発信
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button asChild size="lg">
              <Link href="/posts">記事を読む</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">このサイトについて</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

