import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface TrainingAppCTAProps {
  variant?: "default" | "sidebar";
  className?: string;
}

export function TrainingAppCTA({ variant = "default", className }: TrainingAppCTAProps) {
  const appUrl = "https://ielts-training.onrender.com/home";
  
  if (variant === "sidebar") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">🎯 IELTSトレーニング</CardTitle>
          <CardDescription>
            実践的なIELTS学習アプリでスコアアップ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" size="sm">
            <a 
              href={appUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              アプリを開く
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
        <CardTitle className="text-2xl">🎯 IELTSトレーニングアプリ</CardTitle>
        <CardDescription className="text-base">
          実践的なIELTS学習アプリで効率的にスコアアップ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>IELTS学習に特化した実践的なトレーニング</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>すぐに始められる学習環境</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>効率的なスコアアップをサポート</span>
          </li>
        </ul>
        <Button asChild size="lg" className="w-full">
          <a 
            href={appUrl} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            IELTSトレーニングアプリを始める
            <ExternalLink className="ml-2 h-5 w-5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

