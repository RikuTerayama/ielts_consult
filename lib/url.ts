/**
 * Netlify が公開URLで行う正規化に合わせ、動的パスの文字列を NFC + 小文字へ統一する。
 * 日本語は保持され、IELTS / Speaking などのASCII表記ゆれだけが収束する。
 */
export function normalizeRouteSegment(segment: string): string {
  return segment.normalize("NFC").toLowerCase();
}

export function encodeRouteSegmentForPath(segment: string): string {
  return encodeURIComponent(normalizeRouteSegment(segment));
}

export function encodePostSlugForPath(slug: string): string {
  return encodeRouteSegmentForPath(slug);
}
