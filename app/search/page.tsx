"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchPage() {
  const searchPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "記事検索",
    "description": "タイトル、内容、タグから記事を検索。IELTS対策やビジネス英語の情報を素早く見つけられます。",
    "url": "https://ieltsconsult.netlify.app/search/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://ieltsconsult.netlify.app/search/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(searchPageSchema),
        }}
      />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">記事検索</h1>
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="記事を検索..."
              disabled
              className="pl-10 text-lg h-12"
            />
          </div>
        </div>
        <div className="text-center py-12 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
          <p className="text-muted-foreground">検索機能を準備中です。しばらくお待ちください。</p>
        </div>
      </div>
    </>
  );
}
