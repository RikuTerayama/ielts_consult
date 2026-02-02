import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

/**
 * noteへの誘導CTAが含まれる記事を分析し、レポートを生成するスクリプト
 */
interface ArticleInfo {
  slug: string;
  title: string;
  filePath: string;
  fileSize: number;
  noteUrl: string;
  imageFiles: string[];
  hasNoteCTA: boolean;
}

function extractNoteUrl(htmlContent: string): string {
  const match = htmlContent.match(/https:\/\/note\.com\/ielts_consult\/n\/([a-z0-9]+)/);
  return match ? match[0] : '';
}

function extractTitle(htmlContent: string): string {
  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/);
  if (h1Match) {
    return h1Match[1].replace(/<[^>]*>/g, '').trim();
  }
  
  return '';
}

function findRelatedImages(slug: string, htmlContent: string): string[] {
  const imageFiles: string[] = [];
  
  // HTML内の画像パスを抽出
  const imgMatches = htmlContent.matchAll(/src=["']([^"']+)["']/g);
  for (const match of imgMatches) {
    const imgPath = match[1];
    // assets/配下の画像で、この記事のslugを含むものを抽出
    if (imgPath.includes('assets/') && imgPath.includes(slug)) {
      const fileName = path.basename(imgPath);
      if (!imageFiles.includes(fileName)) {
        imageFiles.push(fileName);
      }
    }
  }
  
  // assetsディレクトリから該当する画像ファイルを検索
  const assetsDir = path.join(process.cwd(), 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const relatedImages = files.filter(file => file.includes(slug));
    relatedImages.forEach(img => {
      if (!imageFiles.includes(img)) {
        imageFiles.push(img);
      }
    });
  }
  
  // public/assetsディレクトリからも検索
  const publicAssetsDir = path.join(process.cwd(), 'public', 'assets');
  if (fs.existsSync(publicAssetsDir)) {
    const files = fs.readdirSync(publicAssetsDir);
    const relatedImages = files.filter(file => file.includes(slug));
    relatedImages.forEach(img => {
      if (!imageFiles.includes(img)) {
        imageFiles.push(img);
      }
    });
  }
  
  return imageFiles;
}

function hasNoteCTA(htmlContent: string): boolean {
  // 特定のCTAセクションを含む記事のみを対象とする
  // 「📚 続きはnoteで公開中！」という見出しと
  // 「この記事の続きは、より詳しい解説と実践的なテクニックを含めてnoteで公開しています。」という文章の両方を含む必要がある
  const hasHeading = htmlContent.includes('📚 続きはnoteで公開中！') || 
                     htmlContent.includes('続きはnoteで公開中！');
  const hasDescription = htmlContent.includes('この記事の続きは、より詳しい解説と実践的なテクニックを含めてnoteで公開しています。');
  
  // 両方の条件を満たす場合のみtrueを返す
  return hasHeading && hasDescription;
}

