"use client";

import { useEffect, useRef } from "react";

interface GiscusCommentsProps {
  className?: string;
  enabled?: boolean;
}

export function GiscusComments({ className, enabled = true }: GiscusCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    // Giscusスクリプトを動的に読み込み
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "RikuTerayama/ielts_consult");
    script.setAttribute("data-repo-id", "R_kgDOPuuejA");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOPuuejM4CwtUP");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-theme-id", "dark_dimmed");
    script.setAttribute("data-lang", "ja");
    script.setAttribute("data-loading", "lazy");
    script.async = true;

    if (commentsRef.current) {
      commentsRef.current.appendChild(script);
    }

    return () => {
      // クリーンアップ
      const currentRef = commentsRef.current;
      if (currentRef) {
        currentRef.innerHTML = "";
      }
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div className={className}>
      <div className="border-t border-border pt-8">
        <h3 className="text-xl font-semibold mb-4 text-center">
          💬 コメント・質問・ディスカッション
        </h3>
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-100 mb-2 font-medium">
            📝 この記事について議論しましょう
          </p>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>記事の内容についてのご質問やご感想</li>
            <li>実際に試してみた結果や体験談</li>
            <li>追加のテクニックや関連情報の共有</li>
            <li>学習方法についての意見交換</li>
          </ul>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
            GitHubアカウントでログインしてコメントできます。皆さんの意見や経験を共有していただけると、他の読者の方々の学習にも役立ちます。
          </p>
        </div>
        <div 
          ref={commentsRef} 
          className="giscus-container"
          style={{
            // ダークモードでの可読性を向上
            colorScheme: 'light dark'
          }}
        />
      </div>
    </div>
  );
}
