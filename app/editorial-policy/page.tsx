import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "編集方針",
  description: "当サイトの記事作成方針、更新方針、誤り訂正の窓口について",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/editorial-policy/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EditorialPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1>編集方針</h1>
        
        <h2>記事の作成方針</h2>
        <p>
          当サイトでは、IELTS対策とビジネス英語学習に関する実践的な情報を提供しています。
          すべての記事は、筆者の実体験と専門知識に基づいて作成されています。
        </p>

        <h3>コンテンツの基準</h3>
        <ul>
          <li>実践的で即座に活用できる情報を提供</li>
          <li>具体的な例文、練習問題、FAQを含む</li>
          <li>読者が次のステップを明確に理解できる構成</li>
          <li>よくある誤りや注意点を明示</li>
        </ul>

        <h2>更新方針</h2>
        <p>
          記事の内容は、IELTS試験の変更や最新の学習方法に合わせて定期的に更新しています。
          重要な変更があった場合は、記事の冒頭に更新日を明記します。
        </p>

        <h2>誤り訂正</h2>
        <p>
          記事に誤りや不正確な情報を発見した場合は、<Link href="/contact">お問い合わせページ</Link>よりご連絡ください。
          確認後、速やかに修正いたします。
        </p>

        <h2>出典と引用</h2>
        <p>
          外部の情報源を引用する場合は、適切に出典を明記しています。
          統計データや研究結果を引用する際は、信頼できるソースを使用しています。
        </p>

        <h2>著作権</h2>
        <p>
          当サイトの記事は、筆者のオリジナルコンテンツです。
          無断転載は禁止されています。引用する場合は、出典を明記してください。
        </p>
      </div>
    </div>
  );
}
