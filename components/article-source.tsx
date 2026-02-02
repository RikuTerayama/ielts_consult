import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ArticleSourceProps {
  noteUrl?: string;
  className?: string;
}

/**
 * 記事の出典表示コンポーネント
 * AdSenseポリシー準拠のため、記事の冒頭に出典情報を表示
 */
export function ArticleSource({ noteUrl, className }: ArticleSourceProps) {
  const defaultNoteUrl = "https://note.com/ielts_consult";
  
  return (
    <Card className={`bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <span className="text-2xl">📝</span>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              この記事について
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              この記事は、noteで公開された記事を要約・転載したものです。
              より詳しい解説、実践例、追加情報については、元のnote記事をご覧ください。
            </p>
            {noteUrl && (
              <Link
                href={noteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
              >
                元のnote記事を読む
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            {!noteUrl && (
              <Link
                href={defaultNoteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
              >
                noteマガジンを見る
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

