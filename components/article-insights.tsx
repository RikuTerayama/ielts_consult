import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Target, BookOpen } from "lucide-react";

interface ArticleInsightsProps {
  title: string;
  tags: string[];
  className?: string;
}

/**
 * 記事末尾の洞察セクション
 * AdSenseポリシー準拠のため、独自の価値を追加
 */
export function ArticleInsights({ title, tags, className }: ArticleInsightsProps) {
  // タグに基づいて学習ステップを提案
  const getLearningSteps = () => {
    if (tags.includes('Writing')) {
      return [
        'この記事で学んだ表現を実際のライティングで使用してみる',
        'IELTS Writing Task 1/2の過去問で練習する',
        'フィードバックを得るために添削サービスを利用する'
      ];
    }
    if (tags.includes('Speaking')) {
      return [
        'この記事で学んだ表現を音読練習で定着させる',
        'IELTS Speakingの模擬試験で実践する',
        '録音して自分のスピーキングを客観的に評価する'
      ];
    }
    if (tags.includes('Reading')) {
      return [
        'IELTS公式問題集でリーディング練習を行う',
        '記事で紹介されたテクニックを実践する',
        '時間を計って速読力を向上させる'
      ];
    }
    if (tags.includes('Listening')) {
      return [
        'IELTS公式問題集でリスニング練習を行う',
        '英語のポッドキャストや動画を日常的に聞く',
        'ディクテーションで聞き取り力を強化する'
      ];
    }
    return [
      'この記事の内容を実践的な学習に活かす',
      '関連する記事も読んで知識を深める',
      '定期的に復習して定着を図る'
    ];
  };

  const learningSteps = getLearningSteps();

  return (
    <div className={className}>
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <Lightbulb className="h-5 w-5" />
            この記事から学べること
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  主要なポイント
                </p>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  <li>• 実践的なノウハウと具体例を理解できる</li>
                  <li>• IELTS対策に直結するテクニックを習得できる</li>
                  <li>• 効率的な学習方法を実践できる</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  次のステップ
                </p>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  {learningSteps.map((step, index) => (
                    <li key={index}>• {step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300 italic">
              💡 この記事は、noteで公開された記事を要約・転載したものです。
              より詳しい解説や追加情報については、記事冒頭の出典リンクから元のnote記事をご覧ください。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

