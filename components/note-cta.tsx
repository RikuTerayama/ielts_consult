import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface NoteCTAProps {
  variant?: "default" | "sidebar";
  className?: string;
}

export function NoteCTA({ variant = "default", className }: NoteCTAProps) {
  const noteUrl = "https://note.com/ielts_consult/m/m8830a309f830";
  
  if (variant === "sidebar") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">📚 完全ガイド</CardTitle>
          <CardDescription>
            IELTS 7.0を目指す社会人向けの決定版マガジン
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" size="sm">
            <a 
              href={noteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              noteで詳しく見る
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">💡 さらに深く学びたい方へ</CardTitle>
        <CardDescription className="text-base">
          独学でIELTS 7.0を目指す忙しい社会人向けの決定版マガジン
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>教材選び → セクション別対策 → 模試の回し方を一本化</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>実体験ベースの実践ノウハウを約16万字に凝縮</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>総合ガイド＋4技能をマガジンに集約／1日30分の時短設計</span>
          </li>
        </ul>
        <Button asChild size="lg" className="w-full">
          <a 
            href={noteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            noteでマガジンを見る
            <ExternalLink className="ml-2 h-5 w-5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

