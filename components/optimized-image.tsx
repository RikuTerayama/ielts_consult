"use client";

import Image from 'next/image';
import { useState } from 'react';
import { getOptimizedImageInfo, getImageSrcSet, imageExists } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt = '',
  width,
  height,
  className,
  priority = false,
  quality = 80,
  fill = false,
  sizes,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // 最適化された画像情報を取得
  const imageInfo = getOptimizedImageInfo(src, alt);
  
  // 最適化された画像が存在するかチェック
  const [optimizedExists, setOptimizedExists] = useState(true);
  
  useState(() => {
    imageExists(imageInfo.src).then(exists => {
      setOptimizedExists(exists);
    });
  });
  
  // エラーハンドリング
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  // エラー時は元の画像を表示
  if (hasError || !optimizedExists) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn('transition-opacity duration-300', className)}
        {...props}
      />
    );
  }
  
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* ローディング中のプレースホルダー */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* 最適化された画像 */}
      <Image
        src={imageInfo.src}
        alt={imageInfo.alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes || imageInfo.sizes}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        placeholder={imageInfo.blurDataURL ? 'blur' : 'empty'}
        blurDataURL={imageInfo.blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

// レスポンシブ画像用のコンポーネント
export function ResponsiveImage({
  src,
  alt = '',
  className,
  priority = false,
  quality = 80,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height' | 'fill'>) {
  const imageInfo = getOptimizedImageInfo(src, alt);
  const srcSet = getImageSrcSet(src);
  
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={cn('w-full h-auto', className)}
      priority={priority}
      quality={quality}
      sizes={imageInfo.sizes}
      {...props}
    />
  );
}
