import * as fs from 'fs';
import * as path from 'path';

/**
 * noteへの誘導CTAが含まれる記事とその関連画像を削除するスクリプト
 */

// 削除対象の記事スラッグリスト（レポートから抽出）
const TARGET_SLUGS = [
  'n019aaecea296',
  'n15d8a98fb855',
  'n17e52d8f3cbe',
  'n2cd779121111',
  'n3200065ec76b',
  'n380e29ddc2c0',
  'n535bf33165ca',
  'n5e563cd04240',
  'n70a885fec234',
  'n73ea63a15482',
  'n92beae39fd80',
  'n963baa68fcd3',
  'n9883aa545907',
  'n997645629932',
  'n9a303ab21106',
  'ne68beb472a95',
  'ne9d8203dd045',
  'nee44497523d9',
  'nfabbeb0a262c',
  'nfd0f297ac1d6',
  'nfd42ac687984',
];

function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ エラー: ${filePath} の削除に失敗しました:`, error);
    return false;
  }
}

function findAndDeleteImages(slug: string): number {
  let deletedCount = 0;
  
  // assetsディレクトリから該当する画像ファイルを検索・削除
  const assetsDir = path.join(process.cwd(), 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const relatedImages = files.filter(file => file.includes(slug));
    relatedImages.forEach(img => {
      const imgPath = path.join(assetsDir, img);
      if (deleteFile(imgPath)) {
        deletedCount++;
        console.log(`  ✅ 削除: assets/${img}`);
      }
    });
  }
  
  // public/assetsディレクトリからも検索・削除
  const publicAssetsDir = path.join(process.cwd(), 'public', 'assets');
  if (fs.existsSync(publicAssetsDir)) {
    const files = fs.readdirSync(publicAssetsDir);
    const relatedImages = files.filter(file => file.includes(slug));
    relatedImages.forEach(img => {
      const imgPath = path.join(publicAssetsDir, img);
      if (deleteFile(imgPath)) {
        deletedCount++;
        console.log(`  ✅ 削除: public/assets/${img}`);
      }
    });
  }
  
  return deletedCount;
}

function main() {
  const projectRoot = process.cwd();
  
  console.log('🗑️  noteへの誘導CTAが含まれる記事と画像を削除します...\n');
  console.log(`対象記事数: ${TARGET_SLUGS.length}件\n`);
  
  let deletedHtmlCount = 0;
  let deletedImageCount = 0;
  const failedSlugs: string[] = [];
  
  for (const slug of TARGET_SLUGS) {
    console.log(`\n📄 処理中: ${slug}`);
    
    // HTMLファイルを削除
    const htmlPath = path.join(projectRoot, `${slug}.html`);
    if (deleteFile(htmlPath)) {
      deletedHtmlCount++;
      console.log(`  ✅ 削除: ${slug}.html`);
    } else {
      console.log(`  ⚠️  ファイルが見つかりません: ${slug}.html`);
      failedSlugs.push(slug);
    }
    
    // 関連画像を削除
    const imageCount = findAndDeleteImages(slug);
    deletedImageCount += imageCount;
    
    if (imageCount === 0) {
      console.log(`  ℹ️  関連画像は見つかりませんでした`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 削除結果サマリー');
  console.log('='.repeat(60));
  console.log(`✅ 削除されたHTMLファイル: ${deletedHtmlCount}件`);
  console.log(`✅ 削除された画像ファイル: ${deletedImageCount}件`);
  
  if (failedSlugs.length > 0) {
    console.log(`\n⚠️  削除に失敗した記事:`);
    failedSlugs.forEach(slug => console.log(`  - ${slug}`));
  }
  
  console.log('\n✅ 削除処理が完了しました！');
}

main();
