import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TRAINING_APP_URL } from "@/config/links";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-background dark:from-slate-950 dark:to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左側: テキストコンテンツ */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
              IELTS対策とビジネス英語を実践で学ぶ。
              <br />
              <span className="text-primary">外資系コンサルの英語力向上サイト</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              IELTS対策からビジネス英語まで、実践的なノウハウを発信
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild size="lg" className="rounded-xl">
                <a 
                  href={TRAINING_APP_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  🎯 IELTSトレーニングアプリを始める
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl">
                <Link href="/posts">記事を読む</Link>
              </Button>
            </div>
          </div>
          
          {/* 右側: 抽象的なグラフィックまたは主要記事プレビュー */}
          <div className="hidden lg:block relative">
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-indigo-100 via-indigo-50 to-violet-100 dark:from-indigo-950 dark:via-indigo-900 dark:to-violet-950 border border-slate-200 dark:border-slate-800 p-8 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 opacity-20">
                  IELTS
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  実践的な学習コンテンツ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

