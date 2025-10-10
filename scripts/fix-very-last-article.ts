import * as fs from 'fs';
import * as path from 'path';

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

function main() {
  console.log("=".repeat(60));
  console.log("最後の1記事を処理します");
  console.log("=".repeat(60) + "\n");
  
  const rootDir = path.join(__dirname, '..');
  const filePath = path.join(rootDir, 'n9a303ab21106.html');
  const noteUrl = 'https://note.com/ielts_consult/n/n9a303ab21106';
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // "2. What's more"のh3タグを探す（複数パターン試行）
    const patterns = [
      "2. What's more（おまけに）</h3>",
      "What's more（おまけに）</h3>",
      "What's more（おまけに）",
      "What's more",
    ];
    
    let cutoffPos = -1;
    let matchedPattern = '';
    
    for (const pattern of patterns) {
      cutoffPos = content.indexOf(pattern);
      if (cutoffPos !== -1) {
        matchedPattern = pattern;
        break;
      }
    }
    
    if (cutoffPos !== -1) {
      console.log(`  ✓ パターンで発見: "${matchedPattern}"`);
    }
    
    if (cutoffPos === -1) {
      console.log(`  ✗ 区切り位置が見つかりませんでした`);
      return;
    }
    
    console.log(`  ✓ 区切り位置を発見: ${cutoffPos}文字目`);
    
    // 区切り位置の直前のhrタグを探す
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
    
    console.log("=".repeat(60));
    console.log(`🎉 すべての記事（21件）の処理が完了しました！`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error(`  ✗ エラー: ${error}\n`);
  }
}

main();

