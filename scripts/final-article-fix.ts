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
  console.log("最後の1記事 n9a303ab21106.html を処理します");
  console.log("=".repeat(60) + "\n");
  
  const rootDir = path.join(__dirname, '..');
  const filePath = path.join(rootDir, 'n9a303ab21106.html');
  const noteUrl = 'https://note.com/ielts_consult/n/n9a303ab21106';
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`  ファイルサイズ: ${content.length}文字`);
    
    // 正規表現でWhat's more（アポストロフィの種類を問わない）を探す
    const regex = /2\.\s*What.s\s*more（おまけに）<\/h3>/;
    const match = content.match(regex);
    
    if (!match) {
      console.log(`  ✗ 正規表現でも見つかりませんでした`);
      
      // より広い範囲で検索
      const simpleRegex = /What.s\s*more.*おまけに.*<\/h3>/;
      const simpleMatch = content.match(simpleRegex);
      if (simpleMatch) {
        console.log(`  ✓ 簡易パターンで発見: "${simpleMatch[0].substring(0, 50)}..."`);
        const cutoffPos = content.indexOf(simpleMatch[0]);
        
        // 直前のhrで切断
        const beforeCutoff = content.substring(0, cutoffPos);
        const lastHrPos = beforeCutoff.lastIndexOf('<hr>');
        
        const truncatedContent = lastHrPos > 0 ? content.substring(0, lastHrPos) : content.substring(0, cutoffPos);
        const newContent = truncatedContent + createNoteCTA(noteUrl);
        
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`  ✓ 完了: ${content.length} → ${newContent.length} 文字\n`);
        console.log("=".repeat(60));
        console.log(`🎉 すべての記事（21件）の処理が完了しました！`);
        console.log("=".repeat(60));
        return;
      }
      
      return;
    }
    
    const cutoffPos = content.indexOf(match[0]);
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
    
    console.log("=".repeat(60));
    console.log(`🎉 すべての記事（21件）の処理が完了しました！`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error(`  ✗ エラー: ${error}\n`);
  }
}

main();

