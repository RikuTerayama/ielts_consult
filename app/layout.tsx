import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://ielts-consult.netlify.app"),
  title: {
    default: "外資系コンサルの英語力底上げブログ",
    template: "%s | 外資系コンサルの英語力底上げブログ",
  },
  description: "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログ",
  keywords: ["IELTS", "英語学習", "外資系コンサル", "ビジネス英語", "英語力向上"],
  authors: [{ name: "IELTS Consult" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://ielts-consult.netlify.app",
    siteName: "外資系コンサルの英語力底上げブログ",
    title: "外資系コンサルの英語力底上げブログ",
    description: "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログ",
  },
  twitter: {
    card: "summary_large_image",
    title: "外資系コンサルの英語力底上げブログ",
    description: "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログ",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_ENABLE_ADS === "true" && process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a href="#main-content" className="skip-link">
            メインコンテンツへスキップ
          </a>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

