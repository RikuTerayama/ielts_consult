"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ReadingProgressProps {
  className?: string;
}

export function ReadingProgress({ className }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    // 初回実行
    updateProgress();

    // スクロールイベントリスナーを追加
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const percentage = clickX / rect.width;
    const targetY = document.documentElement.scrollHeight * percentage;
    
    // 波紋効果を追加
    const newRipple = {
      id: Date.now(),
      x: clickX,
      y: clickY,
    };
    setRipples(prev => [...prev, newRipple]);
    
    // 波紋を0.6秒後に削除
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg transition-all duration-300 ease-out cursor-pointer group",
        "hover:scale-110 hover:shadow-xl hover:shadow-primary/20",
        "touch-manipulation", // タッチ操作の最適化
        "select-none", // テキスト選択を無効化
        isHovered && "scale-110 shadow-xl shadow-primary/20",
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="読書進捗"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // 画面外に出ないように制限
        right: 'max(1rem, min(1.5rem, 4vw))',
        bottom: 'max(1rem, min(1.5rem, 4vw))',
      }}
    >
      {/* 円形プログレスバー */}
      <div className="relative w-full h-full">
        {/* 背景円 */}
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted-foreground/20"
          />
          {/* プログレス円 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-500 ease-out"
            style={{
              filter: isHovered ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none'
            }}
          />
          {/* グラデーション定義 */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* 中央の進捗数値 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-foreground transition-all duration-300">
            {isHovered ? `${Math.round(progress)}%` : Math.round(progress)}
          </span>
        </div>
        
        {/* パルスアニメーション */}
        {progress > 0 && (
          <div className="absolute inset-0 rounded-full animate-pulse">
            <div 
              className="w-full h-full rounded-full bg-gradient-to-r from-primary/20 to-primary/10"
              style={{
                animation: `custom-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`
              }}
            />
          </div>　
        )}
        
        {/* 波紋効果 */}
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute rounded-full bg-primary/30 pointer-events-none ripple-effect"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
      </div>
    </div>
  );
}
