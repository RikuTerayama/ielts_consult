import fs from 'fs-extra';
import path from 'path';

const OPTIMIZED_DIR = path.join(process.cwd(), 'public/assets/optimized');
const BLUR_DATA_URLS_PATH = path.join(OPTIMIZED_DIR, 'blur-data-urls.json');

interface OptimizedImageInfo {
  src: string;
  blurDataURL: string;
  sizes: string;
  alt: string;
}

let blurDataURLs: Record<string, string> = {};

// ぼかしデータURLを読み込み
async function loadBlurDataURLs() {
  try {
    if (await fs.pathExists(BLUR_DATA_URLS_PATH)) {
      blurDataURLs = await fs.readJson(BLUR_DATA_URLS_PATH);
    }
  } catch (error) {
    console.warn('ぼかしデータURLの読み込みに失敗しました:', error);
  }
}

// 画像パスから最適化された画像情報を生成
export function getOptimizedImageInfo(
  originalSrc: string,
  alt: string = ''
): OptimizedImageInfo {
  // 元の画像ファイル名を取得
  const fileName = path.basename(originalSrc, path.extname(originalSrc));
  
  // 最適化された画像のパスを生成
  const optimizedSrc = originalSrc.replace('/assets/', '/assets/optimized/').replace(/\.(png|jpg|jpeg)$/i, '.webp');
  
  // ぼかしデータURLを取得
  const blurDataURL = blurDataURLs[fileName] || '';
  
  // レスポンシブ画像のsizes属性を生成
  const sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  
  return {
    src: optimizedSrc,
    blurDataURL,
    sizes,
    alt
  };
}

// 複数サイズの画像ソースセットを生成
export function getImageSrcSet(originalSrc: string): string {
  const fileName = path.basename(originalSrc, path.extname(originalSrc));
  const basePath = originalSrc.replace('/assets/', '/assets/optimized/').replace(/\.(png|jpg|jpeg)$/i, '');
  
  const sizes = [
    { width: 400, suffix: '-sm' },
    { width: 800, suffix: '-md' },
    { width: 1200, suffix: '-lg' },
    { width: 1600, suffix: '-xl' }
  ];
  
  return sizes
    .map(size => `${basePath}${size.suffix}.webp ${size.width}w`)
    .join(', ');
}

// 画像の存在確認
export async function imageExists(src: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), 'public', src);
    return await fs.pathExists(fullPath);
  } catch {
    return false;
  }
}

// 初期化時にぼかしデータURLを読み込み
loadBlurDataURLs();
