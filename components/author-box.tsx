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
    <Card className={`bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 ${className || ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <User className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              筆者について
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              外資系コンサルティングファームでの実務経験を持つ筆者が、自身の英語学習経験と実践で培ったノウハウをもとに記事を執筆しています。
            </p>
            <Link
              href="/about-author"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              詳しく見る →
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
