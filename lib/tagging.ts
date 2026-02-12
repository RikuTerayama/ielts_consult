/**
 * タイトル・本文からタグを推定するキーワードベースの抽出ロジック
 * scripts/import-note-posts.ts の extractTags と同等
 */

const TAG_KEYWORDS: Record<string, string[]> = {
  IELTS: ["ielts", "アイエルツ"],
  Writing: ["writing", "ライティング", "書き方"],
  Speaking: ["speaking", "スピーキング", "話す"],
  Reading: ["reading", "リーディング", "読解"],
  Listening: ["listening", "リスニング", "聴解"],
  "Task 1": ["task 1", "task1", "タスク1"],
  "Task 2": ["task 2", "task2", "タスク2"],
  外資系: ["外資系", "コンサル", "consulting"],
  英語学習: ["英語学習", "勉強法", "学習法"],
  ビジネス英語: ["ビジネス英語", "business english"],
  語彙: ["語彙", "vocabulary", "単語"],
  文法: ["文法", "grammar"],
  表現: ["表現", "expression", "フレーズ"],
};

/**
 * タイトルと本文テキストからタグを推定する
 */
export function extractTags(title: string, content: string): string[] {
  const tags: string[] = [];
  const text = `${title} ${content}`.toLowerCase();

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      tags.push(tag);
    }
  }

  if (tags.length === 0) {
    tags.push("英語学習");
  }

  return [...new Set(tags)];
}
