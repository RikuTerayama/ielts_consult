import * as fs from 'fs';
import * as path from 'path';

// 残りの記事を短いキーフレーズで処理
const ARTICLES = [
  {
    file: "n963baa68fcd3.html",
    cutoff: "シンプルな論理と言葉で攻めることです。</p>",
    noteUrl: "https://note.com/ielts_consult/n/n963baa68fcd3",
  },
  {
    file: "n92beae39fd80.html",
    cutoff: "Band 7.0 レベルの模範回答：</p>",
    noteUrl: "https://note.com/ielts_consult/n/n92beae39fd80",
  },
  {
    file: "n535bf33165ca.html",
    cutoff: "場面に最適です。</p>",
    noteUrl: "https://note.com/ielts_consult/n/n535bf33165ca",
  },
  {
    file: "n2cd779121111.html",
    cutoff: "万能フレーズです。</p>",
    noteUrl: "https://note.com/ielts_consult/n/n2cd779121111",
  },
  {
    file: "n9a303ab21106.html",
    cutoff: "What's more（おまけに）</h3>",
    noteUrl: "https://note.com/ielts_consult/n/n9a303ab21106",
  },
  {
    file: "n15d8a98fb855.html",
    cutoff: "論理展開が分かりやすくなります。</p>",
    noteUrl: "https://note.com/ielts_consult/n/n15d8a98fb855",
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
      // 代替パターンを試す
      const alternativePattern = cutoffText.replace('</p>', '').replace('</h3>', '').replace('</h2>', '');
      cutoffPos = content.indexOf(alternativePattern);
      if (cutoffPos === -1) {
        console.log(`  ✗ 警告: 区切り位置が見つかりませんでした`);
        return false;
      }
      // マッチした箇所の終了タグまで進める
      const afterMatch = content.substring(cutoffPos);
      const tagEnd = afterMatch.indexOf('</p>');
      if (tagEnd !== -1) {
        cutoffPos = cutoffPos + tagEnd + 4; // </p>の長さを加算
      }
    } else {
      cutoffPos = cutoffPos + cutoffText.length;
    }
    
    console.log(`  ✓ 区切り位置を発見: ${cutoffPos}文字目`);
    
    // 区切り位置の後の次のhrタグを探す
    const afterCutoff = content.substring(cutoffPos);
    const nextHrPos = afterCutoff.indexOf('<hr>');
    
    let truncatedContent: string;
    if (nextHrPos !== -1 && nextHrPos < 1000) {
      // 区切り位置の直後にhrがあれば、その直前で切る
      truncatedContent = content.substring(0, cutoffPos);
      console.log(`  ✓ 区切り位置の直後で切断`);
    } else {
      // hrが遠い場合は、区切り位置から少し前のhrを探す
      const beforeCutoff = content.substring(0, cutoffPos);
      const lastHrPos = beforeCutoff.lastIndexOf('<hr>');
      if (lastHrPos > 0) {
        truncatedContent = content.substring(0, lastHrPos);
        console.log(`  ✓ 最後の<hr>タグの位置で切断: ${lastHrPos}文字目`);
      } else {
        truncatedContent = content.substring(0, cutoffPos);
        console.log(`  ✓ 区切り位置の直前で切断`);
      }
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
  console.log("最後の6記事を処理します");
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
  console.log("=".repeat(60));
}

main();

