"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/post-card";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);

  useEffect(() => {
    // クライアントサイドで記事データを取得
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setFilteredPosts(data);
      })
      .catch((err) => console.error("Failed to load posts:", err));
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredPosts(posts);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.description.toLowerCase().includes(lowerQuery) ||
        post.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)) ||
        post.content.toLowerCase().includes(lowerQuery)
    );
    setFilteredPosts(results);
  }, [query, posts]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">記事検索</h1>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="記事を検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 text-lg h-12"
          />
        </div>
      </div>

      <div className="mb-4 text-muted-foreground">
        {filteredPosts.length}件の記事が見つかりました
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
