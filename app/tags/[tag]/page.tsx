import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostsByTag } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

type TagPageProps = {
  params: { tag: string };
};

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ tag: string }>> {
  try {
    // 直接ファイルシステムにアクセスしてHTMLファイルからタグを抽出
    // getAllPosts()を呼び出すとPUBLIC_POST_SETのインポートでビルド時に問題が発生する可能性があるため
    const files = fs.readdirSync(process.cwd());
    const htmlFiles = files.filter((file) => file.startsWith('n') && file.endsWith('.html'));
    const tagSet = new Set<string>();

    for (const file of htmlFiles) {
      try {
        const filePath = path.join(process.cwd(), file);
        const content = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(content);
        const document = dom.window.document;
        
        // タイトルからタグを推定（既存のロジックと同様）
        const titleElement = document.querySelector('title') || document.querySelector('h1');
        const title = titleElement?.textContent?.trim() || '';
        
        // タグを推定
        if (title.includes('IELTS')) tagSet.add('IELTS');
        if (title.includes('ライティング') || title.includes('Writing')) tagSet.add('Writing');
        if (title.includes('スピーキング') || title.includes('Speaking')) tagSet.add('Speaking');
        if (title.includes('リーディング') || title.includes('Reading')) tagSet.add('Reading');
        if (title.includes('リスニング') || title.includes('Listening')) tagSet.add('Listening');
        if (title.includes('対策')) tagSet.add('対策');
        if (title.includes('表現')) tagSet.add('表現');
        if (title.includes('ガイド')) tagSet.add('ガイド');
      } catch {
        // 個別のファイルエラーは無視
        continue;
      }
    }

    return Array.from(tagSet).map((t) => ({ tag: encodeURIComponent(t) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `Tag: ${tag}`,
    description: `Posts tagged with ${tag}`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(tag);

  if (!posts || posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">{tag}</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
