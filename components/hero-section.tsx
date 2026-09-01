"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FadeIn } from "@/components/anim/fade-in";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-background dark:from-slate-950 dark:to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左側: テキストコンテンツ */}
          <div className="space-y-6">
            <FadeIn delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
                IELTS対策とビジネス英語を実践で学ぶ。
                <br />
                <span className="text-primary">外資系コンサルの英語力向上サイト</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                IELTS対策からビジネス英語まで、実践的なノウハウを発信
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="mt-8">
                <Button asChild size="lg" className="rounded-xl">
                  <Link href="/posts">最新記事を読む</Link>
                </Button>
              </div>
            </FadeIn>
          </div>
          
          {/* 右側: LP 画像 */}
          <FadeIn delay={0.4} className="hidden lg:block relative">
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-indigo-100 via-indigo-50 to-violet-100 dark:from-indigo-950 dark:via-indigo-900 dark:to-violet-950 border border-slate-200 dark:border-slate-800 p-0 overflow-hidden flex items-center justify-center">
              <img
                src="/assets/LP.png"
                alt="IELTS 実践的な学習コンテンツ"
                width={1424}
                height={752}
                className="w-full h-full object-contain rounded-2xl"
                loading="eager"
                decoding="async"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

