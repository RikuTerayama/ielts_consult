import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import Link from "next/link";

interface AuthorBoxProps {
  className?: string;
}

/**
 * 記事詳細ページに表示する筆者情報ボックス
 */
export function AuthorBox({ className }: AuthorBoxProps) {
  return (
    <Card className={`rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 ${className || ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600">
              <User className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground text-lg">
                筆者について
              </h3>
              <Link
                href="/about-author"
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                詳しく見る →
              </Link>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">
              外資系コンサルティングファームでの実務経験を持つ筆者が、自身の英語学習経験と実践で培ったノウハウをもとに記事を執筆しています。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
