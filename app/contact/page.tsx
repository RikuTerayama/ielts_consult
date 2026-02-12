import { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "IELTS対策やビジネス英語学習について、ご質問・ご意見をお寄せください。フォーム、Twitter（X）、メールからご連絡いただけます。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/contact/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">IELTS対策・英語学習のお問い合わせ</h1>
        <p className="text-lg text-muted-foreground mb-8">
          当サイトへのご質問、ご意見、ご要望などがございましたら、以下のフォームよりお送りください。
        </p>

        <form
          name="contact"
          method="POST"
          action="/contact/thanks/"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          className="space-y-6 mb-12"
        >
          <input type="hidden" name="form-name" value="contact" />
          <p className="hidden" aria-hidden="true">
            <label htmlFor="bot-field">
              この欄は入力しないでください:{" "}
              <input id="bot-field" name="bot-field" type="text" />
            </label>
          </p>

          <div className="space-y-2">
            <label htmlFor="contact-name" className="text-sm font-medium">
              お名前 <span className="text-destructive">*</span>
            </label>
            <Input
              id="contact-name"
              type="text"
              name="name"
              required
              placeholder="山田 太郎"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-email" className="text-sm font-medium">
              メールアドレス <span className="text-destructive">*</span>
            </label>
            <Input
              id="contact-email"
              type="email"
              name="email"
              required
              placeholder="example@example.com"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-message" className="text-sm font-medium">
              お問い合わせ内容 <span className="text-destructive">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={6}
              placeholder="ご質問・ご意見・ご要望などをご記入ください"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button type="submit" size="lg">
            送信する
          </Button>
        </form>

        <div className="prose prose-lg dark:prose-invert">
          <h2>急ぎの場合はこちら</h2>
          <p>
            Twitter（X）:{" "}
            <a href="https://twitter.com/ielts_consult" target="_blank" rel="noopener noreferrer">
              @ielts_consult
            </a>
          </p>
          {contactEmail && (
            <p>
              メール: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </p>
          )}
          <p className="text-muted-foreground text-sm mt-8">
            ※ お返事までに数日いただく場合がございます。予めご了承ください。
          </p>
        </div>
      </div>
    </div>
  );
}
