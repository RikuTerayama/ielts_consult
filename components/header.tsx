"use client"

import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">
              <span className="block sm:hidden">外資系コンサルの</span>
              <span className="block sm:hidden">英語力底上げブログ</span>
              <span className="hidden sm:block">外資系コンサルの英語力底上げブログ</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">
              <Search className="h-5 w-5" />
              <span className="sr-only">検索</span>
            </Link>
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              ホーム
            </Link>
            <Link href="/posts" className="text-sm font-medium hover:text-primary transition-colors">
              記事一覧
            </Link>
            <Link href="/tags" className="text-sm font-medium hover:text-primary transition-colors">
              タグ
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <a 
              href="https://ielts-training.onrender.com/home" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              🎯 トレーニングアプリ
            </a>
            <ThemeToggle />
          </nav>

          <div className="flex md:hidden items-center space-x-2">
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">検索</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="メニュー"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-4">
            <Link
              href="/search"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              検索
            </Link>
            <Link
              href="/"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
            <Link
              href="/posts"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              記事一覧
            </Link>
            <Link
              href="/tags"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              タグ
            </Link>
            <Link
              href="/about"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <a
              href="https://ielts-training.onrender.com/home"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              🎯 トレーニングアプリ
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}

