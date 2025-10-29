/**
 * 学習ステップ別記事の手動マッピング
 * 各ステップページで表示する記事とその順序を定義
 */

export interface StepArticleMapping {
  slug: string;
  order: number;
}

export const STEP_ARTICLE_MAPPINGS: Record<string, StepArticleMapping[]> = {
  beginner: [
    { slug: 'n3200065ec76b', order: 1 }, // IELTS独学完全ロードマップ：TOEIC800社会人が6.5〜7.0を達成する総合ガイド
    { slug: 'n6f27b08a3632', order: 2 }, // 英語学習はWritingから始めるべき6つの理由
    { slug: 'n019aaecea296', order: 3 }, // 【保存版】日本人学習者向け IELTSリーディングスコアアップの決定版ガイド
    { slug: 'nfd42ac687984', order: 4 }, // 【保存版】日本人学習者向け IELTSリスニングスコアアップの決定版ガイド
    { slug: 'n15d8a98fb855', order: 5 }, // 【保存版】日本人学習者向け IELTSライティングスコアアップの決定版ガイド
    { slug: 'ne68beb472a95', order: 6 }, // 【保存版】日本人学習者向け IELTSスピーキングスコアアップの決定版ガイド
  ],
  
  foundation: [
    { slug: 'n019aaecea296', order: 1 }, // 【保存版】日本人学習者向け IELTSリーディングスコアアップの決定版ガイド
    { slug: 'nfd42ac687984', order: 2 }, // 【保存版】日本人学習者向け IELTSリスニングスコアアップの決定版ガイド
    { slug: 'n15d8a98fb855', order: 3 }, // 【保存版】日本人学習者向け IELTSライティングスコアアップの決定版ガイド
    { slug: 'ne68beb472a95', order: 4 }, // 【保存版】日本人学習者向け IELTSスピーキングスコアアップの決定版ガイド
    { slug: 'n3200065ec76b', order: 5 }, // IELTS独学完全ロードマップ：TOEIC800社会人が6.5〜7.0を達成する総合ガイド
    { slug: 'n2d360aa73005', order: 6 }, // 【永久保存版】IELTS Writingで高得点を狙う人へ ── スコア基準に直結する必須視点と表現まとめ
  ],
  
  intermediate: [
    { slug: 'nf2c800fdb5e6', order: 1 },  // IELTSライティング Task1：高得点につながる表現集
    { slug: 'nc8f873763df6', order: 2 },  // IELTSライティング Task 1：失点を防ぐ22の鉄則【完全ガイド】
    { slug: 'nbf4c2291a938', order: 3 },  // IELTS ライティング Task 2：得点を上げるための表現大全
    { slug: 'n3f892dfe646d', order: 4 },  // IELTS ライティング Task 2：問題タイプ別解き方完全ガイド
    { slug: 'n1a971fb03450', order: 5 },  // IELTS ライティング Task 2：失点を防ぐ15の鉄則
    { slug: 'n6775d4429ef0', order: 6 },  // IELTS ライティング – スコアを落とさない11の鉄則【中上級者向け】
    { slug: 'n963baa68fcd3', order: 7 },  // 「英語脳」に頼らない！日本語思考力を武器にするIELTS Speaking攻略法
    { slug: 'nab66d4b31c25', order: 8 },  // 【完全保存版】IELTSスピーキングに必須の重要表現リスト｜話を論理的につなぐフレーズ大全
    { slug: 'n2d360aa73005', order: 9 },  // 【永久保存版】IELTS Writingで高得点を狙う人へ ── スコア基準に直結する必須視点と表現まとめ
    { slug: 'n3200065ec76b', order: 10 }, // IELTS独学完全ロードマップ：TOEIC800社会人が6.5〜7.0を達成する総合ガイド
    { slug: 'nfd0f297ac1d6', order: 11 }, // 【保存版】IELTSスピーキング対策：そのまま使える！強く意見を伝える英語表現6選（Part1〜3共通）
    { slug: 'ne9d8203dd045', order: 12 }, // 【保存版】IELTSスピーキング対策：そのまま使える！目標や意図を自然に伝えるための「目的表現」6選（Part1〜3共通）
    { slug: 'n9a303ab21106', order: 13 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる"追加情報"フレーズ集（Part1〜3共通）
    { slug: 'n997645629932', order: 14 }, // 【保存版】IELTSスピーキング対策：そのまま使える！"I think"に頼らない主観表現5選（Part1〜3共通）
    { slug: 'n9883aa545907', order: 15 }, // 【保存版】IELTSスピーキング対策：そのまま使える！「対比・比較」英語表現6選（Part1〜3共通）
    { slug: 'n92beae39fd80', order: 16 }, // 【保存版】IELTSスピーキング対策：そのまま使える！意見を強調する英語表現6選（Part1〜3共通）
    { slug: 'n73ea63a15482', order: 17 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる「うまく説明できてる？」を自然に伝える英語表現3選（Part1〜3共通）
    { slug: 'n70a885fec234', order: 18 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる"一般化"フレーズ集（Part1〜3共通）
    { slug: 'n5e563cd04240', order: 19 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる"具体例"フレーズ集（Part1〜3共通）
    { slug: 'n535bf33165ca', order: 20 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる"結果表現"フレーズ集（Part1〜3共通）
    { slug: 'n2cd779121111', order: 21 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる"因果関係"フレーズ集（Part1〜3共通）
    { slug: 'n17e52d8f3cbe', order: 22 }, // 【保存版】IELTSスピーキング対策：そのまま使える！意見をやわらかく伝える英語表現6選（Part1〜3共通）
    { slug: 'n46141c206ba6', order: 23 }, // 【保存版】IELTSスピーキング対策｜スコアアップに必須の15のルール＆高得点テンプレ集
  ],
  
  advanced: [
    { slug: 'nfd0f297ac1d6', order: 1 }, // 【保存版】IELTSスピーキング対策：そのまま使える！強く意見を伝える英語表現6選（Part1〜3共通）
    { slug: 'ne9d8203dd045', order: 2 }, // 【保存版】IELTSスピーキング対策：そのまま使える！目標や意図を自然に伝えるための「目的表現」6選（Part1〜3共通）
    { slug: 'n9a303ab21106', order: 3 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる"追加情報"フレーズ集（Part1〜3共通）
    { slug: 'n997645629932', order: 4 }, // 【保存版】IELTSスピーキング対策：そのまま使える！"I think"に頼らない主観表現5選（Part1〜3共通）
    { slug: 'n9883aa545907', order: 5 }, // 【保存版】IELTSスピーキング対策：そのまま使える！「対比・比較」英語表現6選（Part1〜3共通）
    { slug: 'n92beae39fd80', order: 6 }, // 【保存版】IELTSスピーキング対策：そのまま使える！意見を強調する英語表現6選（Part1〜3共通）
    { slug: 'n73ea63a15482', order: 7 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる「うまく説明できてる？」を自然に伝える英語表現3選（Part1〜3共通）
    { slug: 'n70a885fec234', order: 8 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる"一般化"フレーズ集（Part1〜3共通）
    { slug: 'n5e563cd04240', order: 9 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる"具体例"フレーズ集（Part1〜3共通）
    { slug: 'n535bf33165ca', order: 10 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる"結果表現"フレーズ集（Part1〜3共通）
    { slug: 'n2cd779121111', order: 11 }, // 【保存版】IELTSスピーキング対策：そのまま使える！加点につながる"因果関係"フレーズ集（Part1〜3共通）
    { slug: 'n17e52d8f3cbe', order: 12 }, // 【保存版】IELTSスピーキング対策：そのまま使える！意見をやわらかく伝える英語表現6選（Part1〜3共通）
    { slug: 'n46141c206ba6', order: 13 }, // 【保存版】IELTSスピーキング対策｜スコアアップに必須の15のルール＆高得点テンプレ集
    { slug: 'n963baa68fcd3', order: 14 }, // 「英語脳」に頼らない！日本語思考力を武器にするIELTS Speaking攻略法
    { slug: 'nab66d4b31c25', order: 15 }, // 【完全保存版】IELTSスピーキングに必須の重要表現リスト｜話を論理的につなぐフレーズ大全
    { slug: 'nf2c800fdb5e6', order: 16 }, // IELTSライティング Task1：高得点につながる表現集
    { slug: 'nc8f873763df6', order: 17 }, // IELTSライティング Task 1：失点を防ぐ22の鉄則【完全ガイド】
    { slug: 'nbf4c2291a938', order: 18 }, // IELTS ライティング Task 2：得点を上げるための表現大全
    { slug: 'n3f892dfe646d', order: 19 }, // IELTS ライティング Task 2：問題タイプ別解き方完全ガイド
    { slug: 'n1a971fb03450', order: 20 }, // IELTS ライティング Task 2：失点を防ぐ15の鉄則
    { slug: 'n6775d4429ef0', order: 21 }, // IELTS ライティング – スコアを落とさない11の鉄則【中上級者向け】
  ],
  
  'exam-prep': [
    { slug: 'n963baa68fcd3', order: 1 },  // 「英語脳」に頼らない！日本語思考力を武器にするIELTS Speaking攻略法
    { slug: 'nab66d4b31c25', order: 2 },  // 【完全保存版】IELTSスピーキングに必須の重要表現リスト｜話を論理的につなぐフレーズ大全
    { slug: 'nf2c800fdb5e6', order: 3 },  // IELTSライティング Task1：高得点につながる表現集
    { slug: 'nc8f873763df6', order: 4 },  // IELTSライティング Task 1：失点を防ぐ22の鉄則【完全ガイド】
    { slug: 'nbf4c2291a938', order: 5 },  // IELTS ライティング Task 2：得点を上げるための表現大全
    { slug: 'n3f892dfe646d', order: 6 },  // IELTS ライティング Task 2：問題タイプ別解き方完全ガイド
    { slug: 'n1a971fb03450', order: 7 },  // IELTS ライティング Task 2：失点を防ぐ15の鉄則
    { slug: 'n6775d4429ef0', order: 8 },  // IELTS ライティング – スコアを落とさない11の鉄則【中上級者向け】
  ],
};

/**
 * 指定されたステップの記事リストを取得
 */
export function getArticlesForStep(step: string): string[] {
  const mappings = STEP_ARTICLE_MAPPINGS[step] || [];
  return mappings.map(m => m.slug);
}

/**
 * 記事のステップ別表示順序を取得
 */
export function getArticleOrder(step: string, slug: string): number | null {
  const mappings = STEP_ARTICLE_MAPPINGS[step] || [];
  const mapping = mappings.find(m => m.slug === slug);
  return mapping?.order || null;
}
