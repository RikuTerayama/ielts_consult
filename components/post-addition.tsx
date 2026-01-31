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
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <CheckCircle2 className="h-5 w-5" />
                この記事で得られること
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {addition.takeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
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
        <Card className="mb-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <CheckCircle2 className="h-5 w-5" />
              この記事で得られること
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {addition.takeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
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
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <BookOpen className="h-5 w-5" />
                実践してみよう
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none text-amber-800 dark:text-amber-200">
                <MDXRemote source={addition.practice} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* よくある誤り */}
        {addition.commonMistakes && addition.commonMistakes.length > 0 && (
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                <AlertCircle className="h-5 w-5" />
                よくある誤り
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {addition.commonMistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start gap-2 text-red-800 dark:text-red-200">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* FAQ */}
        {addition.faq && addition.faq.length > 0 && (
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <HelpCircle className="h-5 w-5" />
                よくある質問
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {addition.faq.map((item, index) => (
                  <div key={index} className="border-b border-green-200 dark:border-green-800 pb-4 last:border-0">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Q{index + 1}. {item.question}
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
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
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <ArrowRight className="h-5 w-5" />
                次のステップ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {addition.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      {step.link ? (
                        <Link
                          href={step.link}
                          className="font-semibold text-purple-900 dark:text-purple-100 hover:underline"
                        >
                          {step.title}
                        </Link>
                      ) : (
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                          {step.title}
                        </h4>
                      )}
                      {step.description && (
                        <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
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
          <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
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
