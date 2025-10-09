"use client"

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  className?: string;
  slot: string;
  format?: "horizontal" | "vertical" | "rectangle";
}

export function AdSlot({ className, slot, format = "horizontal" }: AdSlotProps) {
  const isAdsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

  useEffect(() => {
    if (isAdsEnabled && adClient && adSlot) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, [isAdsEnabled, adClient, adSlot]);

  if (!isAdsEnabled || !adClient) {
    // プレースホルダー表示
    return (
      <div
        className={cn(
          "ad-slot",
          format === "horizontal" && "min-h-[100px]",
          format === "vertical" && "min-h-[600px]",
          format === "rectangle" && "min-h-[250px]",
          className
        )}
        role="img"
        aria-label="広告スペース（未設定）"
      >
        <p>広告スペース（ENABLE_ADS=false）</p>
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

