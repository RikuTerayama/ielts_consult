/**
 * 技能別記事の手動マッピング
 * 各スキルページで表示する記事とその順序を定義
 */

export interface SkillArticleMapping {
  slug: string;
  order: number;
}

export const SKILL_ARTICLE_MAPPINGS: Record<string, SkillArticleMapping[]> = {
  listening: [
    { slug: 'nfd42ac687984', order: 1 }, // 日本人学習者向け IELTSリスニングスコアアップの決定版ガイド
    { slug: 'n3200065ec76b', order: 2 }, // IELTS独学完全ロードマップ
  ],
  
  reading: [
    { slug: 'n019aaecea296', order: 1 }, // 日本人学習者向け IELTSリーディングスコアアップの決定版ガイド
    { slug: 'n3200065ec76b', order: 2 }, // IELTS独学完全ロードマップ
  ],
  
  writing: [
    { slug: 'n15d8a98fb855', order: 1 },  // 日本人学習者向け IELTSライティングスコアアップの決定版ガイド
    { slug: 'nf2c800fdb5e6', order: 2 },  // IELTSライティング Task1：高得点につながる表現集
    { slug: 'nc8f873763df6', order: 3 },  // IELTSライティング Task 1：失点を防ぐ22の鉄則
    { slug: 'nbf4c2291a938', order: 4 },  // IELTS ライティング Task 2：得点を上げるための表現大全
    { slug: 'n3f892dfe646d', order: 5 },  // IELTS ライティング Task 2：問題タイプ別解き方完全ガイド
    { slug: 'n1a971fb03450', order: 6 },  // IELTS ライティング Task 2：失点を防ぐ15の鉄則
    { slug: 'n6775d4429ef0', order: 7 },  // IELTS ライティング – スコアを落とさない11の鉄則
    { slug: 'n2d360aa73005', order: 8 },  // 永久保存版 IELTS Writingで高得点を狙う人へ
    { slug: 'n6f27b08a3632', order: 9 },  // 英語学習はWritingから始めるべき6つの理由
    { slug: 'n3200065ec76b', order: 10 }, // IELTS独学完全ロードマップ
  ],
  
  speaking: [
    { slug: 'ne68beb472a95', order: 1 },  // 日本人学習者向け IELTSスピーキングスコアアップの決定版ガイド
    { slug: 'nfd0f297ac1d6', order: 2 },  // 強く意見を伝える英語表現6選
    { slug: 'ne9d8203dd045', order: 3 },  // 目標や意図を自然に伝えるための「目的表現」6選
    { slug: 'n9a303ab21106', order: 4 },  // 加点につながる"追加情報"フレーズ集
    { slug: 'n997645629932', order: 5 },  // "I think"に頼らない主観表現5選
    { slug: 'n9883aa545907', order: 6 },  // 「対比・比較」英語表現6選
    { slug: 'n92beae39fd80', order: 7 },  // 意見を強調する英語表現6選
    { slug: 'n73ea63a15482', order: 8 },  // 加点につながる「うまく説明できてる？」を自然に伝える英語表現3選
    { slug: 'n70a885fec234', order: 9 },  // 加点につながる"一般化"フレーズ集
    { slug: 'n5e563cd04240', order: 10 }, // 加点につながる"具体例"フレーズ集
    { slug: 'n535bf33165ca', order: 11 }, // 加点につながる"結果表現"フレーズ集
    { slug: 'n2cd779121111', order: 12 }, // 加点につながる"因果関係"フレーズ集
    { slug: 'n17e52d8f3cbe', order: 13 }, // 意見をやわらかく伝える英語表現6選
    { slug: 'n46141c206ba6', order: 14 }, // スコアアップに必須の15のルール
    { slug: 'n963baa68fcd3', order: 15 }, // 「英語脳」に頼らない！日本語思考力を武器にするIELTS Speaking攻略法
    { slug: 'nab66d4b31c25', order: 16 }, // 完全保存版 IELTSスピーキングに必須の重要表現リスト
    { slug: 'n3200065ec76b', order: 17 }, // IELTS独学完全ロードマップ
  ],
};

/**
 * 指定されたスキルの記事リストを取得
 */
export function getArticlesForSkill(skill: string): string[] {
  const mappings = SKILL_ARTICLE_MAPPINGS[skill] || [];
  return mappings.map(m => m.slug);
}

/**
 * 記事のスキル別表示順序を取得
 */
export function getArticleOrder(skill: string, slug: string): number | null {
  const mappings = SKILL_ARTICLE_MAPPINGS[skill] || [];
  const mapping = mappings.find(m => m.slug === slug);
  return mapping?.order || null;
}

