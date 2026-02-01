/**
 * 有料note記事のスラッグリスト
 * 
 * このリストに含まれる記事は、サイトの一覧から除外され、
 * 直接アクセスされた場合は notFound として扱われます。
 * 
 * 有料記事の判定方法:
 * 1. scripts/list-note-links.ts を実行してnote URL一覧を取得
 * 2. 各URLを手動で確認し、有料記事のスラッグをこのリストに追加
 */
export const PAID_POST_SLUGS: string[] = [
  // 例: 'ne68beb472a95',
  // 例: 'n70a885fec234',
  // 有料記事のスラッグをここに追加してください
];

/**
 * 有料記事のスラッグセット（高速検索用）
 */
export const PAID_POST_SLUG_SET = new Set(PAID_POST_SLUGS);
