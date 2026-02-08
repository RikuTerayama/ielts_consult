import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import crypto from 'crypto';

/**
 * プロジェクト内の不要ファイルと重複記事を分析するスクリプト
 */

interface ArticleInfo {
  slug: string;
  filePath: string;
  title: string;
  contentHash: string;
  fileSize: number;
  imageRefs: string[];
  isInPublicSet: boolean;
  isInPaidSet: boolean;
}

interface ImageInfo {
  path: string;
  size: number;
  referencedBy: string[];
}

interface DuplicateArticle {
  title: string;
  articles: ArticleInfo[];
}

interface UnusedImage {
  path: string;
  size: number;
}

// 設定ファイルから公開記事と有料記事のセットを取得（構造のみモードでは空）
async function getConfigSets(): Promise<{ PUBLIC_POST_SET: Set<string>; PAID_POST_SLUG_SET: Set<string> }> {
  return { PUBLIC_POST_SET: new Set<string>(), PAID_POST_SLUG_SET: new Set<string>() };
}

// HTMLファイルから記事情報を抽出
function extractArticleInfo(slug: string, filePath: string, publicSet: Set<string>, paidSet: Set<string>): ArticleInfo | null {
  try {
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // タイトルを抽出
    const titleElement = document.querySelector('title') || document.querySelector('h1');
    const title = titleElement?.textContent?.trim() || '';
    
    // コンテンツのハッシュを計算（重複検出用）
    const bodyContent = document.body?.innerHTML || '';
    const contentHash = crypto.createHash('md5').update(bodyContent).digest('hex');
    
    // 画像参照を抽出
    const images = document.querySelectorAll('img');
    const imageRefs: string[] = [];
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        // assets/ または /assets/ から始まる画像パスを正規化
        let normalizedPath = src.replace(/^\/+/, ''); // 先頭のスラッシュを削除
        if (normalizedPath.startsWith('assets/')) {
          normalizedPath = normalizedPath.replace('assets/', '');
        }
        imageRefs.push(normalizedPath);
      }
    });
    
    const stats = fs.statSync(filePath);
    
    return {
      slug,
      filePath,
      title,
      contentHash,
      fileSize: stats.size,
      imageRefs,
      isInPublicSet: publicSet.has(slug),
      isInPaidSet: paidSet.has(slug),
    };
  } catch (error) {
    console.error(`エラー: ${filePath} の読み込みに失敗しました:`, error);
    return null;
  }
}

// 画像ファイルの情報を収集
function collectImageInfo(articles: ArticleInfo[]): Map<string, ImageInfo> {
  const imageMap = new Map<string, ImageInfo>();
  
  // assets/ と public/assets/ の両方をチェック
  const imageDirs = [
    path.join(process.cwd(), 'assets'),
    path.join(process.cwd(), 'public', 'assets'),
  ];
  
  for (const imageDir of imageDirs) {
    if (!fs.existsSync(imageDir)) continue;
    
    const files = fs.readdirSync(imageDir);
    for (const file of files) {
      if (!file.endsWith('.png') && !file.endsWith('.jpg') && !file.endsWith('.jpeg')) continue;
      
      const imagePath = path.join(imageDir, file);
      const stats = fs.statSync(imagePath);
      const relativePath = path.relative(process.cwd(), imagePath);
      
      // どの記事から参照されているか確認
      const referencedBy: string[] = [];
      for (const article of articles) {
        // ファイル名（拡張子なし）でマッチング
        const fileNameWithoutExt = file.replace(/\.(png|jpg|jpeg)$/i, '');
        if (article.imageRefs.some(ref => ref.includes(fileNameWithoutExt))) {
          referencedBy.push(article.slug);
        }
      }
      
      imageMap.set(relativePath, {
        path: relativePath,
        size: stats.size,
        referencedBy,
      });
    }
  }
  
  return imageMap;
}

// 重複記事を検出
function findDuplicateArticles(articles: ArticleInfo[]): DuplicateArticle[] {
  const titleMap = new Map<string, ArticleInfo[]>();
  const contentHashMap = new Map<string, ArticleInfo[]>();
  
  // タイトルでグループ化
  for (const article of articles) {
    if (!titleMap.has(article.title)) {
      titleMap.set(article.title, []);
    }
    titleMap.get(article.title)!.push(article);
  }
  
  // コンテンツハッシュでグループ化
  for (const article of articles) {
    if (!contentHashMap.has(article.contentHash)) {
      contentHashMap.set(article.contentHash, []);
    }
    contentHashMap.get(article.contentHash)!.push(article);
  }
  
  const duplicates: DuplicateArticle[] = [];
  
  // 同じタイトルで複数ある記事
  for (const [title, articleList] of titleMap.entries()) {
    if (articleList.length > 1 && title) {
      duplicates.push({
        title,
        articles: articleList,
      });
    }
  }
  
  // 同じコンテンツハッシュで複数ある記事（タイトルが異なる場合も含む）
  for (const [hash, articleList] of contentHashMap.entries()) {
    if (articleList.length > 1) {
      // タイトルベースの重複と重複しない場合のみ追加
      const titles = articleList.map(a => a.title);
      const uniqueTitles = new Set(titles);
      if (uniqueTitles.size > 1 || !titleMap.has(articleList[0].title)) {
        duplicates.push({
          title: `[コンテンツ重複] ${articleList[0].title}`,
          articles: articleList,
        });
      }
    }
  }
  
  return duplicates;
}

