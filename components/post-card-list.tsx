"use client"

import { PostCard } from "@/components/post-card";
import { StaggerContainer, StaggerItem } from "@/components/anim/fade-in";
import { Post } from "@/lib/posts";

interface PostCardListProps {
  posts: Post[];
  className?: string;
}

/**
 * 記事カードリスト（Staggerアニメーション付き）
 */
export function PostCardList({ posts, className }: PostCardListProps) {
  return (
    <StaggerContainer className={className}>
      {posts.map((post) => (
        <StaggerItem key={post.slug}>
          <PostCard post={post} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
