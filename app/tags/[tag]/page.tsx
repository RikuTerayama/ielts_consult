import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type TagPageProps = {
  params: { tag: string };
};

export const dynamicParams = false;

// output: 'export' では 0 件だとビルドエラーになるため 1 件返す
export async function generateStaticParams(): Promise<Array<{ tag: string }>> {
  return [{ tag: "_" }];
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `Tag: ${tag}`,
    description: `タグ「${tag}」の記事一覧`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">{tag}</h1>
      <div className="text-center py-12 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
        <p className="text-muted-foreground mb-6">このタグの記事を準備中です。</p>
        <Button asChild variant="outline">
          <Link href="/tags">タグ一覧へ</Link>
        </Button>
      </div>
    </div>
  );
}
