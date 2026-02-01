import type { PostAddition as PostAdditionType } from "@/lib/posts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";

interface PostAdditionProps {
  addition: PostAdditionType;
  className?: string;
  showTakeawaysOnly?: boolean;
}

/**
 * 記事のオリジナル付加価値セクション
 * 記事冒頭と末尾に表示される独自の解説、練習、FAQ等
 */
export function PostAddition({ addition, className, showTakeawaysOnly = false }: PostAdditionProps) {
  // 冒頭のみ表示する場合
  if (showTakeawaysOnly) {
    return (
      <div className={className}>
        {addition.takeaways && addition.takeaways.length > 0 && (
          <Card className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                この記事で得られること
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {addition.takeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 記事冒頭: この記事で得られること */}
      {addition.takeaways && addition.takeaways.length > 0 && (
        <Card className="mb-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                この記事で得られること
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {addition.takeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 記事末尾: 実践パート、よくある誤り、FAQ、次のステップ */}
      <div className="space-y-6 mt-12">
        {/* 実践パート */}
        {addition.practice && (
          <Card className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BookOpen className="h-5 w-5 text-primary" />
                実践してみよう
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">
                <MDXRemote source={addition.practice} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* よくある誤り */}
        {addition.commonMistakes && addition.commonMistakes.length > 0 && (
          <Card className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertCircle className="h-5 w-5 text-primary" />
                よくある誤り
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {addition.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground/80">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        {addition.faq && addition.faq.length > 0 && (
          <Card className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <HelpCircle className="h-5 w-5 text-primary" />
                よくある質問
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {addition.faq.map((item, index) => (
                  <div key={index} className="border-b border-slate-200 dark:border-slate-800 pb-4 last:border-0">
                    <h4 className="font-semibold text-foreground mb-2">
                      Q{index + 1}. {item.question}
                    </h4>
                    <p className="text-sm text-foreground/80">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 次のステップ */}
        {addition.nextSteps && addition.nextSteps.length > 0 && (
          <Card className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ArrowRight className="h-5 w-5 text-primary" />
                次のステップ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {addition.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      {step.link ? (
                        <Link
                          href={step.link}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {step.title}
                        </Link>
                      ) : (
                        <h4 className="font-semibold text-foreground">
                          {step.title}
                        </h4>
                      )}
                      {step.description && (
                        <p className="text-sm text-foreground/80 mt-1">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* 追加のMDXコンテンツ */}
        {addition.content && (
          <Card className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MDXRemote source={addition.content} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
