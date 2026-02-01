import { Metadata } from "next";

export const metadata: Metadata = {
  title: "免責事項",
  description: "情報の正確性、外部リンクの責任範囲、著作権、商品紹介に関する免責事項を明記。ご利用前にご確認ください。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/disclaimer/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1>免責事項：情報の正確性と責任範囲について</h1>
        <p>
          当サイトの情報は、できる限り正確な情報を提供するよう努めておりますが、正確性や安全性を保証するものではありません。
        </p>
        
        <h2>当サイトの情報について</h2>
        <p>
          当サイト「外資系コンサルの英語力底上げブログ」で掲載している情報は、できる限り正確な情報を提供するよう努めておりますが、正確性や安全性を保証するものではありません。
        </p>

        <h2>リンク先の外部サイトについて</h2>
        <p>
          当サイトからリンクやバナーなどによって他のサイトに移動した場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。
        </p>

        <h2>著作権について</h2>
        <p>
          当サイトで掲載している文章や画像などにつきましては、無断転載することを禁止します。当サイトは著作権や肖像権の侵害を目的としたものではありません。著作権や肖像権に関して問題がございましたら、お問い合わせフォームよりご連絡ください。迅速に対応いたします。
        </p>

        <h2>商品紹介について</h2>
        <p>
          当サイトでは、Amazonアソシエイト・プログラムを利用し、商品の紹介を行っています。商品の購入に関するトラブルについては、当サイトでは一切の責任を負いません。
        </p>

        <h2>損害賠償</h2>
        <p>
          当サイトの情報を利用することで発生したトラブルや損失、損害に対して、当サイトは一切責任を負いません。
        </p>

        <p className="text-sm text-muted-foreground">
          最終更新日: 2025年1月
        </p>
      </div>
    </div>
  );
}
