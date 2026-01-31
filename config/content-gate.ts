/**
 * 公開可否のゲート設定
 * 
 * このリストに含まれる記事のみが公開されます。
 * リストにない記事は一覧、タグ、サイトマップ、RSSから除外され、
 * 直接アクセスされた場合は notFound として扱われます。
 * 
 * 公開条件:
 * - content/additions/[slug].mdx が存在すること
 * - 記事に独自の付加価値（オリジナル解説、練習、FAQ等）が含まれていること
 */
export type PostGateStatus = "public" | "hidden";

/**
 * 公開記事のスラッグリスト
 * 
 * 初期値は空配列。scripts/audit-adsense-readiness.ts を実行して
 * additions が存在する記事を確認し、ここに追加してください。
 */
export const PUBLIC_POST_SLUGS: string[] = [
  // 例: 'n019aaecea296',
  // 例: 'n15d8a98fb855',
  // additions/[slug].mdx が存在する記事のスラッグをここに追加してください
];

/**
 * 公開記事のスラッグセット（高速検索用）
 */
export const PUBLIC_POST_SET = new Set(PUBLIC_POST_SLUGS);
