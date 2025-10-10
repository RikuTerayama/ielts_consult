import * as fs from 'fs';
import * as path from 'path';

// 残りの10記事の正確な区切り位置を確認して処理
const ARTICLES = [
  {
    file: "nfabbeb0a262c.html",
    cutoff: "Plant Defense攻略のポイント</h2>",
    noteUrl: "https://note.com/ielts_consult/n/nfabbeb0a262c",
  },
  {
    file: "n963baa68fcd3.html",
    cutoff: "ポイントは難しい英語に頼らず、シンプルな論理と言葉で攻めることです。",
    noteUrl: "https://note.com/ielts_consult/n/n963baa68fcd3",
  },
  {
    file: "n380e29ddc2c0.html",
    cutoff: "ぜひ明日のテストから試してみてください。",
    noteUrl: "https://note.com/ielts_consult/n/n380e29ddc2c0",
  },
  {
    file: "n17e52d8f3cbe.html",
    cutoff: "「まあ、そうかもしれないね」といった柔らかい響きになります。",
    noteUrl: "https://note.com/ielts_consult/n/n17e52d8f3cbe",
  },
  {
    file: "n92beae39fd80.html",
    cutoff: "✅ Band 7.0 レベルの模範回答：",
    noteUrl: "https://note.com/ielts_consult/n/n92beae39fd80",
  },
  {
    file: "n535bf33165ca.html",
    cutoff: "ややフォーマルに結論の妥当性を示したい場面に最適です。",
    noteUrl: "https://note.com/ielts_consult/n/n535bf33165ca",
  },
  {
    file: "n2cd779121111.html",
    cutoff: "フォーマルすぎず自然に使える万能フレーズです。",
    noteUrl: "https://note.com/ielts_consult/n/n2cd779121111",
  },
  {
    file: "n9a303ab21106.html",
    cutoff: "What's more（おまけに）",
    noteUrl: "https://note.com/ielts_consult/n/n9a303ab21106",
  },
  {
    file: "ne68beb472a95.html",
    cutoff: "5W1Hでは last weekend（いつ）、at home/with my family（どこで・誰と） を盛り込んでいます。",
    noteUrl: "https://note.com/ielts_consult/n/ne68beb472a95",
  },
  {
    file: "n15d8a98fb855.html",
    cutoff: "段落内ではトピックセンテンス→サポート文→結論または次へのつなぎという流れを意識すると論理展開が分かりやすくなります。",
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
  console.log(`処理中: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const cutoffPos = content.indexOf(cutoffText);
    
    if (cutoffPos === -1) {
      console.log(`  ✗ 警告: 区切り位置が見つかりませんでした: ${cutoffText.substring(0, 50)}...`);
      // 部分一致を試みる
      const partialMatch = cutoffText.split('</')[0].split('>').pop() || cutoffText;
      const partialPos = content.indexOf(partialMatch);
      if (partialPos === -1) {
        return false;
      }
      console.log(`  ℹ️ 部分一致で処理: "${partialMatch.substring(0, 30)}..."`);
      return truncateAtPosition(filePath, content, partialPos, noteUrl);
    }
    
    return truncateAtPosition(filePath, content, cutoffPos, noteUrl);
  } catch (error) {
    console.error(`  ✗ エラー: ${error}\n`);
    return false;
  }
}

function truncateAtPosition(filePath: string, content: string, cutoffPos: number, noteUrl: string): boolean {
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
}

function main() {
  console.log("=".repeat(60));
  console.log("残りの記事を処理します");
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

