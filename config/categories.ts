/**
 * サイドバー分類用の設定
 * 記事のslugやtitleに基づいて、学習ステップとスキルを自動分類
 */

export const LEARNING_STEPS = [
  { id: 'beginner', label: 'はじめに', description: 'IELTS入門・基礎知識' },
  { id: 'foundation', label: '基礎', description: '基本的な対策と学習法' },
  { id: 'intermediate', label: '中級', description: 'スコア6.0〜7.0を目指す' },
  { id: 'advanced', label: '上級', description: 'スコア7.0以上を目指す' },
  { id: 'exam-prep', label: '試験直前', description: '直前対策とテクニック' },
] as const;

export const SKILLS = [
  { id: 'listening', label: 'Listening', icon: '🎧', description: 'リスニング対策' },
  { id: 'reading', label: 'Reading', icon: '📖', description: 'リーディング対策' },
  { id: 'writing', label: 'Writing', icon: '✍️', description: 'ライティング対策' },
  { id: 'speaking', label: 'Speaking', icon: '🗣️', description: 'スピーキング対策' },
] as const;

export type LearningStepId = typeof LEARNING_STEPS[number]['id'];
export type SkillId = typeof SKILLS[number]['id'];

/**
 * 記事タイトル・タグからカテゴリを推定する辞書
 * キーワードベースの自動分類
 */
export const CATEGORY_KEYWORDS = {
  // 学習ステップ
  steps: {
    beginner: ['入門', '初心者', 'はじめ', '基本', '初めて', 'とは'],
    foundation: ['基礎', '基本', '対策', '勉強法', '学習法'],
    intermediate: ['中級', '6.0', '6.5', '7.0', '失点', '鉄則'],
    advanced: ['上級', '7.5', '8.0', '高得点', 'ハイスコア', '完全'],
    'exam-prep': ['直前', '試験', '本番', '当日', 'テクニック', '戦略'],
  },
  // スキル
  skills: {
    listening: ['listening', 'リスニング', '聴解', '聞く'],
    reading: ['reading', 'リーディング', '読解', '読む'],
    writing: ['writing', 'ライティング', '書く', 'task', 'essay', 'エッセイ'],
    speaking: ['speaking', 'スピーキング', '話す', '会話', 'part'],
  },
} as const;

/**
 * タイトルとタグから学習ステップを推定
 */
export function inferLearningStep(title: string, tags: string[]): LearningStepId | null {
  const text = `${title} ${tags.join(' ')}`.toLowerCase();
  
  for (const [stepId, keywords] of Object.entries(CATEGORY_KEYWORDS.steps)) {
    if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return stepId as LearningStepId;
    }
  }
  
  return null;
}

/**
 * タイトルとタグからスキルを推定
 */
export function inferSkill(title: string, tags: string[]): SkillId | null {
  const text = `${title} ${tags.join(' ')}`.toLowerCase();
  
  for (const [skillId, keywords] of Object.entries(CATEGORY_KEYWORDS.skills)) {
    if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return skillId as SkillId;
    }
  }
  
  return null;
}

