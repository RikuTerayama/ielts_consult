"use client";

import { useState, useEffect } from "react";
import { Heading, TableOfContentsProps } from "@/lib/table-of-contents";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TableOfContentsComponentProps extends TableOfContentsProps {
  className?: string;
}

export function TableOfContents({
  headings,
  noteUrl,
  cutoffPoint,
  contentLength,
  className = "",
}: TableOfContentsComponentProps) {
  const [activeId, setActiveId] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  // スクロール位置に応じてアクティブな見出しを更新
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -80% 0%" }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const hasNoteContinuation = noteUrl && cutoffPoint && contentLength && cutoffPoint < contentLength;

  return (
    <div className={`toc-container bg-muted/30 border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">📋 目次</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label={isExpanded ? "目次を折りたたむ" : "目次を展開する"}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <nav className="toc-nav space-y-1">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block py-2 px-3 rounded-md transition-colors text-sm ${
                activeId === heading.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              style={{ paddingLeft: `${(heading.level - 1) * 16 + 12}px` }}
            >
              {heading.text}
            </a>
          ))}

          {hasNoteContinuation && (
            <div className="mt-4 pt-4 border-t border-border">
              <a
                href={noteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-center font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                📖 続きはnoteで公開中！
              </a>
              <p className="text-xs text-muted-foreground text-center mt-2">
                より詳しい解説と実践的なテクニック
              </p>
            </div>
          )}
        </nav>
      )}
    </div>
  );
}
