"use client"

import { PostCardList } from "@/components/post-card-list";
import { FadeIn } from "@/components/anim/fade-in";
import { FadeInHeading } from "@/components/anim/fade-in-heading";
import { Post } from "@/lib/posts";

interface PostsPageClientProps {
  posts: Post[];
}

export function PostsPageClient({ posts }: PostsPageClientProps) {
  return (
    <>
      <FadeInHeading as="h1" className="text-4xl font-bold mb-4">
        IELTS対策・ビジネス英語の記事一覧
      </FadeInHeading>
      <FadeIn delay={0.1}>
        <p className="text-muted-foreground mb-8">
          {posts.length > 0 ? `${posts.length}件の記事から、IELTS対策、ビジネス英語、外資系コンサルで役立つ内容をピックアップしています。` : '記事を読み込んでいます...'}
        </p>
      </FadeIn>
      
      {posts.length === 0 ? (
        <FadeIn>
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              まだ記事がインポートされていません。
            </p>
            <p className="text-sm text-muted-foreground">
              ローカル環境で `pnpm run import:note` を実行してください。
            </p>
          </div>
        </FadeIn>
      ) : (
        <PostCardList 
          posts={posts}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        />
      )}
    </>
  );
}
