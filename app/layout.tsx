import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://ieltsconsult.netlify.app"),
  title: {
    default: "IELTS対策｜外資系コンサルの英語力底上げ",
    template: "%s｜IELTS対策｜外資系コンサルの英語力底上げ",
  },
  description: "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログ",
  keywords: ["IELTS", "英語学習", "外資系コンサル", "ビジネス英語", "英語力向上"],
  authors: [{ name: "IELTS Consult", url: "https://ieltsconsult.netlify.app" }],
  creator: "IELTS Consult",
  publisher: "IELTS Consult",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://ieltsconsult.netlify.app",
    siteName: "IELTS対策｜外資系コンサルの英語力底上げ",
    title: "IELTS対策｜外資系コンサルの英語力底上げ",
    description: "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログ",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "IELTS対策｜外資系コンサルの英語力底上げ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS対策｜外資系コンサルの英語力底上げ",
    description: "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログ",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "dcmOoLbM8zJ_79cLiGo_qTXDmO27gGdVD-RvyG4FWf8",
  },
  other: {
    "google-adsense": "ca-pub-4232725615106709",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Google AdSense - All pages (審査モードでは読み込まない) */}
        {process.env.NEXT_PUBLIC_REVIEW_MODE !== "true" && (
          <Script
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4232725615106709"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
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
            <main id="main-content" className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                "url": "https://ieltsconsult.netlify.app",
                "name": "IELTS対策｜外資系コンサルの英語力底上げ",
                "description": "IELTS対策、ビジネス英語、外資系コンサルで求められる英語力向上のための実践的なノウハウを発信するブログ",
              }),
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

