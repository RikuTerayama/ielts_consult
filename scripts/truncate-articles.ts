import * as fs from 'fs';
import * as path from 'path';

// 記事の設定
const ARTICLES = [
  {
    file: "nee44497523d9.html",
    cutoff: "実践例：「大学教育は重要だ」",
    noteUrl: "https://note.com/ielts_consult/n/nee44497523d9",
  },
  {
    file: "nfabbeb0a262c.html",
    cutoff: "実践例：Plant Defense攻略のポイント",
    noteUrl: "https://note.com/ielts_consult/n/nfabbeb0a262c",
  },
  {
    file: "n963baa68fcd3.html",
    cutoff: "この「日本語で構造化→英語に変換」の3ステップを踏めば、誰でも論理的で伝わりやすい回答を準備できます（高い再現性があります！）。",
    noteUrl: "https://note.com/ielts_consult/n/n963baa68fcd3",
  },
  {
    file: "n380e29ddc2c0.html",
    cutoff: "それでは、筆者が実践して効果を実感したVERSANT攻略のコツを箇条書きで紹介します。どれも即効性重視のテクニックなので、ぜひ明日のテストから試してみてください。",
    noteUrl: "https://note.com/ielts_consult/n/n380e29ddc2c0",
  },
  {
    file: "n997645629932.html",
    cutoff: "✅ 2. As I see it, ～ （私の見方では）",
    noteUrl: "https://note.com/ielts_consult/n/n997645629932",
  },
  {
    file: "ne9d8203dd045.html",
    cutoff: "✅ 2. ..., for the purpose of ～(doing)（〜するという目的で）",
    noteUrl: "https://note.com/ielts_consult/n/ne9d8203dd045",
  },
  {
    file: "n9883aa545907.html",
    cutoff: "✅ 2. At the same time（同時に／しかし一方で）",
    noteUrl: "https://note.com/ielts_consult/n/n9883aa545907",
  },
  {
    file: "n17e52d8f3cbe.html",
    cutoff: "控えめな同意や推測を示すフレーズです。",
    noteUrl: "https://note.com/ielts_consult/n/n17e52d8f3cbe",
  },
  {
    file: "nfd0f297ac1d6.html",
    cutoff: "✅ 2. There is no question in my mind that ～（私は100％こう思います）",
    noteUrl: "https://note.com/ielts_consult/n/nfd0f297ac1d6",
  },
  {
    file: "n92beae39fd80.html",
    cutoff: "🗣️ Q：Do you think stress is a serious problem in modern society?",
    noteUrl: "https://note.com/ielts_consult/n/n92beae39fd80",
  },
  {
    file: "n73ea63a15482.html",
    cutoff: "✅ 2. What I meant to say is...",
    noteUrl: "https://note.com/ielts_consult/n/n73ea63a15482",
  },
  {
    file: "n535bf33165ca.html",
    cutoff: "前述の意見や事実を受けて「だからこそ～だ」と述べることで、自分の主張に説得力を持たせる効果があります。",
    noteUrl: "https://note.com/ielts_consult/n/n535bf33165ca",
  },
  {
    file: "n2cd779121111.html",
    cutoff: "「because of」よりも洗練された響きで、フォーマルすぎず自然に使える万能フレーズです。",
    noteUrl: "https://note.com/ielts_consult/n/n2cd779121111",
  },
  {
    file: "n5e563cd04240.html",
    cutoff: "② For instance（たとえば）",
    noteUrl: "https://note.com/ielts_consult/n/n5e563cd04240",
  },
  {
    file: "n70a885fec234.html",
    cutoff: "2. On the whole（全体として）",
    noteUrl: "https://note.com/ielts_consult/n/n70a885fec234",
  },
  {
    file: "n9a303ab21106.html",
    cutoff: "2. What's more（おまけに）",
    noteUrl: "https://note.com/ielts_consult/n/n9a303ab21106",
  },
  {
    file: "n3200065ec76b.html",
    cutoff: "学術・社会・教育など、トピックごとに語彙が整理されており、スピーキングやライティングの応用力も高まります。",
    noteUrl: "https://note.com/ielts_consult/n/n3200065ec76b",
  },
  {
    file: "ne68beb472a95.html",
    cutoff: "接続詞・チャンク：",
    noteUrl: "https://note.com/ielts_consult/n/ne68beb472a95",
  },
  {
    file: "n15d8a98fb855.html",
    cutoff: "例えばTask 2の議論型エッセイなら、1段落で片方の主張、次の段落でもう一方の主張を述べ、最後に自分の意見をまとめる、といった具合に段落ごとに扱う内容を整理します。",
    noteUrl: "https://note.com/ielts_consult/n/n15d8a98fb855",
  },
  {
    file: "nfd42ac687984.html",
    cutoff: "リスニング音声が流れる前の「解答準備タイム」の使い方次第で、得点率が大きく変わります。",
    noteUrl: "https://note.com/ielts_consult/n/nfd42ac687984",
  },
  {
    file: "n019aaecea296.html",
    cutoff: "初めは難しく感じるかもしれませんが、過去問演習を通じて意識的にこの読み方を練習すれば、徐々にスピードと精度が上がってきます。",
    noteUrl: "https://note.com/ielts_consult/n/n019aaecea296",
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
    // ファイルを読み込み
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 区切り位置を探す
    const cutoffPos = content.indexOf(cutoffText);
    
    if (cutoffPos === -1) {
      console.log(`  ✗ 警告: 区切り位置が見つかりませんでした: ${cutoffText.substring(0, 50)}...`);
      return false;
    }
    
    console.log(`  ✓ 区切り位置を発見: ${cutoffPos}文字目`);
    
    // 区切り位置の直前のhrまたは適切な位置を探す
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
    
    // noteリンクCTAを追加
    const newContent = truncatedContent + createNoteCTA(noteUrl);
    
    // ファイルに書き込み
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
  console.log("記事の切り取りとnoteリンク追加を開始します");
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

