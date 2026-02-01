import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

interface AuditResult {
  slug: string;
  title: string;
  wordCount: number;
  headingCount: number;
  internalLinkCount: number;
  hasAddition: boolean;
  isPublic: boolean;
  thinContentFlag: boolean;
  reasons: string[];
}

/**
 * AdSense審査準備状況を監査するスクリプト
 * 各記事の品質を評価し、公開候補を選定する
 */
async function main() {
  const projectRoot = process.cwd();
  const files = fs.readdirSync(projectRoot);
  
  // HTMLファイルを抽出
  const htmlFiles = files.filter(file => 
    file.startsWith('n') && file.endsWith('.html')
  );

  const additionsDir = path.join(projectRoot, 'content/additions');
  const hasAdditionsDir = fs.existsSync(additionsDir);

  console.log(`📊 監査を開始します...\n`);
  console.log(`対象ファイル数: ${htmlFiles.length}\n`);

  const results: AuditResult[] = [];

  for (const file of htmlFiles) {
    const slug = file.replace('.html', '');
    const filePath = path.join(projectRoot, file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      // タイトルを取得
      const titleElement = document.querySelector('title') || document.querySelector('h1');
      const title = titleElement?.textContent?.trim() || 'タイトル不明';
      
      // 本文テキストを取得
      const bodyText = document.body?.textContent || '';
      const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
      
      // 見出し数をカウント
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingCount = headings.length;
      
      // 内部リンク数をカウント（/posts/ で始まるリンク）
      const links = document.querySelectorAll('a[href]');
      const internalLinkCount = Array.from(links).filter(link => {
        const href = link.getAttribute('href') || '';
        return href.startsWith('/posts/') || href.includes('ieltsconsult.netlify.app/posts/');
      }).length;
      
      // additionsファイルの存在確認
      const additionPath = path.join(additionsDir, `${slug}.mdx`);
      const hasAddition = hasAdditionsDir && fs.existsSync(additionPath);
      
      // PUBLIC_POST_SLUGSを確認（簡易版）
      const { PUBLIC_POST_SET } = await import('../config/content-gate');
      const isPublic = PUBLIC_POST_SET.has(slug);
      
      // 薄いコンテンツフラグ
      const reasons: string[] = [];
      let thinContentFlag = false;
      
      if (wordCount < 800) {
        reasons.push(`文字数が少ない（${wordCount}語）`);
        thinContentFlag = true;
      }
      if (headingCount < 3) {
        reasons.push(`見出しが少ない（${headingCount}個）`);
        thinContentFlag = true;
      }
      if (!hasAddition) {
        reasons.push('additionsファイルが存在しない');
        thinContentFlag = true;
      }
      if (internalLinkCount === 0) {
        reasons.push('内部リンクがない');
      }
      
      results.push({
        slug,
        title: title.substring(0, 60),
        wordCount,
        headingCount,
        internalLinkCount,
        hasAddition,
        isPublic,
        thinContentFlag,
        reasons,
      });
    } catch (error) {
      console.error(`❌ ${file}: エラーが発生しました`, error);
    }
  }

  // 結果をソート（文字数が多い順、見出しが多い順）
  results.sort((a, b) => {
    if (a.hasAddition !== b.hasAddition) {
      return a.hasAddition ? -1 : 1;
    }
    if (a.wordCount !== b.wordCount) {
      return b.wordCount - a.wordCount;
    }
    return b.headingCount - a.headingCount;
  });

  // コンソール出力
  console.log('=== 監査結果 ===\n');
  console.log('📊 統計情報:');
  console.log(`  総記事数: ${results.length}`);
  console.log(`  additionsあり: ${results.filter(r => r.hasAddition).length}`);
  console.log(`  公開設定: ${results.filter(r => r.isPublic).length}`);
  console.log(`  薄いコンテンツ疑い: ${results.filter(r => r.thinContentFlag).length}\n`);

  console.log('📝 記事別詳細:');
  results.forEach((result, index) => {
    const status = result.isPublic ? '✅ 公開' : '❌ 非公開';
    const additionStatus = result.hasAddition ? '✅' : '❌';
    const thinStatus = result.thinContentFlag ? '⚠️' : '✅';
    
    console.log(`\n[${index + 1}] ${result.slug}`);
    console.log(`  タイトル: ${result.title}`);
    console.log(`  状態: ${status} | additions: ${additionStatus} | 品質: ${thinStatus}`);
    console.log(`  文字数: ${result.wordCount}語 | 見出し: ${result.headingCount}個 | 内部リンク: ${result.internalLinkCount}個`);
    if (result.reasons.length > 0) {
      console.log(`  注意点: ${result.reasons.join(', ')}`);
    }
  });

  // 公開候補の推奨
  console.log('\n\n💡 公開候補の推奨:');
  const candidates = results
    .filter(r => r.hasAddition && !r.thinContentFlag && r.wordCount >= 800)
    .slice(0, 15);
  
  console.log(`\n推奨される公開記事（${candidates.length}件）:`);
  candidates.forEach((candidate, index) => {
    console.log(`  ${index + 1}. ${candidate.slug} - ${candidate.title}`);
  });

  // JSON出力
  const outputPath = path.join(projectRoot, 'adsense-audit-result.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n✅ JSON形式の結果を保存しました: ${outputPath}`);
  console.log(`\n💡 推奨記事のslugを config/content-gate.ts の PUBLIC_POST_SLUGS に追加してください。`);
}

main().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
