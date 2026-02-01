import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookieポリシー",
  description: "当サイトのCookie使用と広告、計測に関する説明",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/cookie-policy/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1>Cookieポリシー</h1>
        
        <h2>Cookieの使用について</h2>
        <p>
          当サイトでは、ユーザーエクスペリエンスの向上とサイトの分析のためにCookieを使用しています。
        </p>

        <h2>使用するCookieの種類</h2>
        <h3>必須Cookie</h3>
        <p>
          サイトの基本的な機能を提供するために必要なCookieです。
          これらを無効にすると、サイトの一部機能が正常に動作しない可能性があります。
        </p>

        <h3>分析Cookie</h3>
        <p>
          サイトの利用状況を分析し、改善に役立てるために使用します。
          個人を特定する情報は含まれません。
        </p>

        <h3>広告Cookie</h3>
        <p>
          当サイトでは、Google AdSenseを使用して広告を表示しています。
          Google AdSenseは、ユーザーの興味に基づいた広告を表示するためにCookieを使用します。
        </p>
        <p>
          広告の配信を停止したい場合は、<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google広告設定</a>から設定を変更できます。
        </p>

        <h2>Cookieの管理</h2>
        <p>
          ブラウザの設定からCookieを無効にすることができます。
          ただし、Cookieを無効にすると、サイトの一部機能が正常に動作しない可能性があります。
        </p>

        <h2>お問い合わせ</h2>
        <p>
          Cookieに関するご質問は、<a href="/contact">お問い合わせページ</a>よりお願いいたします。
        </p>
      </div>
    </div>
  );
}
