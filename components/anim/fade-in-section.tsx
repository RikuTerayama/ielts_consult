"use client"

import { FadeIn } from "./fade-in";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * セクション全体をラップするFadeInコンポーネント
 */
export function FadeInSection({
  children,
  className,
  delay = 0,
}: FadeInSectionProps) {
  return (
    <FadeIn delay={delay} className={cn(className)}>
      {children}
    </FadeIn>
  );
}