function main() {
  const projectRoot = process.cwd();
  const files = fs.readdirSync(projectRoot);
  
  // 「n で始まり .html で終わる」ファイルを抽出
  const htmlFiles = files.filter(file => 
    file.startsWith('n') && file.endsWith('.html')
  );

  console.log('📊 noteへの誘導CTAが含まれる記事を分析中...\n');

  const articles: ArticleInfo[] = [];

  for (const file of htmlFiles) {
    const filePath = path.join(projectRoot, file);
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    if (!hasNoteCTA(htmlContent)) {
      continue;
    }
    
    const slug = file.replace('.html', '');
    const title = extractTitle(htmlContent);
    const noteUrl = extractNoteUrl(htmlContent);
    const fileSize = fs.statSync(filePath).size;
    const imageFiles = findRelatedImages(slug, htmlContent);
    
    articles.push({
      slug,
      title,
      filePath: file,
      fileSize,
      noteUrl,
      imageFiles,
      hasNoteCTA: true,
    });
  }

  // レポートを生成
  const reportPath = path.join(projectRoot, 'NOTE_CTA_削除対象レポート.md');
  let report = '# 📋 noteへの誘導CTA削除対象記事レポート\n\n';
  report += `生成日時: ${new Date().toLocaleString('ja-JP')}\n\n`;
  report += `## 📊 サマリー\n\n`;
  report += `- **対象記事数**: ${articles.length}件\n`;
  
  const totalSize = articles.reduce((sum, article) => sum + article.fileSize, 0);
  report += `- **合計ファイルサイズ**: ${(totalSize / 1024).toFixed(2)} KB\n\n`;
  
  report += `## 📝 削除対象記事一覧\n\n`;
  report += `| # | スラッグ | タイトル | ファイルサイズ | note URL | 関連画像数 |\n`;
  report += `|---|---|---|---:|---:|---:|\n`;
  
  articles.forEach((article, index) => {
    const sizeKB = (article.fileSize / 1024).toFixed(2);
    const imageCount = article.imageFiles.length;
    report += `| ${index + 1} | \`${article.slug}\` | ${article.title.substring(0, 50)}${article.title.length > 50 ? '...' : ''} | ${sizeKB} KB | [link](${article.noteUrl}) | ${imageCount} |\n`;
  });
  
  report += `\n## 🗑️ 削除対象ファイル詳細\n\n`;
  
  articles.forEach((article, index) => {
    report += `### ${index + 1}. ${article.title}\n\n`;
    report += `- **スラッグ**: \`${article.slug}\`\n`;
    report += `- **HTMLファイル**: \`${article.filePath}\`\n`;
    report += `- **ファイルサイズ**: ${(article.fileSize / 1024).toFixed(2)} KB\n`;
    report += `- **note URL**: ${article.noteUrl}\n`;
    
    if (article.imageFiles.length > 0) {
      report += `- **関連画像ファイル** (${article.imageFiles.length}件):\n`;
      article.imageFiles.forEach(img => {
        report += `  - \`assets/${img}\`\n`;
        report += `  - \`public/assets/${img}\` (存在確認が必要)\n`;
      });
    } else {
      report += `- **関連画像ファイル**: なし\n`;
    }
    
    report += `\n`;
  });
  
  report += `## 📦 削除対象ファイル一覧\n\n`;
  report += `### HTMLファイル (${articles.length}件)\n\n`;
  articles.forEach(article => {
    report += `- \`${article.filePath}\`\n`;
  });
  
  report += `\n### 画像ファイル\n\n`;
  const allImages = new Set<string>();
  articles.forEach(article => {
    article.imageFiles.forEach(img => allImages.add(img));
  });
  
  if (allImages.size > 0) {
    allImages.forEach(img => {
      report += `- \`assets/${img}\`\n`;
      report += `- \`public/assets/${img}\` (存在確認が必要)\n`;
    });
  } else {
    report += `関連画像ファイルは見つかりませんでした。\n`;
  }
  
  report += `\n## ⚠️ 注意事項\n\n`;
  report += `1. **バックアップ**: 削除前に必ずバックアップを取得してください。\n`;
  report += `2. **画像ファイル**: \`assets/\` と \`public/assets/\` の両方を確認してください。\n`;
  report += `3. **依存関係**: 他の記事やコンポーネントから参照されていないか確認してください。\n`;
  report += `4. **Git履歴**: 削除後もGit履歴から復元可能です。\n`;
  
  report += `\n## 🔧 削除スクリプトの実行方法\n\n`;
  report += `以下のコマンドで削除スクリプトを実行できます：\n\n`;
  report += `\`\`\`bash\n`;
  report += `# 削除前にバックアップを推奨\n`;
  report += `git add .\n`;
  report += `git commit -m "Backup before removing note CTA articles"\n\n`;
  report += `# 削除スクリプトの実行（今後作成予定）\n`;
  report += `tsx scripts/remove-note-cta-articles.ts\n`;
  report += `\`\`\`\n`;
  
  fs.writeFileSync(reportPath, report, 'utf8');
  
  console.log('✅ レポートを生成しました:', reportPath);
  console.log(`\n📊 分析結果:`);
  console.log(`   - 対象記事数: ${articles.length}件`);
  console.log(`   - 合計ファイルサイズ: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`   - 関連画像ファイル数: ${new Set(articles.flatMap(a => a.imageFiles)).size}件`);
}

main();
