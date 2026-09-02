"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { A8_ADS, type A8Ad } from "@/config/a8-ads";

const CURSOR_KEY = "a8-ad-rotation:v1:cursor";
const SEEN_KEY_PREFIX = "a8-ad-rotation:v1:seen";

type A8RotatingAdProps = {
  slot: string;
  allowLeaderboard?: boolean;
  maxCreativeWidth?: 300 | 336 | 728;
  minViewportWidth?: number;
  preferLeaderboard?: boolean;
  className?: string;
};

function getEligibleAds(
  allowLeaderboard: boolean,
  maxCreativeWidth: 300 | 336 | 728,
  preferLeaderboard: boolean
): readonly A8Ad[] {
  const viewportWidth = document.documentElement.clientWidth;
  const horizontalPadding = viewportWidth < 640 ? 48 : 64;
  const availableWidth = Math.min(
    maxCreativeWidth,
    viewportWidth - horizontalPadding
  );

  const eligibleAds = A8_ADS.filter((ad) => {
    if (ad.width > availableWidth) return false;
    if (ad.width === 728 && (!allowLeaderboard || viewportWidth < 768)) return false;
    return true;
  });

  const leaderboardAds = eligibleAds.filter((ad) => ad.width === 728);
  return preferLeaderboard && leaderboardAds.length > 0
    ? leaderboardAds
    : eligibleAds;
}

function selectAd(
  slot: string,
  pathname: string,
  allowLeaderboard: boolean,
  maxCreativeWidth: 300 | 336 | 728,
  preferLeaderboard: boolean
): A8Ad | null {
  const eligibleAds = getEligibleAds(
    allowLeaderboard,
    maxCreativeWidth,
    preferLeaderboard
  );
  if (eligibleAds.length === 0) return null;

  const storage = window.sessionStorage;
  const seenKey = `${SEEN_KEY_PREFIX}:${pathname}:${slot}`;
  const seenId = storage.getItem(seenKey);
  const seenAd = eligibleAds.find((ad) => ad.id === seenId);
  if (seenAd) return seenAd;

  const storedCursor = Number.parseInt(storage.getItem(CURSOR_KEY) ?? "0", 10);
  const cursor = Number.isFinite(storedCursor) ? storedCursor : 0;

  for (let offset = 0; offset < A8_ADS.length; offset += 1) {
    const index = (cursor + offset) % A8_ADS.length;
    const candidate = A8_ADS[index];
    if (!eligibleAds.some((ad) => ad.id === candidate.id)) continue;

    storage.setItem(seenKey, candidate.id);
    storage.setItem(CURSOR_KEY, String((index + 1) % A8_ADS.length));
    return candidate;
  }

  return eligibleAds[0];
}

export function A8RotatingAd({
  slot,
  allowLeaderboard = false,
  maxCreativeWidth = 728,
  minViewportWidth = 0,
  preferLeaderboard = false,
  className = "",
}: A8RotatingAdProps) {
  const pathname = usePathname();
  const [ad, setAd] = useState<A8Ad | null>(null);

  useEffect(() => {
    const updateAd = () => {
      if (document.documentElement.clientWidth < minViewportWidth) {
        setAd(null);
        return;
      }
      setAd(
        selectAd(
          slot,
          pathname,
          allowLeaderboard,
          maxCreativeWidth,
          preferLeaderboard
        )
      );
    };

    updateAd();
    window.addEventListener("resize", updateAd);
    return () => window.removeEventListener("resize", updateAd);
  }, [
    allowLeaderboard,
    maxCreativeWidth,
    minViewportWidth,
    pathname,
    preferLeaderboard,
    slot,
  ]);

  return (
    <aside
      className={`a8-ad ${className}`.trim()}
      aria-label="広告"
      data-a8-slot={slot}
      data-a8-ad-id={ad?.id}
      data-a8-width={ad?.width}
    >
      <span className="a8-ad__label">PR</span>
      {ad && (
        <div
          className="a8-ad__creative"
          dangerouslySetInnerHTML={{ __html: ad.html }}
        />
      )}
    </aside>
  );
}
