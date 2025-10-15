import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';

const ASSETS_DIR = path.join(process.cwd(), 'public/assets');
const OPTIMIZED_DIR = path.join(process.cwd(), 'public/assets/optimized');

interface ImageOptimizationOptions {
  quality: number;
  width?: number;
  height?: number;
}

async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: ImageOptimizationOptions
) {
  try {
    const { quality, width, height } = options;
    
    let pipeline = sharp(inputPath);
    
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    await pipeline
      .webp({ quality })
      .toFile(outputPath);
    
    console.log(`✅ Optimized: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error);
  }
}

async function generateBlurDataURL(inputPath: string): Promise<string> {
  try {
    const buffer = await sharp(inputPath)
      .resize(10, 10, { fit: 'cover' })
      .jpeg({ quality: 20 })
      .toBuffer();
    
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error(`❌ Error generating blur data URL for ${inputPath}:`, error);
    return '';
  }
}

async function optimizeImages() {
  console.log('🖼️ 画像最適化を開始します...');
  
  // 最適化ディレクトリを作成
  await fs.ensureDir(OPTIMIZED_DIR);
  
  // アセットディレクトリの存在確認
  if (!await fs.pathExists(ASSETS_DIR)) {
    console.log('❌ アセットディレクトリが見つかりません:', ASSETS_DIR);
    return;
  }
  
  const files = await fs.readdir(ASSETS_DIR);
  const imageFiles = files.filter(file => 
    /\.(png|jpg|jpeg)$/i.test(file)
  );
  
  if (imageFiles.length === 0) {
    console.log('📁 最適化対象の画像が見つかりません');
    return;
  }
  
  console.log(`📊 ${imageFiles.length}個の画像を最適化します`);
  
  const blurDataURLs: Record<string, string> = {};
  
  for (const file of imageFiles) {
    const inputPath = path.join(ASSETS_DIR, file);
    const baseName = path.parse(file).name;
    
    // 元の画像サイズを取得
    const metadata = await sharp(inputPath).metadata();
    const { width = 0, height = 0 } = metadata;
    
    // 複数サイズの最適化
    const sizes = [
      { width: 400, suffix: '-sm' },
      { width: 800, suffix: '-md' },
      { width: 1200, suffix: '-lg' },
      { width: width > 1200 ? width : undefined, suffix: '-xl' }
    ].filter(size => size.width);
    
    for (const size of sizes) {
      const outputPath = path.join(
        OPTIMIZED_DIR, 
        `${baseName}${size.suffix}.webp`
      );
      
      await optimizeImage(inputPath, outputPath, {
        quality: 80,
        width: size.width
      });
    }
    
    // ぼかしデータURLを生成（最初のサイズのみ）
    if (!blurDataURLs[baseName]) {
      blurDataURLs[baseName] = await generateBlurDataURL(inputPath);
    }
  }
  
  // ぼかしデータURLをJSONファイルに保存
  const blurDataPath = path.join(OPTIMIZED_DIR, 'blur-data-urls.json');
  await fs.writeJson(blurDataPath, blurDataURLs, { spaces: 2 });
  
  console.log('🎉 画像最適化が完了しました！');
  console.log(`📁 最適化された画像: ${OPTIMIZED_DIR}`);
  console.log(`📄 ぼかしデータURL: ${blurDataPath}`);
}

// スクリプトが直接実行された場合
if (require.main === module) {
  optimizeImages().catch(console.error);
}

export { optimizeImages, generateBlurDataURL };
