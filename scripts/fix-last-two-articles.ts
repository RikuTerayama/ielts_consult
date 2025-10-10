import * as fs from 'fs';
import * as path from 'path';

// 最後の2記事を処理
const ARTICLES = [
  {
    file: "n535bf33165ca.html",
    cutoff: "結論の妥当性を示したい場面</strong>に最適です。</p>",
    noteUrl: "https://note.com/ielts_consult/n/n535bf33165ca",
  },
  {
    file: "n9a303ab21106.html",
    cutoff: "What's more（おまけに）</h3>",
    noteUrl: "https://note.com/ielts_consult/n/n9a303ab21106",
  },
];

function createNoteCTA(noteUrl: string): string {
  return `<hr>
<h2>📚 続きはnoteで公開中！</h2>
<p>この記事の続きは、より詳しい解説と実践的なテクニックを含めてnoteで公開しています。</p>
<p style="text-align: center; margin: 30px 0;">
<a href="${noteUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 15px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">📖 noteで続きを読む</a>
</p>
<hr>
<p style="text-align: center; color: #666; font-size: 14px;">
💡 より詳しい実践例・フレーズ集・Q&A・学習スケジュールなど、<br>
有料級のコンテンツをnoteで公開中です！
</p>
</body>
</html>`;
}

function truncateArticle(filePath: string, cutoffText: string, noteUrl: string): boolean {
  console.log(`処理中: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let cutoffPos = content.indexOf(cutoffText);
    
    if (cutoffPos === -1) {
      console.log(`  ✗ 警告: 区切り位置が見つかりませんでした`);
      return false;
    }
    
    cutoffPos = cutoffPos + cutoffText.length;
    console.log(`  ✓ 区切り位置を発見: ${cutoffPos}文字目`);
    
    const beforeCutoff = content.substring(0, cutoffPos);
    const lastHrPos = beforeCutoff.lastIndexOf('<hr>');
    
    let truncatedContent: string;
    if (lastHrPos > 0) {
      truncatedContent = content.substring(0, lastHrPos);
      console.log(`  ✓ 最後の<hr>タグの位置で切断: ${lastHrPos}文字目`);
    } else {
      truncatedContent = content.substring(0, cutoffPos);
      console.log(`  ✓ 区切り位置の直前で切断`);
    }
    
    const newContent = truncatedContent + createNoteCTA(noteUrl);
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`  ✓ 完了: ${content.length} → ${newContent.length} 文字\n`);
    
    return true;
  } catch (error) {
    console.error(`  ✗ エラー: ${error}\n`);
    return false;
  }
}

function main() {
  console.log("=".repeat(60));
  console.log("最後の2記事を処理します");
  console.log("=".repeat(60) + "\n");
  
  const rootDir = path.join(__dirname, '..');
  let successCount = 0;
  let failedCount = 0;
  
  for (const article of ARTICLES) {
    const filePath = path.join(rootDir, article.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`✗ ファイルが見つかりません: ${article.file}\n`);
      failedCount++;
      continue;
    }
    
    if (truncateArticle(filePath, article.cutoff, article.noteUrl)) {
      successCount++;
    } else {
      failedCount++;
    }
  }
  
  console.log("=".repeat(60));
  console.log(`完了: 成功 ${successCount}件 / 失敗 ${failedCount}件`);
  console.log(`\n🎉 全21記事の処理が完了しました！`);
  console.log("=".repeat(60));
}

main();

