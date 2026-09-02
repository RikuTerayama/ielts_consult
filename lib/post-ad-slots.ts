import { load } from "cheerio/slim";
import type { AnyNode } from "domhandler";

type WeightedBoundary = {
  afterIndex: number;
  cumulativeWeight: number;
};

function getNodeWeight(node: AnyNode): number {
  const $ = load(`<div id="__weight-root"></div>`);
  const $root = $("#__weight-root");
  $root.append($(node).clone());

  const textWeight = $root.text().replace(/\s+/g, " ").trim().length;
  const mediaWeight = $root.find("img, figure, video, audio").length * 240;
  const structureWeight = $root.find("table, ul, ol, blockquote").length * 100;
  return Math.max(1, textWeight + mediaWeight + structureWeight);
}

function getTagName(node: AnyNode): string {
  return ((node as { tagName?: string }).tagName ?? "").toLowerCase();
}

/**
 * 記事本文をトップレベル要素の境界で分割する。HTML要素の途中には広告を挿入しない。
 * 長い記事は約28%・60%、それ以外は約55%に1枠だけ設ける。
 */
export function splitPostContentForAds(
  contentHtml: string,
  maxAdSlots: 0 | 1 | 2 = 2
): string[] {
  if (!contentHtml.trim() || maxAdSlots === 0) return [contentHtml];

  const $ = load(`<div id="__post-ad-root">${contentHtml}</div>`);
  const nodes = $("#__post-ad-root").contents().toArray();
  if (nodes.length < 4) return [contentHtml];

  const textLength = $("#__post-ad-root")
    .text()
    .replace(/\s+/g, " ")
    .trim().length;
  const weights = nodes.map((node) => getNodeWeight(node));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cumulativeWeight = 0;
  const candidates: WeightedBoundary[] = [];

  nodes.forEach((node, index) => {
    cumulativeWeight += weights[index];
    const tagName = getTagName(node);
    const isSafeBlock =
      node.type === "tag" &&
      !/^h[1-6]$/.test(tagName) &&
      !["script", "style"].includes(tagName);
    const progress = cumulativeWeight / totalWeight;

    if (isSafeBlock && progress >= 0.16 && progress <= 0.84) {
      candidates.push({ afterIndex: index, cumulativeWeight });
    }
  });

  if (candidates.length < 2) return [contentHtml];

  const targetRatios =
    maxAdSlots === 2 && textLength >= 3000 && candidates.length >= 8
      ? [0.28, 0.6]
      : [0.55];
  const boundaries: number[] = [];

  for (const ratio of targetRatios) {
    const targetWeight = totalWeight * ratio;
    const available = candidates.filter(
      (candidate) =>
        !boundaries.some(
          (existingBoundary) =>
            Math.abs(existingBoundary - candidate.afterIndex) < 3
        )
    );
    if (available.length === 0) continue;

    const nearest = available.reduce((best, candidate) =>
      Math.abs(candidate.cumulativeWeight - targetWeight) <
      Math.abs(best.cumulativeWeight - targetWeight)
        ? candidate
        : best
    );
    boundaries.push(nearest.afterIndex);
  }

  if (boundaries.length === 0) return [contentHtml];

  const sortedBoundaries = boundaries.sort((a, b) => a - b);
  const segments: string[] = [];
  let startIndex = 0;

  for (const boundary of sortedBoundaries) {
    segments.push(
      nodes
        .slice(startIndex, boundary + 1)
        .map((node) => $(node).toString())
        .join("")
    );
    startIndex = boundary + 1;
  }

  segments.push(
    nodes
      .slice(startIndex)
      .map((node) => $(node).toString())
      .join("")
  );

  return segments.filter((segment) => segment.trim().length > 0);
}
