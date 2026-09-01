/**
 * 記事 slug を URL パス用にエンコードする。
 */
export function encodePostSlugForPath(slug: string): string {
  return encodeURIComponent(slug);
}
