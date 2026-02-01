import { Metadata } from "next";

export const metadata: Metadata = {
  title: "アフィリエイトに関する表示",
  description: "AmazonアソシエイトやGoogle AdSenseなど、当サイトの収益源とアフィリエイト方針をご紹介します。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/affiliate-disclosure/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AffiliateDisclosurePage() {
  const siteName = "外資系コンサルの英語力底上げブログ";
  const lastUpdated = "2025年1月";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1>アフィリエイト収益に関する表示と方針</h1>
        <p>
          当サイトはAmazonアソシエイト・Google AdSenseなどのアフィリエイトプログラムに参加しています。収益の有無にかかわらず、読者にとって価値あるコンテンツを提供します。
        </p>
        
        <p className="text-sm text-muted-foreground">
          最終更新日：{lastUpdated}
        </p>

        <h2>アフィリエイトプログラムの参加について</h2>
        <p>
          当サイト「{siteName}」（以下、「当サイト」）は、以下のアフィリエイトプログラムに参加しています：
        </p>
        <ul>
          <li>Amazonアソシエイト・プログラム</li>
          <li>Google AdSense</li>
          <li>その他のアフィリエイトサービス</li>
        </ul>

        <h2>収益について</h2>
        <p>
          当サイトは適格販売により収入を得る場合があります。広告のクリックや商品購入により、当サイトに収益が発生することがありますが、
          <strong>ユーザーの追加負担は一切ありません</strong>。
        </p>

        <h2>広告の表示位置について</h2>
        <p>
          広告の表示位置は、以下の方針に基づいて決定しています：
        </p>
        <ul>
          <li>可読性とユーザー体験に配慮した配置</li>
          <li>誤クリックを誘導しないデザイン</li>
          <li>コンテンツの品質を損なわない量と位置</li>
        </ul>

        <h2>商品・サービスの推奨について</h2>
        <p>
          当サイトで紹介する商品やサービスは、以下の基準で選定しています：
        </p>
        <ul>
          <li>実際に使用・検証したもの、または信頼できる情報源に基づくもの</li>
          <li>読者にとって価値があると判断したもの</li>
          <li>IELTS学習や英語力向上に役立つと考えられるもの</li>
        </ul>
        <p>
          アフィリエイト収益の有無にかかわらず、公正かつ誠実なレビュー・推奨を行うことを心がけています。
        </p>

        <h2>免責事項</h2>
        <p>
          アフィリエイトリンクを経由して購入された商品・サービスに関するトラブルや損害について、当サイトは一切の責任を負いかねます。
          購入前に各販売事業者の利用規約等をご確認ください。
        </p>

        <h2>お問い合わせ</h2>
        <p>
          アフィリエイトプログラムに関するご質問は、
          <a href="/contact">お問い合わせページ</a>よりお願いいたします。
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          本開示事項は予告なく変更される場合があります。
        </p>
      </div>
    </div>
  );
}
