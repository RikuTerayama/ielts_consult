"use client"

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { TRAINING_APP_URL, NOTE_URL } from "@/config/links";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-semibold tracking-tight">
              <span className="block sm:hidden">外資系コンサルの</span>
              <span className="block sm:hidden">英語力底上げブログ</span>
              <span className="hidden sm:block">外資系コンサルの英語力底上げブログ</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-2 group"
            >
              ホーム
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/posts" 
              className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-2 group"
            >
              記事一覧
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/about" 
              className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-2 group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <a 
              href={TRAINING_APP_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-2 group"
            >
              🎯 トレーニングアプリ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a 
              href={NOTE_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="noteで記事を読む（外部サイト）"
              className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-colors py-2 group"
            >
              📝 Note
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <ThemeToggle />
          </nav>

          <div className="flex md:hidden items-center space-x-2">
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
              href="/about"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <a
              href={TRAINING_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              🎯 トレーニングアプリ
            </a>
            <a
              href={NOTE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="noteで記事を読む（外部サイト）"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              📝 Note
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}

