import { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて",
  description: "外資系コンサルの英語力底上げブログについて",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1>このサイトについて</h1>
        
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
