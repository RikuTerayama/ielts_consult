import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせありがとうございます",
  description: "お問い合わせを受け付けました。内容を確認のうえ、ご連絡いたします。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/contact/thanks/",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ContactThanksPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">お問い合わせを受け付けました</h1>
        <p className="text-lg text-muted-foreground mb-8">
          ご送信いただきありがとうございます。内容を確認のうえ、ご連絡いたします。お返事までに数日いただく場合がございます。予めご了承ください。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            トップへ戻る
          </Link>
          <Link
            href="/contact/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            お問い合わせページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
