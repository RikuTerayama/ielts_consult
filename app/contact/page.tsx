import { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "お問い合わせフォーム",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">お問い合わせ</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p>
            当サイトへのご質問、ご意見、ご要望などがございましたら、以下の方法でお問い合わせください。
          </p>
          <h2>お問い合わせ先</h2>
          <p>
            Twitter（X）: <a href="https://twitter.com/ielts_consult" target="_blank" rel="noopener noreferrer">@ielts_consult</a>
          </p>
          <p className="text-muted-foreground text-sm mt-8">
            ※ お返事までに数日いただく場合がございます。予めご了承ください。
          </p>
        </div>
      </div>
    </div>
  );
}
