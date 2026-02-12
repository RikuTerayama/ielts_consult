/**
 * 記事 slug を URL パス用にエンコードする。
 * # を二重エンコード（%2523）にし、静的ホストの 1 回デコード後に
 * out の実フォルダ名（%23）と一致させる。
 */
export function encodePostSlugForPath(slug: string): string {
  return encodeURIComponent(slug).replace(/%23/g, "%2523");
}
