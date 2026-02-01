"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  distance?: number
}

/**
 * 単一要素用のFade Upアニメーション
 * 画面内に入ったら、opacity: 0 -> 1 かつ y: distance -> 0px へ変化
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  className,
  distance = 20,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // easeOut (高級感のある動き)
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  duration?: number
  distance?: number
}

/**
 * カードグリッドやリスト用のStaggerアニメーションコンテナ
 * 子要素が順番に（0.1sずつずれて）表示される
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  duration = 0.6,
  distance = 20,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

/**
 * StaggerContainer内で使用する子要素用のラッパー
 */
interface StaggerItemProps {
  children: ReactNode
  distance?: number
  duration?: number
}

export function StaggerItem({
  children,
  distance = 20,
  duration = 0.6,
}: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            ease: [0.16, 1, 0.3, 1], // easeOut
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
