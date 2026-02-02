import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface ArticleIntroProps {
  title: string;
  description: string;
  tags: string[];
  className?: string;
}

/**
 * 記事本文前の導入セクション
 * 記事の背景や文脈を説明し、独自の価値を追加
 */
export function ArticleIntro({ title, description, tags, className }: ArticleIntroProps) {
  // タグに基づいて記事の重要性を説明
  const getContext = () => {
    if (tags.includes('Writing')) {
      return 'IELTSライティングは、多くの日本人学習者にとって最も難しいセクションの一つです。この記事では、実践的なテクニックと具体的な表現を紹介します。';
    }
    if (tags.includes('Speaking')) {
      return 'IELTSスピーキングでは、流暢さと正確さのバランスが重要です。この記事では、効果的な表現と練習方法を解説します。';
    }
    if (tags.includes('Reading')) {
      return 'IELTSリーディングは時間配分と戦略が鍵となります。この記事では、効率的な読解テクニックを紹介します。';
    }
    if (tags.includes('Listening')) {
      return 'IELTSリスニングは、聞き取りのコツと集中力が重要です。この記事では、実践的な対策方法を解説します。';
    }
    return 'この記事では、IELTS対策に役立つ実践的なノウハウを紹介します。';
  };

  const context = getContext();

  return (
    <Card className={`bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              この記事を読む前に
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {context}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                📌 この記事は、noteで公開された記事を要約・転載したものです。
                より詳しい解説や実践例については、記事冒頭の出典リンクから元のnote記事をご覧ください。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

