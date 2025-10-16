"use client";

import { useEffect, useRef } from "react";

interface UtterancesCommentsProps {
  className?: string;
}

export function UtterancesComments({ className }: UtterancesCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Utterancesスクリプトを動的に読み込み
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.setAttribute("repo", "RikuTerayama/ielts_consult");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "preferred-color-scheme");
    script.setAttribute("label", "comment");
    script.async = true;

    if (commentsRef.current) {
      commentsRef.current.appendChild(script);
    }

    return () => {
      // クリーンアップ
      if (commentsRef.current) {
        commentsRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className={className}>
      <div className="border-t border-border pt-8">
        <h3 className="text-xl font-semibold mb-6 text-center">
          💬 コメント・質問
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          記事についてのご質問やご感想をお聞かせください。
          <br />
          GitHubアカウントでログインしてコメントできます。
        </p>
        <div ref={commentsRef} />
      </div>
    </div>
  );
}
