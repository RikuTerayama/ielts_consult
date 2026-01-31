"use client"

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  className?: string;
  slot: string;
  format?: "horizontal" | "vertical" | "rectangle";
}

export function AdSlot({ className, slot, format = "horizontal" }: AdSlotProps) {
  // 審査モード: NEXT_PUBLIC_REVIEW_MODE=true のときは広告を一切表示しない
  const isReviewMode = process.env.NEXT_PUBLIC_REVIEW_MODE === "true";
  
  // AdSenseの設定（環境変数またはデフォルト値を使用）
  const isAdsEnabled = !isReviewMode && process.env.NEXT_PUBLIC_ENABLE_ADS !== "false"; // デフォルトでtrue
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-4232725615106709";
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

  useEffect(() => {
    if (isAdsEnabled && adClient) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, [isAdsEnabled, adClient]);

  if (!isAdsEnabled) {
    // 広告を無効化している場合のみプレースホルダー表示
    return (
      <div
        className={cn(
          "ad-slot bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center",
          format === "horizontal" && "min-h-[100px]",
          format === "vertical" && "min-h-[600px]",
          format === "rectangle" && "min-h-[250px]",
          className
        )}
        role="img"
        aria-label="広告スペース（無効）"
      >
        <p className="text-sm text-muted-foreground">広告スペース（ENABLE_ADS=false）</p>
      </div>
    );
  }

  return (
    <div className={cn("ad-container", className)}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          minHeight: format === "horizontal" ? "100px" : format === "vertical" ? "600px" : "250px",
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot || slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

