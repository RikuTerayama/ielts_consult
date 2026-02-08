import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PostPageProps {
  params: { slug: string };
}

export const dynamicParams = false;

// output: 'export' では generateStaticParams が必須。0件だとビルドエラーになるため1件返す
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return [{ slug: "_" }];
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  return {
    title: "記事 | IELTS対策",
    description: "お探しの記事は準備中です。",
  };
}

export default async function PostPage({ params }: PostPageProps) {
  // 構造のみ: 記事は表示しない（常に notFound または準備中）
  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumb
        items={[
          { label: "記事一覧", href: "/posts" },
          { label: "記事", href: `/posts/${params.slug}` },
        ]}
        className="mb-6"
      />
      <div className="max-w-3xl mx-auto text-center py-16 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
        <h1 className="text-2xl font-semibold mb-4">記事を準備中です</h1>
        <p className="text-muted-foreground mb-8">
          しばらくお待ちください。
        </p>
        <Button asChild variant="outline">
          <Link href="/posts">記事一覧へ</Link>
        </Button>
      </div>
    </div>
  );
}
