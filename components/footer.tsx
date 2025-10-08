import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">外資系コンサルの英語力底上げブログ</h3>
            <p className="text-sm text-muted-foreground">
              IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信しています。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">コンテンツ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/posts" className="text-muted-foreground hover:text-primary transition-colors">
                  記事一覧
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-muted-foreground hover:text-primary transition-colors">
                  タグ一覧
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors">
                  記事検索
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">情報</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  このサイトについて
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors">
                  免責事項
                </Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure" className="text-muted-foreground hover:text-primary transition-colors">
                  アフィリエイト表示
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">フィード</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/rss.xml" className="text-muted-foreground hover:text-primary transition-colors">
                  RSS Feed
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="text-muted-foreground hover:text-primary transition-colors">
                  サイトマップ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} 外資系コンサルの英語力底上げブログ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

