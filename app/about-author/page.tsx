import { Metadata } from "next";

export const metadata: Metadata = {
  title: "筆者について",
  description: "IELTS対策ブログの筆者プロフィールと学習指導のスタンス",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/about-author/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutAuthorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1>筆者について</h1>
        
        <h2>プロフィール</h2>
        <p>
          外資系コンサルティングファームでの実務経験を持つ筆者が、
          自身の英語学習経験と実践で培ったノウハウをもとに記事を執筆しています。
        </p>

        <h2>学習指導のスタンス</h2>
        <p>
          当サイトでは、以下の方針で学習者をサポートしています：
        </p>
        <ul>
          <li>実践的で即座に活用できる情報の提供</li>
          <li>理論だけでなく、具体的な例文や練習問題の提示</li>
          <li>読者のレベルに応じた段階的な学習方法の提案</li>
          <li>よくある誤りや注意点の明示</li>
        </ul>

        <h2>実績</h2>
        <p>
          筆者は、独学でIELTS 7.0を達成し、TOEIC 900点以上を取得しています。
          これらの経験を活かし、忙しい社会人でも効率的に学習できる方法を提案しています。
        </p>

        <h2>お問い合わせ</h2>
        <p>
          ご質問やご意見は、<a href="/contact">お問い合わせページ</a>よりお願いいたします。
        </p>
      </div>
    </div>
  );
}