// 未使用の記事を検出
function findUnusedArticles(articles: ArticleInfo[]): ArticleInfo[] {
  return articles.filter(article => {
    // 公開セットにも有料セットにも含まれていない記事
    return !article.isInPublicSet && !article.isInPaidSet;
  });
}

// 未使用の画像を検出
function findUnusedImages(imageMap: Map<string, ImageInfo>): UnusedImage[] {
  const unused: UnusedImage[] = [];
  
  for (const [path, info] of imageMap.entries()) {
    if (info.referencedBy.length === 0) {
      unused.push({
        path,
        size: info.size,
      });
    }
  }
  
  return unused.sort((a, b) => b.size - a.size);
}

// スクリプトファイルの使用状況を確認
function analyzeScripts(): { used: string[]; potentiallyUnused: string[] } {
  const scriptsDir = path.join(process.cwd(), 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    return { used: [], potentiallyUnused: [] };
  }
  
  const scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.ts') || f.endsWith('.sh'));
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  let packageJson: any = {};
  if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  }
  
  const scriptsInPackage = new Set<string>();
  if (packageJson.scripts) {
    for (const script of Object.values(packageJson.scripts) as string[]) {
      // スクリプト内で参照されているファイルを抽出
      const matches = script.match(/scripts\/([^\s"']+)/g);
      if (matches) {
        matches.forEach(m => {
          const scriptName = m.replace('scripts/', '');
          scriptsInPackage.add(scriptName);
        });
      }
    }
  }
  
  const used: string[] = [];
  const potentiallyUnused: string[] = [];
  
  for (const scriptFile of scriptFiles) {
    if (scriptsInPackage.has(scriptFile)) {
      used.push(scriptFile);
    } else {
      potentiallyUnused.push(scriptFile);
    }
  }
  
  return { used, potentiallyUnused };
}

// メイン処理
async function main() {
  console.log('🔍 プロジェクト内の不要ファイルと重複記事を分析しています...\n');
  
  const { PUBLIC_POST_SET, PAID_POST_SLUG_SET } = await getConfigSets();
  
  // HTML記事ファイルを収集
  const htmlFiles = fs.readdirSync(process.cwd())
    .filter(file => file.startsWith('n') && file.endsWith('.html'));
  
  console.log(`📄 記事ファイル数: ${htmlFiles.length}件\n`);
  
  // 記事情報を抽出
  const articles: ArticleInfo[] = [];
  for (const file of htmlFiles) {
    const slug = file.replace('.html', '');
    const filePath = path.join(process.cwd(), file);
    const info = extractArticleInfo(slug, filePath, PUBLIC_POST_SET, PAID_POST_SLUG_SET);
    if (info) {
      articles.push(info);
    }
  }
  
  // 画像情報を収集
  const imageMap = collectImageInfo(articles);
  
  // 重複記事を検出
  const duplicates = findDuplicateArticles(articles);
  
  // 未使用記事を検出
  const unusedArticles = findUnusedArticles(articles);
  
  // 未使用画像を検出
  const unusedImages = findUnusedImages(imageMap);
  
  // スクリプト分析
  const scriptAnalysis = analyzeScripts();
  
  // レポートを生成
  const report: string[] = [];
  report.push('# 📋 プロジェクト整理レポート');
  report.push('');
  report.push(`生成日時: ${new Date().toLocaleString('ja-JP')}`);
  report.push('');
  report.push('## 📊 サマリー');
  report.push('');
  report.push(`- **総記事数**: ${articles.length}件`);
  report.push(`- **公開記事数**: ${articles.filter(a => a.isInPublicSet).length}件`);
  report.push(`- **有料記事数**: ${articles.filter(a => a.isInPaidSet).length}件`);
  report.push(`- **未使用記事数**: ${unusedArticles.length}件`);
  report.push(`- **重複記事グループ数**: ${duplicates.length}グループ`);
  report.push(`- **総画像数**: ${imageMap.size}件`);
  report.push(`- **未使用画像数**: ${unusedImages.length}件`);
  report.push(`- **未使用画像の合計サイズ**: ${(unusedImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024).toFixed(2)} MB`);
  report.push('');
  
  // 重複記事の詳細
  if (duplicates.length > 0) {
    report.push('## 🔄 重複記事');
    report.push('');
    for (let i = 0; i < duplicates.length; i++) {
      const dup = duplicates[i];
      report.push(`### ${i + 1}. ${dup.title}`);
      report.push('');
      report.push(`**重複数**: ${dup.articles.length}件`);
      report.push('');
      report.push('| スラッグ | ファイルサイズ | 公開設定 | 有料設定 |');
      report.push('|---------|--------------|---------|---------|');
      for (const article of dup.articles) {
        report.push(`| \`${article.slug}\` | ${(article.fileSize / 1024).toFixed(2)} KB | ${article.isInPublicSet ? '✅' : '❌'} | ${article.isInPaidSet ? '✅' : '❌'} |`);
      }
      report.push('');
    }
  } else {
    report.push('## 🔄 重複記事');
    report.push('');
    report.push('重複記事は見つかりませんでした。');
    report.push('');
  }
  
  // 未使用記事の詳細
  if (unusedArticles.length > 0) {
    report.push('## 🗑️ 未使用記事（公開セットにも有料セットにも含まれていない）');
    report.push('');
    report.push(`**合計**: ${unusedArticles.length}件`);
    report.push(`**合計サイズ**: ${(unusedArticles.reduce((sum, a) => sum + a.fileSize, 0) / 1024 / 1024).toFixed(2)} MB`);
    report.push('');
    report.push('| スラッグ | タイトル | ファイルサイズ |');
    report.push('|---------|---------|--------------|');
    for (const article of unusedArticles.sort((a, b) => b.fileSize - a.fileSize)) {
      const title = article.title || '(タイトルなし)';
      report.push(`| \`${article.slug}\` | ${title.substring(0, 50)}${title.length > 50 ? '...' : ''} | ${(article.fileSize / 1024).toFixed(2)} KB |`);
    }
    report.push('');
  } else {
    report.push('## 🗑️ 未使用記事');
    report.push('');
    report.push('未使用記事は見つかりませんでした。');
    report.push('');
  }
  
  // 未使用画像の詳細（上位50件）
  if (unusedImages.length > 0) {
    report.push('## 🖼️ 未使用画像');
    report.push('');
    report.push(`**合計**: ${unusedImages.length}件`);
    report.push(`**合計サイズ**: ${(unusedImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024).toFixed(2)} MB`);
    report.push('');
    report.push('### 上位50件（サイズ順）');
    report.push('');
    report.push('| パス | サイズ |');
    report.push('|------|--------|');
    for (const img of unusedImages.slice(0, 50)) {
      report.push(`| \`${img.path}\` | ${(img.size / 1024).toFixed(2)} KB |`);
    }
    if (unusedImages.length > 50) {
      report.push('');
      report.push(`*他 ${unusedImages.length - 50}件の未使用画像があります*`);
    }
    report.push('');
  } else {
    report.push('## 🖼️ 未使用画像');
    report.push('');
    report.push('未使用画像は見つかりませんでした。');
    report.push('');
  }
  
  // スクリプト分析
  report.push('## 📜 スクリプトファイル分析');
  report.push('');
  report.push(`**使用中**: ${scriptAnalysis.used.length}件`);
  if (scriptAnalysis.used.length > 0) {
    report.push('');
    report.push('### 使用中のスクリプト');
    report.push('');
    for (const script of scriptAnalysis.used) {
      report.push(`- \`scripts/${script}\``);
    }
    report.push('');
  }
  report.push(`**未使用の可能性**: ${scriptAnalysis.potentiallyUnused.length}件`);
  if (scriptAnalysis.potentiallyUnused.length > 0) {
    report.push('');
    report.push('### 未使用の可能性があるスクリプト');
    report.push('');
    for (const script of scriptAnalysis.potentiallyUnused) {
      report.push(`- \`scripts/${script}\``);
    }
    report.push('');
  }
  
  // レポートをファイルに保存
  const reportPath = path.join(process.cwd(), 'プロジェクト整理レポート.md');
  fs.writeFileSync(reportPath, report.join('\n'), 'utf8');
  
  console.log('✅ レポートを生成しました: プロジェクト整理レポート.md');
  console.log('');
  console.log('📊 サマリー:');
  console.log(`  - 総記事数: ${articles.length}件`);
  console.log(`  - 未使用記事: ${unusedArticles.length}件`);
  console.log(`  - 重複記事グループ: ${duplicates.length}グループ`);
  console.log(`  - 未使用画像: ${unusedImages.length}件 (${(unusedImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  - 未使用スクリプト: ${scriptAnalysis.potentiallyUnused.length}件`);
}

main().catch(console.error);
