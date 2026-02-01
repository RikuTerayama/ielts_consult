"use client"

import { FadeIn } from "./fade-in";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInHeadingProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

/**
 * 見出し用のFadeInラッパー
 */
export function FadeInHeading({
  children,
  className,
  delay = 0,
  as: Component = "h2",
}: FadeInHeadingProps) {
  return (
    <FadeIn delay={delay}>
      <Component className={cn(className)}>{children}</Component>
    </FadeIn>
  );
}
