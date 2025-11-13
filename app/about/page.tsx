import { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて",
  description: "外資系コンサルの英語力向上を支援するブログ。IELTS対策からビジネス実務まで、実体験ベースのノウハウを発信しています。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/about/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1>IELTS対策とビジネス英語学習をサポートするサイトについて</h1>
        
        <h2>サイトの目的</h2>
        <p>
          「外資系コンサルの英語力底上げブログ」は、IELTS対策、ビジネス英語、外資系コンサルティングファームで求められる実践的な英語力の向上を目指す方々のための情報発信サイトです。
        </p>

        <h2>コンテンツについて</h2>
        <p>
          当サイトでは、以下のようなテーマを中心に記事を公開しています：
        </p>
        <ul>
          <li>IELTSライティング・スピーキング対策</li>
          <li>ビジネス英語の実践的なテクニック</li>
          <li>外資系コンサルで使える英語表現</li>
          <li>英語学習のための教材レビュー</li>
          <li>効率的な学習方法の提案</li>
        </ul>

        <h2>コンテンツの出典について</h2>
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            📝 重要なご案内
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            当サイトの記事は、<a href="https://note.com/ielts_consult" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">note</a>で公開された記事の<strong>要約版</strong>です。
            元の記事の要点をまとめ、独自の解説や分析を追加して提供しています。
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            各記事の冒頭には出典情報を明記し、元のnote記事へのリンクを提供しています。
            より詳しい解説、実践例、追加情報については、各記事に記載されている元のnote記事をご覧ください。
          </p>
        </div>
        <p>
          当サイトでは、以下の価値を追加してコンテンツを提供しています：
        </p>
        <ul>
          <li><strong>記事の要点をまとめた要約セクション</strong>：主要なポイントを3-5個に整理し、各ポイントに対する解説を追加</li>
          <li><strong>記事本文前の導入セクション</strong>：記事の背景や文脈を説明し、読む前に理解すべきポイントを提示</li>
          <li><strong>記事本文後の補足説明</strong>：記事の重要なポイントを強調し、実践的なアドバイスを追加</li>
          <li><strong>記事末尾の洞察セクション</strong>：この記事から学べることのまとめと、次のステップの提案</li>
          <li><strong>検索性を高めるためのタグ付けとカテゴリ分類</strong>：学習ステップやスキル別に記事を整理</li>
          <li><strong>関連記事の推薦機能</strong>：関連する記事を自動的に推薦</li>
          <li><strong>コメント機能による読者との交流</strong>：読者同士で意見交換や質問ができる環境を提供</li>
        </ul>
        <p className="mt-4">
          <strong>知的財産権について</strong>：当サイトは、noteで公開された記事の要約版を提供しており、出典を適切に明示しています。
          元の記事の著作権はnoteの著者に帰属し、当サイトは要約と独自の解説を追加することで価値を提供しています。
        </p>

        <h2>運営者について</h2>
        <p>
          外資系コンサルティングファームでの実務経験を持つ筆者が、自身の英語学習経験と実践で培ったノウハウをもとに記事を執筆しています。
        </p>

        <h2>お問い合わせ</h2>
        <p>
          ご質問・ご意見は<a href="/contact">お問い合わせページ</a>よりお願いいたします。
        </p>
      </div>
    </div>
  );
}
