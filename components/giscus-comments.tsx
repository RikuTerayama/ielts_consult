"use client";

import { useEffect, useRef } from "react";

interface GiscusCommentsProps {
  className?: string;
  enabled?: boolean;
}

export function GiscusComments({ className, enabled = true }: GiscusCommentsProps) {
  if (!enabled) {
    return null;
  }
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    script.setAttribute("data-lang", "ja");
    script.setAttribute("data-loading", "lazy");
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
